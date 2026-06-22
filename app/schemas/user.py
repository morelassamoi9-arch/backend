from pydantic import BaseModel

class UserCreate(BaseModel):
    nom: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str
