import re
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    nom: str = Field(..., min_length=2, max_length=100, description="Nom de famille")
    prenom: Optional[str] = Field(None, max_length=100, description="Prenom")
    email: EmailStr = Field(..., description="Adresse email unique")
    password: str = Field(..., min_length=8, max_length=72, description="Mot de passe")
    telephone: Optional[str] = Field(None, max_length=20, description="Numero de telephone")

    @field_validator("nom")
    @classmethod
    def nom_must_be_valid(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Le nom ne peut pas etre vide")
        return value

    @field_validator("password")
    @classmethod
    def password_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caracteres")
        if len(value) > 72:
            raise ValueError("Le mot de passe ne doit pas depasser 72 caracteres")
        return value


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Adresse email")
    password: str = Field(..., description="Mot de passe")


class UserUpdate(BaseModel):
    nom: Optional[str] = Field(None, min_length=2, max_length=100)
    prenom: Optional[str] = Field(None, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)

    @field_validator("telephone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value and not re.match(r"^\+?[\d\s-]{8,20}$", value):
            raise ValueError("Format de telephone invalide")
        return value


class UserResponse(BaseModel):
    id: UUID
    nom: str
    prenom: Optional[str]
    email: str
    telephone: Optional[str]
    role: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
