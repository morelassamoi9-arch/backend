from pydantic import BaseModel, Field


class PasswordChange(BaseModel):
    """Schéma pour le changement de mot de passe (body JSON)"""
    old_password: str = Field(..., min_length=1, description="Ancien mot de passe")
    new_password: str = Field(..., min_length=8, max_length=72, description="Nouveau mot de passe")
