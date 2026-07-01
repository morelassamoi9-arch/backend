import json
from pathlib import Path
from crewai.tools import tool

KNOWLEDGE_PATH = Path(__file__).parent.parent / "knowledge" / "procedures.json"


@tool("consulter_procedure")
def consulter_procedure(nom_demarche: str) -> str:
    """
    Recherche une démarche administrative dans la base de connaissances
    et retourne ses détails complets (documents requis, lieu, délai,
    coût, cas particuliers, dépendances avec d'autres démarches).

    Args:
        nom_demarche: identifiant court de la démarche, ex: 'acte_naissance', 'cni'
    """
    if not KNOWLEDGE_PATH.exists():
        return f"Erreur : base de connaissances introuvable au chemin {KNOWLEDGE_PATH}"

    try:
        with open(KNOWLEDGE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        return f"Erreur lors de la lecture de la base de connaissances : {type(e).__name__}"

    demarches = data.get("demarches", {})
    dependances = data.get("_dependances", {})

    if nom_demarche not in demarches:
        disponibles = ", ".join(demarches.keys())
        return (
            f"Démarche '{nom_demarche}' introuvable dans la base de connaissances. "
            f"Démarches disponibles actuellement : {disponibles}. "
            f"Signale ce manque clairement dans ta réponse, ne l'invente pas."
        )

    resultat = demarches[nom_demarche]
    deps = dependances.get(nom_demarche, [])
    if deps:
        resultat = {**resultat, "demarches_prealables_requises": deps}

    return json.dumps(resultat, ensure_ascii=False, indent=2)
