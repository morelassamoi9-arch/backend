import pytest
from fastapi import status
from app.auth.security import (
    hash_password,
    verify_password,
    validate_password_strength,
    validate_email,
    sanitize_string,
)
from app.auth.jwt import create_access_token, create_refresh_token, verify_token


# --- TESTS COUCHE SECURITE ---

def test_hash_and_verify_password():
    password = "SecuredPassword1!"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_validate_password_strength():
    # Trop court
    is_valid, _ = validate_password_strength("Short1!")
    assert is_valid is False

    # Pas de majuscule
    is_valid, _ = validate_password_strength("lowercase1!")
    assert is_valid is False

    # Pas de minuscule
    is_valid, _ = validate_password_strength("UPPERCASE1!")
    assert is_valid is False

    # Pas de chiffre
    is_valid, _ = validate_password_strength("NoDigits!")
    assert is_valid is False

    # Pas de caractère spécial
    is_valid, _ = validate_password_strength("NoSpecialChar1")
    assert is_valid is False

    # Valide
    is_valid, _ = validate_password_strength("ValidPassword123!")
    assert is_valid is True


def test_validate_email():
    assert validate_email("test@email.com") is True
    assert validate_email("invalid-email") is False
    assert validate_email("test@.com") is False


def test_sanitize_string():
    raw_str = "  Hello <script>alert('xss')</script>  "
    sanitized = sanitize_string(raw_str)
    assert sanitized == "Hello &lt;script&gt;alert('xss')&lt;/script&gt;"


# --- TESTS JWT ---

def test_create_and_verify_jwt_token():
    token_data = {"sub": "user_123", "role": "client"}
    access_token = create_access_token(token_data)
    assert isinstance(access_token, str)

    payload = verify_token(access_token, token_type="access")
    assert payload is not None
    assert payload.get("sub") == "user_123"
    assert payload.get("role") == "client"
    assert payload.get("type") == "access"

    refresh_token = create_refresh_token(token_data)
    payload_ref = verify_token(refresh_token, token_type="refresh")
    assert payload_ref is not None
    assert payload_ref.get("type") == "refresh"


# --- TESTS API AUTHENDPOINTS ---

def test_register_and_login_flow(client):
    user_payload = {
        "nom": "Kouamé",
        "prenom": "Jean",
        "email": "jean.kouame@example.ci",
        "password": "Password123!",
        "telephone": "+2250102030405",
    }

    # Inscription
    reg_response = client.post("/auth/register", json=user_payload)
    assert reg_response.status_code == status.HTTP_201_CREATED
    data = reg_response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "jean.kouame@example.ci"
    assert data["user"]["role"] == "client"

    # Essai de réinscription avec le même email (doit échouer)
    reg_dup_response = client.post("/auth/register", json=user_payload)
    assert reg_dup_response.status_code == status.HTTP_400_BAD_REQUEST

    # Connexion
    login_payload = {
        "email": "jean.kouame@example.ci",
        "password": "Password123!",
    }
    login_response = client.post("/auth/login", json=login_payload)
    assert login_response.status_code == status.HTTP_200_OK
    login_data = login_response.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # Vérification du token
    verify_response = client.get(
        "/auth/verify",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert verify_response.status_code == status.HTTP_200_OK
    assert verify_response.json()["valid"] is True
