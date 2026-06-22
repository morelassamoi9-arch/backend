from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.database.sessions import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth_services import AuthService
from app.auth.dependencies import get_current_user
from app.database.models import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentification"],
    responses={
        401: {"description": "Non authentifié"},
        400: {"description": "Requête invalide"}
    }
)

security = HTTPBearer()

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Inscription d'un nouveau citoyen",
    description="Crée un compte citoyen et retourne un token JWT"
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Inscription d'un nouveau citoyen :
    
    - **nom** : Nom de famille (obligatoire)
    - **prenom** : Prénom (optionnel)
    - **email** : Email unique (obligatoire)
    - **password** : Mot de passe (minimum 6 caractères)
    - **telephone** : Numéro de téléphone (optionnel)
    """
    try:
        # Créer l'utilisateur
        user = AuthService.register(db, user_data)
        
        # Connecter automatiquement après inscription
        return AuthService.login(db, UserLogin(
            email=user_data.email,
            password=user_data.password
        ))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'inscription : {str(e)}"
        )

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Connexion d'un citoyen",
    description="Authentifie un citoyen et retourne un token JWT"
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Connexion d'un citoyen existant :
    
    - **email** : Email du compte
    - **password** : Mot de passe
    """
    try:
        return AuthService.login(db, credentials)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la connexion : {str(e)}"
        )

@router.post(
    "/logout",
    summary="Déconnexion",
    description="Déconnecte l'utilisateur (côté client, supprimer le token)"
)
def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Déconnexion - Le client doit supprimer le token JWT
    """
    return {
        "message": "Déconnexion réussie",
        "info": "Veuillez supprimer le token côté client"
    }

@router.get(
    "/verify",
    summary="Vérifier le token",
    description="Vérifie si le token JWT est valide"
)
def verify_token(
    current_user: User = Depends(get_current_user)
):
    """
    Vérifie la validité du token JWT
    """
    return {
        "valid": True,
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "nom": current_user.nom
        }
    }