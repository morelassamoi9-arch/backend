from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
import os
from passlib.context import CryptContext

from app.database.base import Base
from app.database.sessions import engine, get_db
from app.database.models import User, Demande, Reponse

# ============================================
# CONFIGURATION
# ============================================
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "maszxe@cdjdsdk1223344J4Jjckdkekdkedjedekdekdedoedkeffekfefkefkefnfjefejfe")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"])

# Créer les tables
Base.metadata.create_all(bind=engine)

# ============================================
# SCHEMAS
# ============================================
class UserCreate(BaseModel):
    nom: str
    prenom: str = ""
    email: EmailStr
    password: str
    telephone: str = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DemandeCreate(BaseModel):
    message: str
    categorie: str = ""

# ============================================
# HELPERS
# ============================================
def create_token(user_id: str) -> str:
    return jwt.encode(
        {"sub": user_id, "exp": datetime.utcnow() + timedelta(days=7)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def get_user_response(user) -> dict:
    return {
        "id": str(user.id),
        "nom": user.nom,
        "prenom": user.prenom,
        "email": user.email,
        "role": user.role
    }

# ============================================
# APPLICATION
# ============================================
app = FastAPI(title="e-Citoyen CI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# ROUTES
# ============================================

@app.get("/")
def root():
    return {"message": "Bienvenue sur e-Citoyen CI 🇨🇮", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected"}

# ---- AUTH ----
@app.post("/auth/register", status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Vérifier si l'email existe déjà
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    # Créer l'utilisateur
    user = User(
        nom=user_data.nom,
        prenom=user_data.prenom,
        email=user_data.email,
        password_hash=pwd_context.hash(user_data.password),
        telephone=user_data.telephone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Générer le token
    token = create_token(str(user.id))
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": get_user_response(user)
    }

@app.post("/auth/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # Chercher l'utilisateur
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # Vérifier le mot de passe
    if not pwd_context.verify(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # Générer le token
    token = create_token(str(user.id))
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": get_user_response(user)
    }

# ---- DEMANDES ----
@app.post("/demandes/", status_code=201)
def create_demande(demande_data: DemandeCreate, db: Session = Depends(get_db)):
    demande = Demande(
        message=demande_data.message,
        categorie=demande_data.categorie
    )
    db.add(demande)
    db.commit()
    db.refresh(demande)
    
    return {
        "id": str(demande.id),
        "message": demande.message,
        "categorie": demande.categorie,
        "status": demande.status,
        "created_at": str(demande.created_at)
    }

@app.get("/demandes/")
def get_demandes(db: Session = Depends(get_db)):
    demandes = db.query(Demande).order_by(Demande.created_at.desc()).all()
    return [{
        "id": str(d.id),
        "message": d.message,
        "categorie": d.categorie,
        "status": d.status,
        "created_at": str(d.created_at)
    } for d in demandes]

@app.get("/demandes/{demande_id}")
def get_demande(demande_id: str, db: Session = Depends(get_db)):
    demande = db.query(Demande).filter(Demande.id == demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return {
        "id": str(demande.id),
        "message": demande.message,
        "categorie": demande.categorie,
        "status": demande.status,
        "created_at": str(demande.created_at)
    }

# ---- USERS ----
@app.get("/users/me")
def get_me(db: Session = Depends(get_db)):
    users = db.query(User).first()
    if not users:
        return {"message": "Aucun utilisateur trouvé"}
    return get_user_response(users)
