from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID
import re

class UserCreate(BaseModel):
    """Schéma pour la création d'un utilisateur"""
    nom: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nom de famille",
        example="Kouassi"
    )
    prenom: Optional[str] = Field(
        None,
        max_length=100,
        description="Prénom",
        example="Jean"
    )
    email: EmailStr = Field(
        ...,
        description="Adresse email unique",
        example="jean.kouassi@email.ci"
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Mot de passe (min 6 caractères)",
        example="MotDePasse123!"
    )
    telephone: Optional[str] = Field(
        None,
        max_length=20,
        description="Numéro de téléphone",
        example="0707070707"
    )
    
    @validator('nom')
    def nom_must_be_valid(cls, v):
        if not v.strip():
            raise ValueError('Le nom ne peut pas être vide')
        return v.strip()
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Le mot de passe doit contenir au moins 6 caractères')
        return v

class UserLogin(BaseModel):
    """Schéma pour la connexion"""
    email: EmailStr = Field(
        ...,
        description="Adresse email",
        example="jean.kouassi@email.ci"
    )
    password: str = Field(
        ...,
        description="Mot de passe",
        example="MotDePasse123!"
    )

class UserUpdate(BaseModel):
    """Schéma pour la mise à jour du profil"""
    nom: Optional[str] = Field(None, min_length=2, max_length=100)
    prenom: Optional[str] = Field(None, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)
    
    @validator('telephone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?[\d\s-]{8,20}$', v):
            raise ValueError('Format de téléphone invalide')
        return v

class UserResponse(BaseModel):
    """Schéma pour la réponse utilisateur"""
    id: UUID
    nom: str
    prenom: Optional[str]
    email: str
    telephone: Optional[str]
    role: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    """Schéma pour la réponse d'authentification"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse

class MessageResponse(BaseModel):
    """Schéma pour les messages simples"""
    message: str
    detail: Optional[str] = None