from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.sessions import get_db
from app.database.models import User, Demande, DemandeStatus
from app.schemas.demandes import DemandeCreate, DemandeResponse
from app.services.demandes_services import DemandeService
from app.auth.dependencies import get_current_user
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/demandes",
    tags=["Demandes"],
    responses={
        401: {"description": "Non authentifié"},
        404: {"description": "Demande non trouvée"}
    }
)

def process_demande_with_crew(demande_id: str, message: str):
    """
    Tâche de fond pour traiter la demande avec CrewAI
    """
    try:
        from app.services.crew_services import ECitoyenCrew

        logger.info(f"Traitement CrewAI pour la demande {demande_id}")
        crew = ECitoyenCrew()
        crew_result = crew.process_demande(message)
        
        # Sauvegarder la réponse
        db_session = next(get_db())
        try:
            crew.save_reponse_to_db(db_session, demande_id, crew_result)
            logger.info(f"Réponse CrewAI sauvegardée pour la demande {demande_id}")
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Erreur CrewAI pour demande {demande_id}: {str(e)}")

@router.post(
    "/",
    response_model=DemandeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une nouvelle demande",
    description="Soumet une demande administrative et reçoit une réponse automatique"
)
async def create_demande(
    demande_data: DemandeCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer une nouvelle demande administrative :
    
    - **message** : Description détaillée de votre demande (obligatoire)
    - **categorie** : Catégorie de la demande (optionnel)
    
    Exemples de catégories : CNI, Passeport, Acte de naissance, Permis, etc.
    """
    try:
        # Créer la demande dans la base
        demande = DemandeService.create_demande(db, current_user, demande_data)
        
        # Lancer le traitement CrewAI en arrière-plan
        background_tasks.add_task(
            process_demande_with_crew,
            demande_id=str(demande.id),
            message=demande_data.message
        )
        
        return demande
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erreur création demande: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création de la demande"
        )

@router.get(
    "/",
    response_model=List[DemandeResponse],
    summary="Historique des demandes",
    description="Récupère toutes les demandes du citoyen connecté"
)
def get_demandes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    status_filter: DemandeStatus = None
):
    """
    Récupère l'historique des demandes :
    
    - **skip** : Nombre de demandes à sauter (pagination)
    - **limit** : Nombre maximum de demandes à retourner
    - **status_filter** : Filtrer par statut (en_attente, en_cours, traitee, rejetee)
    """
    demandes = DemandeService.get_user_demandes(
        db, current_user, skip=skip, limit=limit, status=status_filter
    )
    return demandes

@router.get(
    "/{demande_id}",
    response_model=DemandeResponse,
    summary="Détail d'une demande",
    description="Récupère le détail d'une demande spécifique avec sa réponse"
)
def get_demande_detail(
    demande_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère une demande spécifique par son ID
    
    - **demande_id** : Identifiant unique de la demande
    """
    demande = DemandeService.get_demande_detail(db, current_user, demande_id)
    return demande

@router.delete(
    "/{demande_id}",
    summary="Supprimer une demande",
    description="Supprime une demande spécifique"
)
def delete_demande(
    demande_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprime une demande par son ID
    
    - **demande_id** : Identifiant unique de la demande à supprimer
    """
    DemandeService.delete_demande(db, current_user, demande_id)
    return {"message": "Demande supprimée avec succès"}

@router.get(
    "/stats/overview",
    summary="Statistiques des demandes",
    description="Retourne les statistiques des demandes du citoyen"
)
def get_demande_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retourne les statistiques des demandes
    """
    return DemandeService.get_statistics(db, current_user)
# ============================================
# GÉNÉRATION DE RÉPONSE (MOCKÉE)
# ============================================
@router.post("/{demande_id}/generate-response")
def generate_response(
    demande_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Génère une réponse mockée pour la demande"""
    demande = db.query(Demande).filter(
        Demande.id == str(demande_id),
        Demande.user_id == current_user.id
    ).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    # Réponse mockée
    reponse_data = {
        "etapes": [
            "Rendez-vous à la mairie de votre commune",
            "Présentez les documents requis",
            "Payez les frais de traitement",
            "Recevez votre convocation pour la prise d'empreintes",
            "Retirez votre CNI sous 15 jours"
        ],
        "documents": [
            "Extrait d'acte de naissance datant de moins de 3 mois",
            "Pièce d'identité en cours de validité",
            "Justificatif de domicile (facture d'eau ou d'électricité)",
            "2 photos d'identité récentes",
            "Timbre fiscal de 2000 FCFA"
        ],
        "lieux": [
            "Mairie de votre commune",
            "Centre d'enrôlement le plus proche",
            "Agence de l'ONECI (Office National de l'État-Civil et de l'Identification)"
        ],
        "delai": "15 à 30 jours ouvrés",
        "cout": "2 000 FCFA (timbre fiscal) + 3 000 FCFA (frais de dossier)",
        "lettre": f"""
Objet : Demande de Carte Nationale d'Identité

Je soussigné(e), {current_user.nom} {current_user.prenom}, né(e) le ... à ..., 
demeurant à ..., sollicite par la présente l'obtention de ma Carte Nationale d'Identité.

Je vous prie de bien vouloir trouver ci-joint les documents requis pour ma demande.

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de 
mes salutations distinguées.

Fait à ... , le {demande.created_at.strftime('%d/%m/%Y')}

Signature
"""
    }
    
    # Sauvegarder la réponse dans la demande
    demande.reponse = json.dumps(reponse_data, ensure_ascii=False)
    demande.status = DemandeStatus.TRAITEE
    db.commit()
    
    return {
        "id": demande.id,
        "message": demande.message,
        "categorie": demande.categorie,
        "status": demande.status,
        "created_at": demande.created_at,
        "reponse": reponse_data
    }
