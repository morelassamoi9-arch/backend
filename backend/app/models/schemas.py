from pydantic import BaseModel, Field
from typing import Optional, List


class DemandeCitoyen(BaseModel):
    """Corps de la requête envoyée par le frontend (web ou mobile)."""
    message: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Description en langage naturel de la situation du citoyen"
    )


class ReponseCitoyen(BaseModel):
    """Réponse renvoyée au frontend en cas de succès."""
    resume_situation: str
    plan_action: List[str]
    documents_a_apporter: List[str]
    lieu: str
    delai_estime: str
    cout: str
    lettre_generee: bool
    contenu_lettre: Optional[str] = None


class ErreurReponse(BaseModel):
    """Réponse renvoyée au frontend en cas d'échec."""
    erreur: str
