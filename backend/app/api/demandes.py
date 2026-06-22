from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.sessions import get_db
from app.database.models import User, Demande, DemandeStatus
from app.schemas.demandes import DemandeCreate, DemandeResponse
from app.services.demandes_services import DemandeService
from app.services.crew_services import ECitoyenCrew
from app.auth.dependencies import get_current_user
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

def process_demande_with_crew(db: Session, demande_id: UUID, message: str):
    """
    Tâche de fond pour traiter la demande avec CrewAI
    """
    try:
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
            db_session_factory=get_db,
            demande_id=demande.id,
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