from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from typing import Generator
import os
from dotenv import load_dotenv
import logging

# Charger les variables d'environnement
load_dotenv()

# Configuration du logger
logger = logging.getLogger(__name__)

# URL de la base de données
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://ecitoyen_user:MotDePasse123!@localhost:5432/ecitoyen"
)

# Configuration du moteur SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
    pool_pre_ping=True,  # Vérifier la connexion avant utilisation
    pool_recycle=3600,   # Recycler les connexions après 1 heure
    echo=os.getenv("DB_ECHO", "False").lower() == "true",  # Logs SQL
    connect_args={
        "connect_timeout": 10,
        "application_name": "ecitoyen_ci"
    }
)

# Événements pour le monitoring
@event.listens_for(engine, "connect")
def receive_connect(dbapi_connection, connection_record):
    """Log lors de la connexion à la base"""
    logger.info("Nouvelle connexion à la base de données")

@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_connection, connection_record, connection_proxy):
    """Log lorsqu'une connexion est extraite du pool"""
    logger.debug("Connexion extraite du pool")

@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_connection, connection_record):
    """Log lorsqu'une connexion est retournée au pool"""
    logger.debug("Connexion retournée au pool")

# Créer la factory de sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

def get_db() -> Generator[Session, None, None]:
    """
    Générateur de sessions de base de données
    
    À utiliser comme dépendance FastAPI :
    @app.get("/")
    def route(db: Session = Depends(get_db)):
        ...
    
    Yields:
        Session: Session SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur base de données : {str(e)}")
        raise
    finally:
        db.close()

def get_db_session() -> Session:
    """
    Obtient une session de base de données (usage hors FastAPI)
    
    Returns:
        Session: Session SQLAlchemy
    """
    return SessionLocal()

def check_database_connection() -> bool:
    """
    Vérifie la connexion à la base de données
    
    Returns:
        bool: True si la connexion est OK
    """
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        logger.error(f"Échec connexion DB : {str(e)}")
        return False

def get_database_stats() -> dict:
    """
    Récupère les statistiques du pool de connexions
    
    Returns:
        dict: Statistiques
    """
    pool = engine.pool
    return {
        "size": pool.size(),
        "checkedin": pool.checkedin(),
        "checkedout": pool.checkedout(),
        "overflow": pool.overflow(),
        "total": pool.size() + pool.overflow()
    }