import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, Column, String, Text, ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ecitoyen_user:Manasse05@localhost:5432/ecitoyen")
engine = create_engine(DATABASE_URL, echo=True)
Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
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
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    categorie = Column(String(100))
    status = Column(String(20), default="en_attente")
    user = relationship("User", back_populates="demandes")
    reponses = relationship("Reponse", back_populates="demande", cascade="all, delete-orphan")

class Reponse(BaseModel):
    __tablename__ = "reponses"
    demande_id = Column(UUID(as_uuid=True), ForeignKey("demandes.id", ondelete="CASCADE"), nullable=False)
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
