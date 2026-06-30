from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database.sessions import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth_services import AuthService
from app.auth.dependencies import get_current_user
from app.database.models import User
from app.limiter import limiter
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["Authentification"],
    responses={
        401: {"description": "Non authentifié"},
        400: {"description": "Requête invalide"}
    }
)

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Inscription d'un nouveau citoyen",
    description="Crée un compte citoyen et retourne un token JWT"
)
@limiter.limit("3/minute")
def register(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Inscription d'un nouveau citoyen :
    
    - **nom** : Nom de famille (obligatoire)
    - **prenom** : Prénom (optionnel)
    - **email** : Email unique (obligatoire)
    - **password** : Mot de passe (minimum 8 caractères)
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
        logger.exception("Erreur lors de l'inscription")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur interne est survenue lors de l'inscription"
        )

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Connexion d'un citoyen",
    description="Authentifie un citoyen et retourne un token JWT"
)
@limiter.limit("5/minute")
def login(
    request: Request,
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
        logger.exception("Erreur lors de la connexion")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur interne est survenue lors de la connexion"
        )

from fastapi.security import HTTPAuthorizationCredentials
from app.auth.dependencies import security
from app.auth.jwt import verify_token, TokenType
from app.database.models import TokenBlacklist
from datetime import datetime, timezone

@router.post(
    "/logout",
    summary="Déconnexion",
    description="Déconnecte l'utilisateur et invalide son token côté serveur"
)
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Déconnexion - Le token JWT est invalidé côté serveur
    """
    token = credentials.credentials
    payload = verify_token(token, token_type=TokenType.ACCESS)
    exp = payload.get("exp") if payload else None
    
    if exp:
        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
    else:
        from datetime import timedelta
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        
    # Blacklister le token
    blacklist_entry = TokenBlacklist(token=token, expires_at=expires_at)
    db.add(blacklist_entry)
    
    # Nettoyer les tokens expirés pour éviter l'accumulation
    db.query(TokenBlacklist).filter(TokenBlacklist.expires_at < datetime.now(timezone.utc)).delete()
    
    db.commit()
    
    return {
        "message": "Déconnexion réussie",
        "info": "Token invalidé avec succès"
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