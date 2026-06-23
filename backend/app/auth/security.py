import re
from typing import Tuple

from passlib.context import CryptContext


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password[:72])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:72], hashed_password)


def validate_password_strength(password: str) -> Tuple[bool, str]:
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caracteres"

    if len(password) > 72:
        return False, "Le mot de passe ne doit pas depasser 72 caracteres"

    if not re.search(r"[A-Z]", password):
        return False, "Le mot de passe doit contenir au moins une majuscule"

    if not re.search(r"[a-z]", password):
        return False, "Le mot de passe doit contenir au moins une minuscule"

    if not re.search(r"\d", password):
        return False, "Le mot de passe doit contenir au moins un chiffre"

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Le mot de passe doit contenir au moins un caractere special"

    return True, "Mot de passe valide"


def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def sanitize_string(value: str) -> str:
    value = value.strip()
    return value.replace("<", "&lt;").replace(">", "&gt;")
