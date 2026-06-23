from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecitoyen.db")

is_sqlite = DATABASE_URL.startswith("sqlite")
is_postgresql = DATABASE_URL.startswith(("postgresql://", "postgresql+"))

if is_sqlite:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=os.getenv("DB_ECHO", "False").lower() == "true",
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
        max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=os.getenv("DB_ECHO", "False").lower() == "true",
        connect_args=(
            {"connect_timeout": 10, "application_name": "ecitoyen_ci"}
            if is_postgresql
            else {}
        ),
    )


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if not is_sqlite:
        return

    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
