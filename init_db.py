"""
Script d'initialisation de la base de données
Exécuter depuis : /c/Users/PC/e-citoyen/E-citoyenCI/
Commande : python init_db.py
"""
import sys
import os

# Ajouter backend au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

from app.database.base import Base
from app.database.sessions import engine, DATABASE_URL
from app.database.models import User, Demande, Reponse
from sqlalchemy import inspect
import os

print("=" * 60)
print("🔍 SÉCURITÉ ET CONFIGURATION BASE DE DONNÉES")
print(f"   DATABASE_URL : {DATABASE_URL}")
db_path = DATABASE_URL.replace('sqlite:///', '')
print(f"   Chemin absolu : {os.path.abspath(db_path)}")
print("=" * 60)
print("🗄️  CRÉATION DES TABLES")
print("=" * 60)

# Créer les tables
Base.metadata.create_all(bind=engine)

# Vérifier
inspector = inspect(engine)
tables = inspector.get_table_names()

print(f" {len(tables)} tables créées : {', '.join(tables)}")
for table in tables:
    print(f"    {table}")
print("=" * 60)
