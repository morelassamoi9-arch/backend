from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration JWT
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 jours par défaut
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Crée un token JWT d'accès
    
    Args:
        data: Données à encoder (doit contenir "sub" pour l'ID utilisateur)
        expires_delta: Durée de validité personnalisée
    
    Returns:
        str: Token JWT encodé
    """
    to_encode = data.copy()
    
    # Définir l'expiration
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Ajouter les claims standards
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
        "iss": "e-citoyen-ci"
    })
    
    # Encoder le token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Crée un token de rafraîchissement
    
    Args:
        data: Données à encoder
    
    Returns:
        str: Token de rafraîchissement
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    """
    Vérifie et décode un token JWT
    
    Args:
        token: Token JWT à vérifier
        token_type: Type de token attendu ("access" ou "refresh")
    
    Returns:
        Dict ou None: Payload du token si valide, None sinon
    """
    try:
        # Décoder le token
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_exp": True}
        )
        
        # Vérifier le type de token
        if payload.get("type") != token_type:
            return None
        
        return payload
        
    except JWTError as e:
        print(f"Erreur JWT: {str(e)}")
        return None

def decode_token_without_verification(token: str) -> Optional[Dict[str, Any]]:
    """
    Décode un token sans vérifier la signature (pour debug)
    
    Args:
        token: Token JWT
    
    Returns:
        Dict ou None
    """
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_signature": False, "verify_exp": False}
        )
    except JWTError:
        return None

def get_token_expiration(token: str) -> Optional[datetime]:
    """
    Récupère la date d'expiration d'un token
    
    Args:
        token: Token JWT
    
    Returns:
        datetime ou None
    """
    payload = verify_token(token)
    if payload and "exp" in payload:
        return datetime.fromtimestamp(payload["exp"])
    return None

def is_token_expired(token: str) -> bool:
    """
    Vérifie si un token est expiré
    
    Args:
        token: Token JWT
    
    Returns:
        bool: True si expiré
    """
    expiration = get_token_expiration(token)
    if expiration:
        return datetime.utcnow() > expiration
    return True