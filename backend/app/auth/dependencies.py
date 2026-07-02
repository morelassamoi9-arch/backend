from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.database.sessions import get_db
from app.database.models import User, UserRole
from app.auth.jwt import verify_token, TokenType

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
    import logging
    logger = logging.getLogger("e_citoyen_ci.auth.dependencies")
    from app.database.sessions import DATABASE_URL
    
    token = credentials.credentials
    logger.info(f"[AUTH_DEBUG] Database URL: {DATABASE_URL}")
    logger.info(f"[AUTH_DEBUG] Incoming Token (last 30 chars): ...{token[-30:] if len(token) > 30 else token}")
    
    # Vérifier si le token est dans la blacklist
    from app.database.models import TokenBlacklist
    is_blacklisted = db.query(TokenBlacklist).filter(TokenBlacklist.token == token).first()
    if is_blacklisted:
        logger.warning("[AUTH_DEBUG] Token is blacklisted.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expirée ou déconnectée. Veuillez vous reconnecter.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    payload = verify_token(token, token_type=TokenType.ACCESS)
    logger.info(f"[AUTH_DEBUG] Decoded Payload: {payload}")
    
    if not payload:
        logger.warning("[AUTH_DEBUG] Token verification failed (verify_token returned None).")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Récupérer l'ID utilisateur du token
    user_id = payload.get("sub")
    logger.info(f"[AUTH_DEBUG] sub (user_id) from payload: {user_id}")
    if not user_id:
        logger.warning("[AUTH_DEBUG] User ID missing in payload.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide : ID utilisateur manquant",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Chercher l'utilisateur dans la base
    query = db.query(User).filter(User.id == user_id)
    try:
        compiled_sql = str(query.statement.compile(compile_kwargs={"literal_binds": True}))
        logger.info(f"[AUTH_DEBUG] SQL Query: {compiled_sql}")
    except Exception as sql_err:
        logger.warning(f"[AUTH_DEBUG] Failed to compile query: {sql_err}")
        
    user = query.first()
    
    if not user:
        # Obtenir la liste de tous les utilisateurs présents en base pour le diagnostic de persistance
        all_db_users = db.query(User.id, User.email).all()
        logger.error(f"[AUTH_DEBUG] User NOT found in database. Searched ID: {user_id}")
        logger.error(f"[AUTH_DEBUG] Existing users in database: {all_db_users}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Utilisateur non trouvé. Recherché: {user_id}. Présents: {len(all_db_users)}",
        )
        
    logger.info(f"[AUTH_DEBUG] User successfully retrieved: {user.email} (ID: {user.id})")
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