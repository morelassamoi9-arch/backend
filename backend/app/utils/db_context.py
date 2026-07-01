"""Context manager for obtaining a DB session outside of FastAPI's dependency injection.

The background worker ``process_demande_with_crew`` manually calls
``next(get_db())`` three separate times and wraps each in its own
try/finally.  This helper reduces that to a simple ``with`` block.
"""

from contextlib import contextmanager

from sqlalchemy.orm import Session

from app.database.sessions import get_db


@contextmanager
def get_background_db() -> Session:  # type: ignore[misc]
    """Yield a DB session that is automatically closed on exit."""
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()
