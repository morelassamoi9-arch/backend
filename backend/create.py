from app.database.base import Base
from app.database.sessions import engine
from app.database.models import User, Demande, Reponse
from sqlalchemy import inspect

Base.metadata.create_all(bind=engine)
tables = inspect(engine).get_table_names()
print(f'Tables créées : {tables}')
