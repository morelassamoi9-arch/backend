from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import HTTPException, status
from typing import List, Optional
from uuid import UUID
from app.database.models import Demande, Reponse, User, DemandeStatus
from app.schemas.demandes import DemandeCreate

class DemandeService:
    """Service de gestion des demandes"""
    
    @staticmethod
    def create_demande(db: Session, user: User, demande_data: DemandeCreate) -> Demande:
        """
        Crée une nouvelle demande
        
        Args:
            db: Session de base de données
            user: Utilisateur créant la demande
            demande_data: Données de la demande
        
        Returns:
            Demande: La demande créée
        """
        demande = Demande(
            user_id=user.id,
            message=demande_data.message.strip(),
            categorie=demande_data.categorie.strip() if demande_data.categorie else None,
            status=DemandeStatus.EN_ATTENTE
        )
        
        try:
            db.add(demande)
            db.commit()
            db.refresh(demande)
            return demande
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur création demande : {str(e)}"
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
        
        Args:
            db: Session de base de données
            user: L'utilisateur
            skip: Pagination - offset
            limit: Pagination - limite
            status: Filtrer par statut
        
        Returns:
            List[Demande]: Liste des demandes
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
        
        Args:
            db: Session de base de données
            user: L'utilisateur
            demande_id: ID de la demande
        
        Returns:
            Demande: La demande avec ses réponses
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
        
        Args:
            db: Session de base de données
            user: L'utilisateur
            demande_id: ID de la demande
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
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur suppression demande : {str(e)}"
            )
    
    @staticmethod
    def get_statistics(db: Session, user: User) -> dict:
        """
        Calcule les statistiques des demandes d'un utilisateur
        
        Args:
            db: Session de base de données
            user: L'utilisateur
        
        Returns:
            dict: Statistiques
        """
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
