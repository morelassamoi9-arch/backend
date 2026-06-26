from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.database.sessions import get_db
from app.database.models import User, UserRole
from app.auth.jwt import verify_token

# Schéma de sécurité Bearer
security = HTTPBearer(
    scheme_name="JWT",
    description="Entrez votre token JWT",
    auto_error=True
)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Récupère l'utilisateur courant à partir du token JWT
    
    Args:
        credentials: Token Bearer de la requête
        db: Session de base de données
    
    Returns:
        User: L'utilisateur authentifié
    
    Raises:
        HTTPException: Si le token est invalide ou l'utilisateur n'existe pas
    """
    token = credentials.credentials
    payload = verify_token(token, token_type="access")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Récupérer l'ID utilisateur du token
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide : ID utilisateur manquant",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Chercher l'utilisateur dans la base
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé",
        )
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Vérifie que l'utilisateur est actif
    
    Args:
        current_user: Utilisateur courant
    
    Returns:
        User: L'utilisateur actif
    
    Raises:
        HTTPException: Si l'utilisateur n'est pas actif
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce compte est désactivé"
        )
    return current_user



async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Récupère l'utilisateur de manière optionnelle (pas d'erreur si pas de token)
    
    Args:
        credentials: Token Bearer optionnel
        db: Session de base de données
    
    Returns:
        User ou None
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None