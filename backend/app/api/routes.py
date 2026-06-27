import asyncio
import logging
import re
import time
import os

from fastapi import APIRouter, HTTPException, Request
from app.database.base import Base
from app.database.sessions import engine
from app.database.migrations import ensure_sqlite_schema
from app.api import auth, demandes, users
from app.limiter import limiter
from app.models.schemas import DemandeCitoyen, ReponseCitoyen

logger = logging.getLogger("e_citoyen_ci.api")
router = APIRouter()

MAX_TENTATIVES = 2
ATTENTE_PAR_DEFAUT = 2.0
ATTENTE_MAX = 10.0

# Plafond gratuit Gemini (tokens par jour, estimé).
# Ce compteur est en mémoire process uniquement: il repart à zéro si le
# serveur redémarre, et ne reflète donc pas le vrai compteur Gemini côté
# serveur si le serveur a été relancé entre deux sessions de test.
PLAFOND_TPD_GEMINI = 1_500_000
SEUIL_ALERTE_TPD = 0.8  # alerte à partir de 80% du plafond

_tokens_consommes_session = 0
_requetes_reussies_session = 0


@router.post(
    "/demande",
    response_model=ReponseCitoyen,
    summary="Traite la demande d'un citoyen via le crew multi-agents",
)
@limiter.limit("3/minute")
async def traiter_demande(request: Request, demande: DemandeCitoyen) -> ReponseCitoyen:
    """
    Reçoit le message du citoyen, le fait passer par le crew
    (Agent Accueil -> Agent Documentaliste -> Agent Rédacteur),
    et renvoie la réponse structurée finale.
    """
    global _tokens_consommes_session, _requetes_reussies_session

    resultat = None
    fallback_used = False

    for tentative in range(1, MAX_TENTATIVES + 1):
        try:
            from app.agents.crew import ECitoyenCrew

            # Exécuter kickoff dans un thread pool pour ne pas bloquer l'event loop de FastAPI
            resultat = await asyncio.to_thread(
                ECitoyenCrew().crew().kickoff,
                inputs={"demande_citoyen": demande.message}
            )
            break
        except Exception as exc:
            logger.warning(
                "Tentative %d/%d échouée pour le traitement de la demande citoyenne: %s",
                tentative,
                MAX_TENTATIVES,
                exc,
            )
            
            error_msg = str(exc).lower()
            is_rate_limit = "rate limit" in error_msg or "429" in error_msg or "resource_exhausted" in error_msg or "quota" in error_msg
            
            if tentative == MAX_TENTATIVES:
                # Si Gemini a échoué sur toutes les tentatives, essayer le basculement vers Groq si dispo
                groq_key = os.getenv("GROQ_API_KEY")
                if groq_key and not fallback_used:
                    logger.warning("Détection de surcharge Gemini. Tentative de basculement vers le fournisseur de secours Groq en synchrone...")
                    try:
                        from crewai import LLM
                        fallback_llm = LLM(model="groq/llama-3.3-70b-versatile", api_key=groq_key)
                        resultat = await asyncio.to_thread(
                            ECitoyenCrew(llm_override=fallback_llm).crew().kickoff,
                            inputs={"demande_citoyen": demande.message}
                        )
                        fallback_used = True
                        break
                    except Exception as fallback_exc:
                        logger.error(f"Échec du traitement de secours via Groq : {fallback_exc}")
                        raise HTTPException(
                            status_code=500,
                            detail="Le service d'analyse IA est temporairement indisponible. Veuillez réessayer dans quelques minutes."
                        ) from fallback_exc

                logger.exception(
                    "Échec du traitement de la demande citoyenne après %d tentatives",
                    MAX_TENTATIVES,
                )
                
                if is_rate_limit:
                    error_detail = "Toutes nos excuses, le service d'analyse IA connaît actuellement un fort trafic (limite de requêtes atteinte). Veuillez réessayer dans quelques minutes."
                else:
                    error_detail = "Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer dans un instant."

                raise HTTPException(
                    status_code=500,
                    detail=error_detail
                ) from exc

            delai = extraire_delai_attente(str(exc))
            logger.info("Attente de %.2fs avant la tentative suivante", delai)
            await asyncio.sleep(delai)

    if resultat is None or resultat.pydantic is None:
        logger.error("Le crew n'a pas produit de sortie structurée valide")
        raise HTTPException(
            status_code=500,
            detail="La réponse générée n'a pas pu être structurée correctement. "
            "Veuillez réessayer."
        )

    # --- Suivi de consommation de tokens (cette requête + cumul session) ---
    tokens_cette_requete = resultat.token_usage.total_tokens if resultat.token_usage else 0
    _tokens_consommes_session += tokens_cette_requete
    _requetes_reussies_session += 1

    pourcentage_plafond = (_tokens_consommes_session / PLAFOND_TPD_GEMINI) * 100

    logger.info(
        "TOKENS - Cette requête: %d | Cumul session: %d/%d (%.1f%% du plafond gratuit TPD) | "
        "Requêtes réussies cette session: %d",
        tokens_cette_requete,
        _tokens_consommes_session,
        PLAFOND_TPD_GEMINI,
        pourcentage_plafond,
        _requetes_reussies_session,
    )

    if pourcentage_plafond >= SEUIL_ALERTE_TPD * 100:
        logger.warning(
            "ALERTE QUOTA - %.1f%% du plafond journalier Gemini atteint sur cette session. "
            "Espacez les tests.",
            pourcentage_plafond,
        )

    return ReponseCitoyen(
        resume_situation=resultat.pydantic.resume_situation,
        plan_action=resultat.pydantic.plan_action,
        documents_a_apporter=resultat.pydantic.documents_a_apporter,
        lieu=resultat.pydantic.lieu,
        delai_estime=resultat.pydantic.delai_estime,
        cout=resultat.pydantic.cout,
        lettre_generee=resultat.pydantic.lettre_generee,
        contenu_lettre=resultat.pydantic.contenu_lettre,
    )


def extraire_delai_attente(message_erreur: str) -> float:
    """
    Cherche un délai suggéré par le LLM (Gemini/Groq) dans le message d'erreur, ex:
    "Please try again in 6.97s" ou "Please try again in 430ms".
    """
    if re.search(r"try again in \d+m", message_erreur):
        return ATTENTE_MAX

    match_secondes = re.search(r"try again in ([\d.]+)s", message_erreur)
    if match_secondes:
        return min(float(match_secondes.group(1)) + 0.5, ATTENTE_MAX)

    match_millisecondes = re.search(r"try again in ([\d.]+)ms", message_erreur)
    if match_millisecondes:
        return min((float(match_millisecondes.group(1)) / 1000) + 0.5, ATTENTE_MAX)

    return ATTENTE_PAR_DEFAUT


# Initialiser la base de données SQLite
Base.metadata.create_all(bind=engine)
ensure_sqlite_schema(engine)

# Inclure les routers
router.include_router(auth.router)
router.include_router(demandes.router)
router.include_router(users.router)
