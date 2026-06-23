from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
from app.database.models import User, UserRole
from app.schemas.user import UserCreate, UserLogin, UserUpdate
from app.auth.security import (
    hash_password, 
    verify_password, 
    validate_password_strength,
    validate_email,
    sanitize_string
)
from app.auth.jwt import create_access_token, create_refresh_token

class AuthService:
    """Service d'authentification et gestion des utilisateurs"""
    
    @staticmethod
    def register(db: Session, user_data: UserCreate) -> User:
        """
        Inscrit un nouvel utilisateur
        
        Args:
            db: Session de base de données
            user_data: Données d'inscription
        
        Returns:
            User: L'utilisateur créé
        
        Raises:
            HTTPException: Si l'email existe déjà ou données invalides
        """
        # Nettoyer les données
        email = sanitize_string(user_data.email.lower())
        nom = sanitize_string(user_data.nom)
        prenom = sanitize_string(user_data.prenom) if user_data.prenom else None
        
        # Valider l'email
        if not validate_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format d'email invalide"
            )
        
        # Vérifier si l'email existe déjà
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
        
        # Valider le mot de passe
        is_valid, message = validate_password_strength(user_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # Créer l'utilisateur
        user = User(
            nom=nom,
            prenom=prenom,
            email=email,
            password_hash=hash_password(user_data.password),
            telephone=sanitize_string(user_data.telephone) if user_data.telephone else None,
            role=UserRole.CITOYEN
        )
        
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de la création du compte : {str(e)}"
            )
    
    @staticmethod
    def login(db: Session, credentials: UserLogin) -> dict:
        """
        Authentifie un utilisateur
        
        Args:
            db: Session de base de données
            credentials: Email et mot de passe
        
        Returns:
            dict: Token d'accès et informations utilisateur
        """
        email = sanitize_string(credentials.email.lower())
        
        # Chercher l'utilisateur
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )
        
        # Vérifier si le compte est actif
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ce compte est désactivé"
            )
        
        # Vérifier le mot de passe
        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )
        
        # Créer les tokens
        role_value = user.role.value if hasattr(user.role, "value") else user.role
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": role_value
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user
        }
    
    @staticmethod
    def update_user(db: Session, user_id: str, update_data: UserUpdate) -> User:
        """
        Met à jour les informations d'un utilisateur
        
        Args:
            db: Session de base de données
            user_id: ID de l'utilisateur
            update_data: Données à mettre à jour
        
        Returns:
            User: L'utilisateur mis à jour
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        # Mettre à jour les champs fournis
        if update_data.nom:
            user.nom = sanitize_string(update_data.nom)
        if update_data.prenom is not None:
            user.prenom = sanitize_string(update_data.prenom) if update_data.prenom else None
        if update_data.telephone is not None:
            user.telephone = sanitize_string(update_data.telephone) if update_data.telephone else None
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def change_password(db: Session, user: User, old_password: str, new_password: str) -> None:
        """
        Change le mot de passe d'un utilisateur
        
        Args:
            db: Session de base de données
            user: L'utilisateur
            old_password: Ancien mot de passe
            new_password: Nouveau mot de passe
        """
        # Vérifier l'ancien mot de passe
        if not verify_password(old_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ancien mot de passe incorrect"
            )
        
        # Valider le nouveau mot de passe
        is_valid, message = validate_password_strength(new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # Mettre à jour le mot de passe
        user.password_hash = hash_password(new_password)
        db.commit()
    
    @staticmethod
    def delete_user(db: Session, user: User) -> None:
        """
        Supprime un utilisateur et toutes ses données
        
        Args:
            db: Session de base de données
            user: L'utilisateur à supprimer
        """
        try:
            db.delete(user)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de la suppression : {str(e)}"
            )
