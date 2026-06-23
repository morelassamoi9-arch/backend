import logging
import re
import time

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

# Plafond gratuit Groq pour llama-3.3-70b-versatile (tokens par jour).
# Ce compteur est en mémoire process uniquement: il repart à zéro si le
# serveur redémarre, et ne reflète donc pas le vrai compteur Groq côté
# serveur si le serveur a été relancé entre deux sessions de test.
# À utiliser comme indicateur de tendance pendant une session continue,
# pas comme source de vérité absolue sur le quota restant.
PLAFOND_TPD_GROQ = 100_000
SEUIL_ALERTE_TPD = 0.8  # alerte à partir de 80% du plafond

_tokens_consommes_session = 0
_requetes_reussies_session = 0


@router.post(
    "/demande",
    response_model=ReponseCitoyen,
    summary="Traite la demande d'un citoyen via le crew multi-agents",
)
@limiter.limit("3/minute")
def traiter_demande(request: Request, demande: DemandeCitoyen) -> ReponseCitoyen:
    """
    Reçoit le message du citoyen, le fait passer par le crew
    (Agent Accueil -> Agent Documentaliste -> Agent Rédacteur),
    et renvoie la réponse structurée finale.

    Inclut un retry applicatif (MAX_TENTATIVES) et un suivi de
    consommation de tokens en mémoire process, pour visibiliser
    l'approche du plafond gratuit Groq (100000 tokens/jour) avant
    qu'il ne bloque une démo.
    """
    global _tokens_consommes_session, _requetes_reussies_session

    resultat = None

    for tentative in range(1, MAX_TENTATIVES + 1):
        try:
            from app.agents.crew import ECitoyenCrew

            resultat = ECitoyenCrew().crew().kickoff(
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
            if tentative == MAX_TENTATIVES:
                logger.exception(
                    "Échec du traitement de la demande citoyenne après %d tentatives",
                    MAX_TENTATIVES,
                )
                raise HTTPException(
                    status_code=500,
                    detail="Une erreur est survenue lors du traitement de votre demande. "
                    "Veuillez réessayer dans un instant."
                ) from exc

            delai = extraire_delai_attente(str(exc))
            logger.info("Attente de %.2fs avant la tentative suivante", delai)
            time.sleep(delai)

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

    pourcentage_plafond = (_tokens_consommes_session / PLAFOND_TPD_GROQ) * 100

    logger.info(
        "TOKENS - Cette requête: %d | Cumul session: %d/%d (%.1f%% du plafond gratuit TPD) | "
        "Requêtes réussies cette session: %d",
        tokens_cette_requete,
        _tokens_consommes_session,
        PLAFOND_TPD_GROQ,
        pourcentage_plafond,
        _requetes_reussies_session,
    )

    if pourcentage_plafond >= SEUIL_ALERTE_TPD * 100:
        logger.warning(
            "ALERTE QUOTA - %.1f%% du plafond journalier Groq atteint sur cette session "
            "(compteur en mémoire, peut sous-estimer si le serveur a déjà tourné aujourd'hui). "
            "Espacez les tests ou activez le tier Developer Groq.",
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
    Cherche un délai suggéré par Groq dans le message d'erreur, ex:
    "Please try again in 6.97s" ou "Please try again in 430ms".
    Pour les délais en minutes (ex: "7m6.816s", cas du plafond TPD),
    retourne ATTENTE_MAX car il est inutile de faire patienter un
    citoyen plusieurs minutes - mieux vaut échouer proprement.
    Retourne ATTENTE_PAR_DEFAUT si rien n'est trouvé.
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

# Routers Manassé — auth, demandes, users
from app.database.base import Base
from app.database.sessions import engine
Base.metadata.create_all(bind=engine)
ensure_sqlite_schema(engine)

router.include_router(auth.router)
router.include_router(demandes.router)
router.include_router(users.router)
