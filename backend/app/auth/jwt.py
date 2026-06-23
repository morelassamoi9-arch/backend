import logging
import os
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from jose import JWTError, jwt

load_dotenv()

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
if not SECRET_KEY:
    if ENVIRONMENT in {"production", "prod"}:
        raise RuntimeError("JWT_SECRET_KEY doit etre defini en production")
    SECRET_KEY = secrets.token_urlsafe(48)
    logger.warning("JWT_SECRET_KEY absent: secret ephemere genere pour l'environnement local")

ALGORITHM = "HS256"
JWT_ISSUER = os.getenv("JWT_ISSUER", "e-citoyen-ci")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
        "iss": JWT_ISSUER,
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh",
        "iss": JWT_ISSUER,
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            issuer=JWT_ISSUER,
            options={"verify_exp": True},
        )

        if payload.get("type") != token_type:
            return None

        return payload

    except JWTError as exc:
        logger.warning("Token JWT invalide: %s", str(exc))
        return None


def decode_token_without_verification(token: str) -> Optional[Dict[str, Any]]:
    if os.getenv("ALLOW_UNVERIFIED_JWT_DECODE", "false").lower() != "true":
        logger.warning("Decodage JWT sans verification refuse")
        return None

    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_signature": False, "verify_exp": False},
        )
    except JWTError:
        return None


def get_token_expiration(token: str) -> Optional[datetime]:
    payload = verify_token(token)
    if payload and "exp" in payload:
        return datetime.fromtimestamp(payload["exp"])
    return None


def is_token_expired(token: str) -> bool:
    expiration = get_token_expiration(token)
    if expiration:
        return datetime.utcnow() > expiration
    return True
