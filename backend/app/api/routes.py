import logging
from fastapi import APIRouter, HTTPException

from app.models.schemas import DemandeCitoyen, ReponseCitoyen
from app.agents.crew import ECitoyenCrew

logger = logging.getLogger("e_citoyen_ci.api")
router = APIRouter()


@router.post(
    "/demande",
    response_model=ReponseCitoyen,
    summary="Traite la demande d'un citoyen via le crew multi-agents",
)
def traiter_demande(demande: DemandeCitoyen) -> ReponseCitoyen:
    """
    Reçoit le message du citoyen, le fait passer par le crew
    (Agent Accueil -> Agent Documentaliste -> Agent Rédacteur),
    et renvoie la réponse structurée finale.
    """
    try:
        resultat = ECitoyenCrew().crew().kickoff(
            inputs={"demande_citoyen": demande.message}
        )
    except Exception as exc:
        # On logue l'erreur complète côté serveur pour debug,
        # mais on ne renvoie jamais le détail technique brut au frontend
        # (ne jamais exposer un message d'erreur LLM interne au citoyen).
        logger.exception("Échec du traitement de la demande citoyenne")
        raise HTTPException(
            status_code=500,
            detail="Une erreur est survenue lors du traitement de votre demande. "
                   "Veuillez réessayer dans un instant."
        ) from exc

    if resultat.pydantic is None:
        logger.error("Le crew n'a pas produit de sortie structurée valide")
        raise HTTPException(
            status_code=500,
            detail="La réponse générée n'a pas pu être structurée correctement. "
                   "Veuillez réessayer."
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
