import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum as SQLEnum, ForeignKey, Index, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class UserRole(str, enum.Enum):
    CLIENT = "client"


class DemandeStatus(str, enum.Enum):
    EN_ATTENTE = "en_attente"
    EN_COURS = "en_cours"
    TRAITEE = "traitee"
    REJETEE = "rejetee"
    ERREUR = "erreur"


def enum_values(enum_class: type[enum.Enum]) -> list[str]:
    return [member.value for member in enum_class]


def new_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=new_uuid)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    telephone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        SQLEnum(UserRole, values_callable=enum_values, native_enum=False),
        default=UserRole.CLIENT,
        nullable=False,
    )
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    demandes = relationship("Demande", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_users_role", "role"),
        Index("idx_users_nom_prenom", "nom", "prenom"),
    )

    @property
    def full_name(self) -> str:
        return f"{self.prenom} {self.nom}".strip() if self.prenom else self.nom


class Demande(Base):
    __tablename__ = "demandes"

    id = Column(String(36), primary_key=True, default=new_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    categorie = Column(String(100), nullable=True, index=True)
    status = Column(
        SQLEnum(DemandeStatus, values_callable=enum_values, native_enum=False),
        default=DemandeStatus.EN_ATTENTE,
        nullable=False,
        index=True,
    )
    reponse = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="demandes")
    reponses = relationship("Reponse", back_populates="demande", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_demandes_status", "status"),
        Index("idx_demandes_categorie", "categorie"),
        Index("idx_demandes_created_at", "created_at"),
    )


class Reponse(Base):
    __tablename__ = "reponses"

    id = Column(String(36), primary_key=True, default=new_uuid)
    demande_id = Column(String(36), ForeignKey("demandes.id", ondelete="CASCADE"), nullable=False, index=True)
    resume = Column(Text, nullable=False)
    message = Column(Text, default="", nullable=True)
    etapes = Column(Text, nullable=True)
    documents_requis = Column(Text, nullable=True)
    lieu = Column(String(255), nullable=True)
    delai = Column(String(100), nullable=True)
    cout = Column(String(100), nullable=True)
    contacts = Column(Text, nullable=True)
    source = Column(String(50), default="crew_ai", nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    demande = relationship("Demande", back_populates="reponses")

    __table_args__ = (
        Index("idx_reponses_created_at", "created_at"),
    )
