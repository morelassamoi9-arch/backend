"""Shared pytest fixtures for all test modules.

Both test_auth.py and test_demandes.py duplicated the same in-memory
SQLite engine, session fixture, and TestClient fixture.  This conftest
provides them once for the whole test suite.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.database.base import Base
from app.database.sessions import get_db
from app.database.models import User, UserRole
from app.auth.jwt import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="db_session")
def fixture_db_session():
    """Yield a fresh DB session backed by an in-memory SQLite database."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(name="client")
def fixture_client(db_session):
    """Yield a FastAPI TestClient wired to the test DB session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def fixture_test_user(db_session):
    """Create and return a test user in the DB."""
    user = User(
        nom="Soro",
        prenom="Moussa",
        email="moussa.soro@example.ci",
        password_hash="fakehashedpassword",
        role=UserRole.CLIENT,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(name="auth_headers")
def fixture_auth_headers(test_user):
    """Return Authorization headers for the test user."""
    token = create_access_token({"sub": test_user.id, "role": test_user.role.value})
    return {"Authorization": f"Bearer {token}"}
