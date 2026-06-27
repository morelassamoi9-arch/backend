from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.sessions import get_db
from app.database.models import User, Demande, DemandeStatus
from app.schemas.demandes import DemandeCreate, DemandeResponse
from app.services.demandes_services import DemandeService
from app.auth.dependencies import get_current_user
import json
import os
import logging

logger = logging.getLogger(__name__)

class FallbackResponse:
    def __init__(self, data):
        self.resume_situation = data["resume_situation"]
        self.plan_action = data["plan_action"]
        self.documents_a_apporter = data["documents_a_apporter"]
        self.lieu = data["lieu"]
        self.delai_estime = data["delai_estime"]
        self.cout = data["cout"]
        self.lettre_generee = data["lettre_generee"]
        self.contenu_lettre = data["contenu_lettre"]

class FallbackResult:
    def __init__(self, data):
        self.pydantic = FallbackResponse(data)

def get_deterministic_fallback_response(message: str):
    """
    Parcourt le fichier procedures.json et extrait la démarche qui correspond le mieux
    aux mots-clés du message de l'utilisateur.
    """
    import json
    from pathlib import Path
    
    knowledge_path = Path(__file__).parent.parent / "knowledge" / "procedures.json"
    
    try:
        with open(knowledge_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        demarches = data.get("demarches", {})
    except Exception as err:
        logger.error(f"Erreur chargement local de procedures.json pour le fallback : {err}")
        demarches = {}

    msg = message.lower()
    matched_key = None
    
    keywords_map = {
        "cni": ["cni", "carte d'identité", "carte nationale", "identite", "carte d’identité"],
        "casier_judiciaire": ["casier", "judiciaire", "bulletin 3", "bulletin n°3", "bulletin n3"],
        "certificat_nationalite": ["nationalite", "certificat de nationalite", "ivoirien", "ivoirienne"],
        "actes_etat_civil": ["etat civil", "extrait", "acte de mariage", "acte de deces", "documents.ci"],
        "acte_naissance": ["acte de naissance", "declaration de naissance", "naissance", "declarer naissance", "nouveau-ne"],
        "cmu": ["cmu", "couverture maladie", "assurance maladie", "immatriculation cmu", "carte cmu"],
        "permis_conduire": ["permis", "conduire", "permis de conduire", "biometrique", "quipux"],
        "passeport": ["passeport", "voyager", "visa", "snedai", "timbre passeport"],
        "jugement_suppletif": ["jugement supplétif", "jugement suppletif", "suppletif", "tribunal naissance", "delai depasse"],
        "impots": ["impot", "impôts", "e-impots", "declaration fiscale", "ncc", "contribuable"],
        "dedouanement_sydam": ["douane", "dedouanement", "marchandise", "sydam", "colisage", "importation"],
        "allocations_cnps": ["allocation", "cnps", "prestations familiales", "allocations familiales"],
        "concours_fonction_publique": ["concours", "fonction publique", "recrutement etat", "visite medicale"],
        "inscription_scolaire": ["inscription", "scolaire", "matricule", "lycee", "college", "frais scolarite", "ussd"]
    }
    
    for key, keywords in keywords_map.items():
        if any(kw in msg for kw in keywords):
            matched_key = key
            break
            
    if matched_key and matched_key in demarches:
        proc = demarches[matched_key]
        titre = proc.get("titre")
        desc = proc.get("description")
        inst = proc.get("institution", {})
        guichet = inst.get("guichet", "Non spécifié")
        
        cout_info = proc.get("cout", {})
        cout = f"{cout_info.get('montant', '0')} {cout_info.get('devise', 'FCFA')}" if not cout_info.get("gratuit") else "Gratuit"
        if cout_info.get("notes"):
            cout += f" ({cout_info.get('notes')})"
            
        delai_info = proc.get("delais", {})
        delai = delai_info.get("duree_traitement", "Non spécifié")
        
        docs = [d["nom"] for d in proc.get("documents", []) if d.get("obligatoire")]
        etapes = proc.get("etapes", [])
        
        resume_situation = f"Voici les instructions officielles de notre base de connaissances concernant votre demande pour : '{titre}'."
        plan_action = etapes if etapes else ["Consulter le site officiel pour démarrer la procédure."]
        
        return {
            "resume_situation": resume_situation,
            "plan_action": plan_action,
            "documents_a_apporter": docs,
            "lieu": guichet,
            "delai_estime": delai,
            "cout": cout,
            "lettre_generee": False,
            "contenu_lettre": None
        }
        
    return {
        "resume_situation": "Nous n'avons pas pu identifier la démarche précise dans votre message. Veuillez reformuler votre besoin.",
        "plan_action": [
            "Visitez notre Centre d'Aide & Support (section 'Aides et Supports') pour consulter l'index des démarches.",
            "Posez une question plus précise à notre assistant (ex: 'Quelles sont les pièces pour un passeport ?')."
        ],
        "documents_a_apporter": [],
        "lieu": "Centres administratifs de Côte d'Ivoire",
        "delai_estime": "Variable",
        "cout": "Gratuit",
        "lettre_generee": False,
        "contenu_lettre": None
    }

router = APIRouter(
    prefix="/demandes",
    tags=["Demandes"],
    responses={
        401: {"description": "Non authentifié"},
        404: {"description": "Demande non trouvée"}
    }
)

def process_demande_with_crew(demande_id: str, message: str):
    """
    Tâche de fond pour traiter la demande avec CrewAI (YAML-based)
    """
    import time
    try:
        from app.agents.crew import ECitoyenCrew
        from app.database.models import Demande, DemandeStatus, Reponse

        # Mettre à jour le statut en EN_COURS avant de lancer le kickoff
        db_session = next(get_db())
        try:
            demande = db_session.query(Demande).filter(Demande.id == demande_id).first()
            if demande:
                demande.status = DemandeStatus.EN_COURS
                db_session.commit()
                logger.info(f"Statut de la demande {demande_id} mis à EN_COURS")
        except Exception as db_err:
            logger.error(f"Erreur lors du passage au statut EN_COURS pour {demande_id}: {db_err}")
        finally:
            db_session.close()

        logger.info(f"Traitement CrewAI unifié pour la demande {demande_id}")
        
        max_retries = 3
        delay = 5.0
        resultat = None
        
        fallback_used = False
        for attempt in range(max_retries):
            try:
                logger.info(f"Lancement de kickoff CrewAI (tentative {attempt+1}/{max_retries})")
                resultat = ECitoyenCrew().crew().kickoff(
                    inputs={"demande_citoyen": message}
                )
                if resultat is None or resultat.pydantic is None:
                    raise ValueError("Le crew n'a pas produit de sortie structurée valide")
                break  # Succès, on sort de la boucle de retry
            except Exception as exc:
                error_msg = str(exc).lower()
                is_transient = "rate limit" in error_msg or "429" in error_msg or "overloaded" in error_msg or "timeout" in error_msg or "resource_exhausted" in error_msg or "quota" in error_msg
                if is_transient and attempt < max_retries - 1:
                    logger.warning(f"Erreur temporaire ou Rate limit Gemini détecté. Retrying dans {delay}s... (Détail: {exc})")
                    time.sleep(delay)
                    delay *= 2.0  # Backoff exponentiel
                elif attempt < max_retries - 1:
                    logger.warning(f"Erreur CrewAI/parsing temporaire. Retrying dans {delay}s... (Détail: {exc})")
                    time.sleep(delay)
                    delay *= 1.5
                else:
                    # Plus de retries Gemini. Tentative de basculement vers Groq si la clé existe
                    groq_key = os.getenv("GROQ_API_KEY")
                    if groq_key and not fallback_used:
                        logger.warning("Détection de surcharge Gemini. Basculement automatique vers le fournisseur de secours Groq...")
                        try:
                            from crewai import LLM
                            fallback_llm = LLM(
                                model="groq/llama-3.3-70b-versatile",
                                api_key=groq_key,
                                tool_choice="auto"
                            )
                            resultat = ECitoyenCrew(llm_override=fallback_llm).crew().kickoff(
                                inputs={"demande_citoyen": message}
                            )
                            if resultat is None or resultat.pydantic is None:
                                raise ValueError("Le crew de secours n'a pas produit de sortie structurée valide")
                            fallback_used = True
                            logger.info("Succès du traitement de la demande via le fournisseur de secours Groq.")
                            break
                        except Exception as fallback_exc:
                            logger.error(f"Échec du traitement de secours via Groq : {fallback_exc}. Lancement de la récupération déterministe locale...")
                            try:
                                fallback_data = get_deterministic_fallback_response(message)
                                resultat = FallbackResult(fallback_data)
                                fallback_used = True
                                break
                            except Exception as fallback_err:
                                logger.error(f"Échec de la récupération déterministe locale : {fallback_err}")
                                raise fallback_exc
                    else:
                        logger.warning("Gemini surchargé et aucun fallback Groq disponible ou fonctionnel. Lancement de la récupération déterministe locale...")
                        try:
                            fallback_data = get_deterministic_fallback_response(message)
                            resultat = FallbackResult(fallback_data)
                            fallback_used = True
                            break
                        except Exception as fallback_err:
                            logger.error(f"Échec de la récupération déterministe locale : {fallback_err}")
                            raise exc

        pydantic_res = resultat.pydantic
        crew_result = {
            "resume": pydantic_res.resume_situation,
            "etapes": pydantic_res.plan_action,
            "documents": pydantic_res.documents_a_apporter,
            "lieux": [pydantic_res.lieu] if pydantic_res.lieu else [],
            "delai": pydantic_res.delai_estime,
            "cout": pydantic_res.cout,
            "lettre": pydantic_res.contenu_lettre if pydantic_res.lettre_generee else None
        }

        # Déterminer si c'est un rejet fonctionnel (demande vide, inconnue ou hors sujet)
        is_functional_rejection = (
            not pydantic_res.plan_action 
            or "inconnu" in pydantic_res.resume_situation.lower() 
            or "hors sujet" in pydantic_res.resume_situation.lower()
        )

        # Sauvegarder la réponse
        db_session = next(get_db())
        try:
            reponse = Reponse(
                demande_id=demande_id,
                resume=pydantic_res.resume_situation,
                etapes=json.dumps(pydantic_res.plan_action, ensure_ascii=False),
                documents_requis=json.dumps(pydantic_res.documents_a_apporter, ensure_ascii=False),
                lieu=pydantic_res.lieu or "Non spécifié",
                delai=pydantic_res.delai_estime or "Non spécifié",
                cout=pydantic_res.cout or "Non spécifié",
                contacts=json.dumps({}, ensure_ascii=False),
                source='crew_ai'
            )
            db_session.add(reponse)

            demande = db_session.query(Demande).filter(Demande.id == demande_id).first()
            if demande:
                if is_functional_rejection:
                    demande.status = DemandeStatus.REJETEE
                else:
                    demande.status = DemandeStatus.TRAITEE
                demande.reponse = json.dumps(crew_result, ensure_ascii=False)
            db_session.commit()
            logger.info(f"Réponse CrewAI sauvegardée pour la demande {demande_id}. Statut final : {demande.status}")
        finally:
            db_session.close()

    except Exception as e:
        logger.error(f"Erreur technique CrewAI pour demande {demande_id}: {str(e)}")
        db_session = next(get_db())
        try:
            demande = db_session.query(Demande).filter(Demande.id == demande_id).first()
            if demande:
                demande.status = DemandeStatus.ERREUR
                
                # Identifier si c'est un dépassement de quota (rate limit / resource exhausted)
                error_msg = str(e).lower()
                is_rate_limit = "rate_limit" in error_msg or "429" in error_msg or "resource_exhausted" in error_msg or "quota" in error_msg
                
                if is_rate_limit:
                    user_error = "Toutes nos excuses, le service d'analyse IA connaît actuellement un fort trafic (limite de requêtes atteinte). Veuillez réessayer dans quelques minutes."
                else:
                    user_error = "Une erreur technique temporaire est survenue lors du traitement de votre demande. Veuillez réessayer."
                
                error_response = {
                    "error": user_error,
                    "is_technical": True
                }
                demande.reponse = json.dumps(error_response, ensure_ascii=False)
                db_session.commit()
        except Exception as db_err:
            logger.error(f"Erreur lors du marquage d'erreur pour {demande_id}: {db_err}")
        finally:
            db_session.close()


@router.post(
    "/",
    response_model=DemandeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une nouvelle demande",
    description="Soumet une demande administrative et reçoit une réponse automatique"
)
async def create_demande(
    demande_data: DemandeCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer une nouvelle demande administrative :
    
    - **message** : Description détaillée de votre demande (obligatoire)
    - **categorie** : Catégorie de la demande (optionnel)
    
    Exemples de catégories : CNI, Passeport, Acte de naissance, Permis, etc.
    """
    try:
        # Créer la demande dans la base
        demande = DemandeService.create_demande(db, current_user, demande_data)
        
        # Lancer le traitement CrewAI en arrière-plan
        background_tasks.add_task(
            process_demande_with_crew,
            demande_id=str(demande.id),
            message=demande_data.message
        )
        
        return demande
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erreur création demande: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création de la demande"
        )

@router.get(
    "/",
    response_model=List[DemandeResponse],
    summary="Historique des demandes",
    description="Récupère toutes les demandes du citoyen connecté"
)
def get_demandes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    status_filter: DemandeStatus = None
):
    """
    Récupère l'historique des demandes :
    
    - **skip** : Nombre de demandes à sauter (pagination)
    - **limit** : Nombre maximum de demandes à retourner
    - **status_filter** : Filtrer par statut (en_attente, en_cours, traitee, rejetee)
    """
    demandes = DemandeService.get_user_demandes(
        db, current_user, skip=skip, limit=limit, status=status_filter
    )
    return demandes

@router.get(
    "/{demande_id}",
    response_model=DemandeResponse,
    summary="Détail d'une demande",
    description="Récupère le détail d'une demande spécifique avec sa réponse"
)
def get_demande_detail(
    demande_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère une demande spécifique par son ID
    
    - **demande_id** : Identifiant unique de la demande
    """
    demande = DemandeService.get_demande_detail(db, current_user, demande_id)
    return demande

@router.delete(
    "/{demande_id}",
    summary="Supprimer une demande",
    description="Supprime une demande spécifique"
)
def delete_demande(
    demande_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprime une demande par son ID
    
    - **demande_id** : Identifiant unique de la demande à supprimer
    """
    DemandeService.delete_demande(db, current_user, demande_id)
    return {"message": "Demande supprimée avec succès"}

@router.get(
    "/stats/overview",
    summary="Statistiques des demandes",
    description="Retourne les statistiques des demandes du citoyen"
)
def get_demande_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retourne les statistiques des demandes
    """
    return DemandeService.get_statistics(db, current_user)

@router.post("/{demande_id}/generate-response")
def generate_response(
    demande_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Génère la vraie réponse IA en arrière-plan pour la demande spécifiée (ancien mock réorienté)"""
    demande = db.query(Demande).filter(
        Demande.id == str(demande_id),
        Demande.user_id == current_user.id
    ).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    # Repasser la demande en statut EN_COURS
    demande.status = DemandeStatus.EN_COURS
    db.commit()
    
    # Déclencher le traitement CrewAI réel en tâche de fond
    background_tasks.add_task(
        process_demande_with_crew,
        demande_id=str(demande.id),
        message=demande.message
    )
    
    return {
        "id": demande.id,
        "message": demande.message,
        "categorie": demande.categorie,
        "status": demande.status,
        "created_at": demande.created_at,
        "info": "Traitement de la demande démarré en arrière-plan"
    }
