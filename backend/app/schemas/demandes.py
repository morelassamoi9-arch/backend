import json
from pydantic import BaseModel, Field, validator, field_validator
from typing import Any, Optional, List
from datetime import datetime
from uuid import UUID

class DemandeCreate(BaseModel):
    """Schéma pour la création d'une demande"""
    message: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Description détaillée de votre demande",
        example="Je voudrais obtenir ma carte nationale d'identité. Quelles sont les étapes à suivre ?"
    )
    categorie: Optional[str] = Field(
        None,
        max_length=100,
        description="Catégorie de la demande",
        example="CNI"
    )
    
    @validator('message')
    def message_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Le message ne peut pas être vide')
        if len(v.strip()) < 10:
            raise ValueError('Le message doit contenir au moins 10 caractères')
        return v.strip()
    
    @validator('categorie')
    def categorie_format(cls, v):
        if v:
            v = v.strip().upper()
            if len(v) > 100:
                raise ValueError('La catégorie ne doit pas dépasser 100 caractères')
        return v

class ReponseSchema(BaseModel):
    """Schéma pour une réponse IA"""
    id: UUID
    resume: str
    etapes: Optional[str] = None  # JSON string
    documents_requis: Optional[str] = None  # JSON string
    lieu: Optional[str] = None
    delai: Optional[str] = None
    cout: Optional[str] = None
    contacts: Optional[str] = None  # JSON string
    source: Optional[str] = "crew_ai"
    created_at: datetime
    
    class Config:
        from_attributes = True

class DemandeResponse(BaseModel):
    """Schéma pour la réponse d'une demande"""
    id: UUID
    user_id: Optional[UUID] = None
    message: str
    categorie: Optional[str] = None
    status: str
    reponse: Optional[Any] = None
    created_at: datetime
    updated_at: datetime
    reponses: Optional[List[ReponseSchema]] = []

    @field_validator("reponse", mode="before")
    @classmethod
    def parse_reponse_json(cls, value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return value
    
    class Config:
        from_attributes = True

class DemandeStats(BaseModel):
    """Schéma pour les statistiques des demandes"""
    total_demandes: int
    demandes_en_attente: int
    demandes_en_cours: int
    demandes_traitees: int
    demandes_rejetees: int
    demandes_erreur: Optional[int] = 0
    par_categorie: Optional[dict] = {}
    derniere_activite: Optional[datetime] = None
