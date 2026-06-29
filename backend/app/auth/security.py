import re
from typing import Tuple

from passlib.context import CryptContext
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)

ph = PasswordHasher()


def hash_password(password: str) -> str:
    """Hache le mot de passe en utilisant Argon2id (recommandé par l'OWASP)"""
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie le mot de passe.
    Supporte à la fois le hachage moderne Argon2id et l'ancien hachage bcrypt (migration progressive).
    """
    if hashed_password.startswith("$argon2"):
        try:
            return ph.verify(hashed_password, plain_password)
        except VerifyMismatchError:
            return False
    else:
        # Fallback pour les comptes existants hachés en bcrypt
        try:
            return pwd_context.verify(plain_password[:72], hashed_password)
        except Exception:
            return False


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


def detect_prompt_injection(text: str) -> bool:
    patterns = [
        r"ignore\s+(all\s+)?previous\s+instructions",
        r"ignore\s+(toutes\s+les\s+)?instructions\s+précédentes",
        r"system\s+prompt",
        r"jailbreak",
        r"you\s+are\s+now\s+a\s+bot",
        r"tu\s+es\s+maintenant\s+un\s+robot",
        r"bypass\s+restrictions",
        r"instructions\s+système"
    ]
    text_lower = text.lower()
    return any(re.search(pat, text_lower) for pat in patterns)
