import pytest
from unittest.mock import patch
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.database.base import Base
from app.database.sessions import get_db
from app.database.models import User, UserRole, DemandeStatus
from app.auth.jwt import create_access_token
from app.services.demandes_services import DemandeService
from app.schemas.demandes import DemandeCreate

# Configurer SQLite en mémoire pour les tests
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="db_session")
def fixture_db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(name="test_user")
def fixture_test_user(db_session):
    user = User(
        nom="Soro",
        prenom="Moussa",
        email="moussa.soro@example.ci",
        password_hash="fakehashedpassword",
        role=UserRole.CLIENT,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(name="auth_headers")
def fixture_auth_headers(test_user):
    token = create_access_token({"sub": test_user.id, "role": test_user.role.value})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="client")
def fixture_client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# --- TESTS SERVICES ---

def test_create_and_get_demande_service(db_session, test_user):
    demande_in = DemandeCreate(
        message="Je cherche à déclarer la naissance de mon fils.",
        categorie="NAISSANCE",
    )
    # Créer
    demande = DemandeService.create_demande(db_session, test_user, demande_in)
    assert demande.id is not None
    assert demande.user_id == test_user.id
    assert demande.message == "Je cherche à déclarer la naissance de mon fils."
    assert demande.status == DemandeStatus.EN_ATTENTE

    # Lire
    demandes = DemandeService.get_user_demandes(db_session, test_user)
    assert len(demandes) == 1
    assert demandes[0].id == demande.id

    # Détails
    detail = DemandeService.get_demande_detail(db_session, test_user, demande.id)
    assert detail.id == demande.id

    # Stats
    stats = DemandeService.get_statistics(db_session, test_user)
    assert stats["total_demandes"] == 1
    assert stats["demandes_en_attente"] == 1


# --- TESTS API ENDPOINTS ---

@patch("app.api.demandes.process_demande_with_crew")
def test_create_demande_endpoint(mock_process, client, auth_headers):
    payload = {
        "message": "Besoin d'aide pour faire mon passeport ivoirien.",
        "categorie": "PASSEPORT",
    }
    response = client.post("/demandes/", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["message"] == "Besoin d'aide pour faire mon passeport ivoirien."
    assert data["categorie"] == "PASSEPORT"
    assert data["status"] == "en_attente"
    assert mock_process.called is True


def test_get_demandes_endpoint(client, auth_headers):
    # D'abord créer une demande (sans patch pour simplifier)
    payload = {
        "message": "Besoin d'aide pour faire mon passeport ivoirien.",
        "categorie": "PASSEPORT",
    }
    with patch("app.api.demandes.process_demande_with_crew"):
        client.post("/demandes/", json=payload, headers=auth_headers)

    response = client.get("/demandes/", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["categorie"] == "PASSEPORT"


def test_get_stats_overview_endpoint(client, auth_headers):
    response = client.get("/demandes/stats/overview", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_demandes" in data
    assert "demandes_en_attente" in data


def test_global_exception_handler_sanitization(client, auth_headers):
    with patch("app.services.demandes_services.DemandeService.get_statistics", side_effect=RuntimeError("Secret database engine failure: name 'sqlite' is not defined")):
        response = client.get("/demandes/stats/overview", headers=auth_headers)
        assert response.status_code == 500
        data = response.json()
        assert data["detail"] == "Une erreur est survenue. Veuillez réessayer ultérieurement."
        detail_str = str(data).lower()
        assert "sqlite" not in detail_str
        assert "runtimeerror" not in detail_str
        assert "secret database" not in detail_str


def test_deterministic_fallback_on_llm_failure(db_session, test_user):
    from app.api.demandes import process_demande_with_crew
    from app.database.models import Demande, DemandeStatus
    import json
    
    # 1. Créer une demande
    demande_in = DemandeCreate(
        message="Je veux faire renouveler ma carte d'identité (cni) s'il vous plaît.",
        categorie="CNI"
    )
    demande = DemandeService.create_demande(db_session, test_user, demande_in)
    assert demande.status == DemandeStatus.EN_ATTENTE
    
    # 2. Simuler un échec complet de l'IA (Gemini et Groq lèvent des exceptions)
    with patch("app.agents.crew.ECitoyenCrew.crew") as mock_crew:
        mock_crew.side_effect = RuntimeError("All AI models are overloaded")
        
        # Lancer le traitement
        process_demande_with_crew(str(demande.id), demande.message)
        
    # Recharger la demande depuis la base
    db_session.refresh(demande)
    
    # 3. Vérifier que la demande a été traitée avec succès grâce au fallback local
    assert demande.status == DemandeStatus.TRAITEE
    reponse_data = json.loads(demande.reponse)
    assert "cni" in reponse_data["resume"].lower() or "carte nationale" in reponse_data["resume"].lower()
    assert len(reponse_data["etapes"]) > 0
    assert "5 000 FCFA" in reponse_data["cout"]

