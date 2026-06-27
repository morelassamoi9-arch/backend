import logging
import os

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter
from app.api.routes import router
logging.basicConfig(level=logging.INFO)

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
_is_production = ENVIRONMENT in {"production", "prod"}

app = FastAPI(
    title="e-Citoyen CI API",
    description="API du copilote multi-agents pour les démarches administratives en Côte d'Ivoire",
    version="0.1.0",
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
)

# Rate limiting par IP pour protéger le quota Groq partagé (gratuit,
# fragile - voir mémoire projet). La route /api/demande déclenche un
# appel LLM coûteux à chaque requête: sans limite, un seul client
# (volontaire ou par bug/double-clic) peut épuiser le quota journalier
# avant la démo. Limites définies directement sur la route concernée
# dans app/api/routes.py.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Gestionnaires globaux d'exceptions pour l'anonymisation des erreurs
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logging.getLogger("e_citoyen_ci").warning(f"HTTPException {exc.status_code}: {exc.detail}")
    
    clean_detail = exc.detail
    detail_lower = str(exc.detail).lower()
    is_technical = (
        "traceback" in detail_lower or 
        "line " in detail_lower or 
        "exception" in detail_lower or 
        "error" in detail_lower or 
        "database" in detail_lower or 
        "sqlite" in detail_lower or
        "nameerror" in detail_lower
    )
    
    if exc.status_code >= 500 or is_technical:
        clean_detail = "Une erreur est survenue. Veuillez réessayer ultérieurement."
        
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": clean_detail}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.getLogger("e_citoyen_ci").error(f"Exception non interceptée : {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Une erreur est survenue. Veuillez réessayer ultérieurement."}
    )

# CORS restreint aux origines connues (web local + web déployé, mobile
# si besoin) via la variable d'environnement CORS_ORIGINS (liste séparée
# par des virgules). Valeur par défaut: localhost de dev uniquement.
# En production, le wildcard "*" est interdit pour éviter les fuites de
# cookies/tokens vers des domaines tiers.
origines_autorisees = [
    origine.strip()
    for origine in os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
    ).split(",")
    if origine.strip()
]

if _is_production and "*" in origines_autorisees:
    logging.getLogger("e_citoyen_ci").critical(
        "CORS_ORIGINS contient '*' en production — remplacement par défaut sécurisé"
    )
    origines_autorisees = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origines_autorisees,
    allow_credentials="*" not in origines_autorisees,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Security headers (defense-in-depth)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    if _is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.include_router(router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "e-Citoyen CI API"}
