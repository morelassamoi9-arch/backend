import os
import uuid
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Text, ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import declarative_base, relationship

# Résoudre le chemin absolu du fichier .env du backend
backend_dir = Path(__file__).resolve().parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

# Fallback sur SQLite en dev local
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecitoyen.db")

# Assurer que le chemin de la base de données SQLite est absolu et relatif au dossier backend
if DATABASE_URL.startswith("sqlite:///"):
    db_file = DATABASE_URL.replace("sqlite:///./", "").replace("sqlite:///", "")
    if not os.path.isabs(db_file):
        DATABASE_URL = f"sqlite:///{backend_dir / db_file}"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=True
)
Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class User(BaseModel):
    __tablename__ = "users"
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="citoyen")
    is_active = Column(Boolean, default=True)
    demandes = relationship("Demande", back_populates="user", cascade="all, delete-orphan")

class Demande(BaseModel):
    __tablename__ = "demandes"
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    categorie = Column(String(100))
    status = Column(String(20), default="en_attente")
    user = relationship("User", back_populates="demandes")
    reponses = relationship("Reponse", back_populates="demande", cascade="all, delete-orphan")

class Reponse(BaseModel):
    __tablename__ = "reponses"
    demande_id = Column(String(36), ForeignKey("demandes.id", ondelete="CASCADE"), nullable=False)
    resume = Column(Text, nullable=False)
    etapes = Column(Text)
    lieu = Column(String(255))
    delai = Column(String(100))
    cout = Column(String(100))
    demande = relationship("Demande", back_populates="reponses")

print("Création des tables...")
Base.metadata.create_all(bind=engine)
from sqlalchemy import inspect
tables = inspect(engine).get_table_names()
print(f"\n TABLES CRÉÉES : {tables}")
