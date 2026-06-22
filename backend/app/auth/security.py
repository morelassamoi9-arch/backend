from passlib.context import CryptContext
from typing import Tuple
import re

# Configuration du contexte de hachage
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Nombre de rounds pour bcrypt
)

def hash_password(password: str) -> str:
    """
    Hash un mot de passe en utilisant bcrypt
    
    Args:
        password: Mot de passe en clair
    
    Returns:
        str: Hash du mot de passe
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie un mot de passe par rapport à son hash
    
    Args:
        plain_password: Mot de passe en clair
        hashed_password: Hash à vérifier
    
    Returns:
        bool: True si le mot de passe correspond
    """
    return pwd_context.verify(plain_password, hashed_password)

def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Valide la force d'un mot de passe
    
    Args:
        password: Mot de passe à valider
    
    Returns:
        Tuple[bool, str]: (valide, message)
    """
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"
    
    if len(password) > 128:
        return False, "Le mot de passe ne doit pas dépasser 128 caractères"
    
    if not re.search(r"[A-Z]", password):
        return False, "Le mot de passe doit contenir au moins une majuscule"
    
    if not re.search(r"[a-z]", password):
        return False, "Le mot de passe doit contenir au moins une minuscule"
    
    if not re.search(r"\d", password):
        return False, "Le mot de passe doit contenir au moins un chiffre"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Le mot de passe doit contenir au moins un caractère spécial"
    
    return True, "Mot de passe valide"

def validate_email(email: str) -> bool:
    """
    Valide le format d'un email
    
    Args:
        email: Email à valider
    
    Returns:
        bool: True si l'email est valide
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def sanitize_string(value: str) -> str:
    """
    Nettoie une chaîne de caractères
    
    Args:
        value: Chaîne à nettoyer
    
    Returns:
        str: Chaîne nettoyée
    """
    # Supprimer les espaces en début et fin
    value = value.strip()
    # Échapper les caractères HTML basiques
    value = value.replace("<", "&lt;").replace(">", "&gt;")
    return value