import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="e-Citoyen CI API",
    description="API du copilote multi-agents pour les démarches administratives en Côte d'Ivoire",
    version="0.1.0",
)

# CORS ouvert pour le MVP (web FastShorts + mobile FastShorts appellent
# cette API depuis des domaines différents). À restreindre à des origines
# précises avant toute mise en production réelle au-delà du Challenge.
import os

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
