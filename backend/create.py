from sqlalchemy import inspect

from app.database.base import Base
from app.database.migrations import ensure_sqlite_schema
from app.database.models import Demande, Reponse, User
from app.database.sessions import engine


Base.metadata.create_all(bind=engine)
ensure_sqlite_schema(engine)

tables = inspect(engine).get_table_names()
print(f"Tables creees : {tables}")
