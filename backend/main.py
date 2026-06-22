import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.limiter import limiter
from app.api.routes import router

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="e-Citoyen CI API",
    description="API du copilote multi-agents pour les démarches administratives en Côte d'Ivoire",
    version="0.1.0",
)

# Rate limiting par IP pour protéger le quota Groq partagé (gratuit,
# fragile - voir mémoire projet). La route /api/demande déclenche un
# appel LLM coûteux à chaque requête: sans limite, un seul client
# (volontaire ou par bug/double-clic) peut épuiser le quota journalier
# avant la démo. Limites définies directement sur la route concernée
# dans app/api/routes.py.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS restreint aux origines connues (web local + web déployé, mobile
# si besoin) via la variable d'environnement CORS_ORIGINS (liste séparée
# par des virgules). Valeur par défaut: localhost de dev uniquement.
origines_autorisees = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origines_autorisees,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "ok", "service": "e-Citoyen CI API"}
