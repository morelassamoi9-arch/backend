from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List
from app.database.sessions import get_db
from app.database.models import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.password import PasswordChange
from app.auth.dependencies import get_current_user
from app.services.auth_services import AuthService
from app.limiter import limiter

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
@limiter.limit("5/minute")
def change_password(
    request: Request,
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Changer le mot de passe :
    
    - **old_password** : Ancien mot de passe
    - **new_password** : Nouveau mot de passe (min 8 caractères)
    """
    AuthService.change_password(db, current_user, password_data.old_password, password_data.new_password)
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
