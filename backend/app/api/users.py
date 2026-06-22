from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.sessions import get_db
from app.database.models import User, UserRole
from app.schemas.user import UserResponse, UserUpdate
from app.auth.dependencies import get_current_user
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/users",
    tags=["Utilisateurs"],
    responses={
        401: {"description": "Non authentifié"},
        403: {"description": "Accès interdit"},
        404: {"description": "Utilisateur non trouvé"}
    }
)

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Mon profil",
    description="Récupère le profil du citoyen connecté"
)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Retourne les informations du profil connecté
    """
    return current_user

@router.put(
    "/me",
    response_model=UserResponse,
    summary="Modifier mon profil",
    description="Met à jour les informations du profil connecté"
)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Modifier les informations du profil :
    
    - **nom** : Nouveau nom
    - **prenom** : Nouveau prénom
    - **telephone** : Nouveau téléphone
    """
    updated_user = AuthService.update_user(db, current_user.id, user_update)
    return updated_user

@router.put(
    "/me/password",
    summary="Changer mon mot de passe",
    description="Change le mot de passe du citoyen connecté"
)
def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Changer le mot de passe :
    
    - **old_password** : Ancien mot de passe
    - **new_password** : Nouveau mot de passe (min 6 caractères)
    """
    AuthService.change_password(db, current_user, old_password, new_password)
    return {"message": "Mot de passe modifié avec succès"}

@router.delete(
    "/me",
    summary="Supprimer mon compte",
    description="Supprime définitivement le compte du citoyen"
)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprime définitivement le compte et toutes les données associées
    """
    AuthService.delete_user(db, current_user)
    return {"message": "Compte supprimé avec succès"}

# Routes Admin (optionnel pour le MVP)
@router.get(
    "/",
    response_model=List[UserResponse],
    summary="[ADMIN] Liste des utilisateurs",
    description="Liste tous les utilisateurs (admin seulement)"
)
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """
    Liste tous les utilisateurs - Réservé aux administrateurs
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    
    users = db.query(User).offset(skip).limit(limit).all()
    return users