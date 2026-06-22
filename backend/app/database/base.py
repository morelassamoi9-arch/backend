from sqlalchemy.orm import declarative_base  
from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Base déclarative pour tous les modèles
Base = declarative_base()

class BaseModel(Base):
    """
    Modèle de base abstrait pour tous les modèles
    
    Fournit les colonnes communes :
    - id : UUID unique
    - created_at : Date de création
    - updated_at : Date de dernière modification
    """
    __abstract__ = True
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
        comment="Identifiant unique universel"
    )
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Date de création"
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Date de dernière modification"
    )
    
    def to_dict(self):
        """
        Convertit le modèle en dictionnaire
        """
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def __repr__(self):
        return f"<{self.__class__.__name__} {self.id}>"