from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import HTTPException, status
from typing import List, Optional
from uuid import UUID
import logging

from app.database.models import Demande, Reponse, User, DemandeStatus
from app.schemas.demandes import DemandeCreate
from app.auth.security import sanitize_string

logger = logging.getLogger(__name__)

class DemandeService:
    """Service de gestion des demandes"""
    
    @staticmethod
    def create_demande(db: Session, user: User, demande_data: DemandeCreate) -> Demande:
        """
        Crée une nouvelle demande dans la base de données.
        """
        # Sanitization (H07)
        message = sanitize_string(demande_data.message)
        categorie = sanitize_string(demande_data.categorie) if demande_data.categorie else None
        
        demande = Demande(
            user_id=user.id,
            message=message,
            categorie=categorie,
            status=DemandeStatus.EN_ATTENTE
        )
        
        try:
            db.add(demande)
            db.commit()
            db.refresh(demande)
            return demande
        except Exception as e:
            db.rollback()
            logger.exception("Erreur lors de la création de la demande")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors de la création de la demande"
            )
            
    @staticmethod
    def get_user_demandes(
        db: Session,
        user: User,
        skip: int = 0,
        limit: int = 20,
        status: Optional[DemandeStatus] = None
    ) -> List[Demande]:
        """
        Récupère les demandes d'un utilisateur
        """
        query = db.query(Demande).filter(Demande.user_id == user.id)
        
        if status:
            query = query.filter(Demande.status == status)
        
        return query.order_by(desc(Demande.created_at))\
                   .offset(skip)\
                   .limit(limit)\
                   .all()
                   
    @staticmethod
    def get_demande_detail(db: Session, user: User, demande_id: UUID) -> Demande:
        """
        Récupère le détail d'une demande
        """
        demande = db.query(Demande).filter(
            Demande.id == str(demande_id),
            Demande.user_id == user.id
        ).first()
        
        if not demande:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Demande non trouvée"
            )
        
        return demande
        
    @staticmethod
    def delete_demande(db: Session, user: User, demande_id: UUID) -> None:
        """
        Supprime une demande
        """
        demande = db.query(Demande).filter(
            Demande.id == str(demande_id),
            Demande.user_id == user.id
        ).first()
        
        if not demande:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Demande non trouvée"
            )
            
        try:
            db.delete(demande)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.exception("Erreur lors de la suppression de la demande")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors de la suppression de la demande"
            )
            
    @staticmethod
    def get_statistics(db: Session, user: User) -> dict:
        """
        Calcule les statistiques des demandes d'un utilisateur
        """
        try:
            stats = {}
            
            # Total des demandes
            stats["total_demandes"] = db.query(Demande).filter(
                Demande.user_id == user.id
            ).count()
            
            # Par statut
            for status_enum in DemandeStatus:
                count = db.query(Demande).filter(
                    Demande.user_id == user.id,
                    Demande.status == status_enum
                ).count()
                stats[f"demandes_{status_enum.value}"] = count
                
            # Par catégorie
            categories = db.query(
                Demande.categorie,
                func.count(Demande.id)
            ).filter(
                Demande.user_id == user.id,
                Demande.categorie.isnot(None)
            ).group_by(Demande.categorie).all()
            
            stats["par_categorie"] = {cat: count for cat, count in categories}
            
            # Dernière activité
            derniere_demande = db.query(Demande).filter(
                Demande.user_id == user.id
            ).order_by(desc(Demande.created_at)).first()
            
            stats["derniere_activite"] = derniere_demande.created_at if derniere_demande else None
            
            return stats
        except Exception as e:
            logger.exception("Erreur lors du calcul des statistiques")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors du calcul des statistiques"
            )
