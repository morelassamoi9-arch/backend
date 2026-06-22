from pydantic import BaseModel
from datetime import datetime

class DemandeCreate(BaseModel):
    message: str


class DemandeResponse(BaseModel):
    id: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
