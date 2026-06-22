from sqlalchemy import (
    Column, String, Text, ForeignKey, 
    Enum as SQLEnum, Index, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.database.base import BaseModel

# ============================================
# ÉNUMÉRATIONS
# ============================================

class UserRole(str, enum.Enum):
    """Rôles des utilisateurs"""
    CITOYEN = "citoyen"
    ADMIN = "admin"
    AGENT = "agent"

class DemandeStatus(str, enum.Enum):
    """Statuts des demandes"""
    EN_ATTENTE = "en_attente"
    EN_COURS = "en_cours"
    TRAITEE = "traitee"
    REJETEE = "rejetee"

# ============================================
# MODÈLES
# ============================================

class User(BaseModel):
    """
    Modèle Utilisateur
    
    Stocke les informations des citoyens et agents
    """
    __tablename__ = "users"
    
    # Informations personnelles
    nom = Column(
        String(100),
        nullable=False,
        comment="Nom de famille"
    )
    prenom = Column(
        String(100),
        nullable=True,
        comment="Prénom"
    )
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Adresse email unique"
    )
    telephone = Column(
        String(20),
        nullable=True,
        comment="Numéro de téléphone"
    )
    
    # Authentification
    password_hash = Column(
        String(255),
        nullable=False,
        comment="Hash du mot de passe (bcrypt)"
    )
    
    # Rôle et statut
    role = Column(
        SQLEnum(UserRole),
        default=UserRole.CITOYEN,
        nullable=False,
        comment="Rôle de l'utilisateur"
    )
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Compte actif ou désactivé"
    )
    
    # Relations
    demandes = relationship(
        "Demande",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    
    # Index
    __table_args__ = (
        Index('idx_users_email', 'email'),
        Index('idx_users_role', 'role'),
        Index('idx_users_nom_prenom', 'nom', 'prenom'),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', nom='{self.nom}')>"
    
    @property
    def full_name(self) -> str:
        """Nom complet de l'utilisateur"""
        if self.prenom:
            return f"{self.prenom} {self.nom}"
        return self.nom


class Demande(BaseModel):
    """
    Modèle Demande
    
    Stocke les demandes administratives des citoyens
    """
    __tablename__ = "demandes"
    
    # Clé étrangère vers l'utilisateur
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID de l'utilisateur"
    )
    
    # Contenu de la demande
    message = Column(
        Text,
        nullable=False,
        comment="Contenu de la demande"
    )
    categorie = Column(
        String(100),
        nullable=True,
        index=True,
        comment="Catégorie de la demande (CNI, Passeport, etc.)"
    )
    
    # Statut
    status = Column(
        SQLEnum(DemandeStatus),
        default=DemandeStatus.EN_ATTENTE,
        nullable=False,
        index=True,
        comment="Statut de la demande"
    )
    
    # Relations
    user = relationship(
        "User",
        back_populates="demandes"
    )
    reponses = relationship(
        "Reponse",
        back_populates="demande",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    
    # Index
    __table_args__ = (
        Index('idx_demandes_user_id', 'user_id'),
        Index('idx_demandes_status', 'status'),
        Index('idx_demandes_categorie', 'categorie'),
        Index('idx_demandes_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Demande(id={self.id}, status='{self.status}', categorie='{self.categorie}')>"


class Reponse(BaseModel):
    """
    Modèle Réponse IA
    
    Stocke les réponses générées par CrewAI
    """
    __tablename__ = "reponses"
    
    # Clé étrangère vers la demande
    demande_id = Column(
        UUID(as_uuid=True),
        ForeignKey("demandes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID de la demande associée"
    )
    
    # Contenu de la réponse
    resume = Column(
        Text,
        nullable=False,
        comment="Résumé de la réponse"
    )
    etapes = Column(
        Text,
        nullable=True,
        comment="Étapes à suivre (JSON)"
    )
    documents_requis = Column(
        Text,
        nullable=True,
        comment="Documents requis (JSON)"
    )
    lieu = Column(
        String(255),
        nullable=True,
        comment="Lieu de la démarche"
    )
    delai = Column(
        String(100),
        nullable=True,
        comment="Délai estimé"
    )
    cout = Column(
        String(100),
        nullable=True,
        comment="Coût estimé"
    )
    contacts = Column(
        Text,
        nullable=True,
        comment="Contacts utiles (JSON)"
    )
    
    # Source de la réponse
    source = Column(
        String(50),
        default="crew_ai",
        comment="Source de la réponse (crew_ai, manuelle)"
    )
    
    # Relation
    demande = relationship(
        "Demande",
        back_populates="reponses"
    )
    
    # Index
    __table_args__ = (
        Index('idx_reponses_demande_id', 'demande_id'),
        Index('idx_reponses_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Reponse(id={self.id}, demande_id={self.demande_id})>"

# class User(Base):
#     __tablename__ = "users"

#     id = Column(UUID)
#     nom = Column(String)
#     email = Column(String, unique=True)
#     password_hash = Column(String)
#     created_at = Column(DateTime)