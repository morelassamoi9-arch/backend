from crewai import Agent, Task, Crew, Process
from langchain_groq import ChatGroq
import os
import json
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.database.models import Reponse
import logging

logger = logging.getLogger(__name__)

class ECitoyenCrew:
    """
    Service d'intelligence artificielle pour e-Citoyen CI
    Utilise CrewAI avec Groq pour traiter les demandes des citoyens
    """
    
    def __init__(self):
        """Initialise le crew avec le modèle Groq"""
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            logger.warning("GROQ_API_KEY non définie - Mode simulation activé")
            self.llm = None
        else:
            self.llm = ChatGroq(
                temperature=0.3,
                groq_api_key=groq_api_key,
                model_name="mixtral-8x7b-32768"
            )
    
    def _get_default_response(self, message: str) -> Dict[str, Any]:
        """
        Réponse par défaut si l'IA n'est pas disponible
        
        Args:
            message: Message du citoyen
        
        Returns:
            dict: Réponse structurée
        """
        # Analyse simple du message
        message_lower = message.lower()
        
        if "cni" in message_lower or "carte nationale" in message_lower:
            return {
                "resume": "Procédure d'obtention de la Carte Nationale d'Identité (CNI)",
                "etapes": json.dumps([
                    "1. Se rendre à la sous-préfecture ou au commissariat de police",
                    "2. Fournir un extrait d'acte de naissance datant de moins de 3 mois",
                    "3. Fournir un certificat de nationalité ivoirienne",
                    "4. Fournir 2 photos d'identité récentes",
                    "5. Remplir le formulaire de demande",
                    "6. Payer les frais de timbre (5000 FCFA)",
                    "7. Prendre les empreintes digitales",
                    "8. Retirer la CNI sous 1 à 3 mois"
                ]),
                "documents_requis": json.dumps([
                    "Extrait d'acte de naissance",
                    "Certificat de nationalité",
                    "2 photos d'identité",
                    "Justificatif de domicile",
                    "Ancienne CNI (si renouvellement)"
                ]),
                "lieu": "Sous-préfecture ou Commissariat de police de votre commune",
                "delai": "1 à 3 mois",
                "cout": "5000 FCFA (timbre fiscal)",
                "contacts": json.dumps({
                    "Service": "Bureau des cartes d'identité",
                    "Téléphone": "+225 20 21 00 00"
                })
            }
        
        elif "passeport" in message_lower:
            return {
                "resume": "Procédure d'obtention du Passeport Ivoirien",
                "etapes": json.dumps([
                    "1. Prendre rendez-vous en ligne sur le site des passeports",
                    "2. Remplir le formulaire de demande",
                    "3. Payer les frais (40 000 FCFA pour le passeport ordinaire)",
                    "4. Se présenter au centre de traitement",
                    "5. Fournir les documents requis",
                    "6. Prendre les empreintes et la photo",
                    "7. Suivre le statut en ligne",
                    "8. Retirer le passeport"
                ]),
                "documents_requis": json.dumps([
                    "CNI valide",
                    "Extrait d'acte de naissance",
                    "Certificat de nationalité",
                    "Photos d'identité",
                    "Justificatif de domicile"
                ]),
                "lieu": "Centre de Traitement des Passeports",
                "delai": "2 à 4 semaines",
                "cout": "40 000 FCFA",
                "contacts": json.dumps({
                    "Service": "Direction des Passeports",
                    "Site": "www.passeport.ci"
                })
            }
        
        else:
            return {
                "resume": "Information sur votre demande",
                "etapes": json.dumps([
                    "1. Identifier le service administratif concerné",
                    "2. Rassembler les documents nécessaires",
                    "3. Se rendre au guichet approprié",
                    "4. Suivre la procédure indiquée"
                ]),
                "documents_requis": json.dumps([
                    "Pièce d'identité",
                    "Justificatifs selon la demande"
                ]),
                "lieu": "Service administratif compétent",
                "delai": "Variable selon la demande",
                "cout": "Variable selon la procédure",
                "contacts": json.dumps({
                    "Information": "Services administratifs",
                    "Note": "Contactez votre mairie ou préfecture"
                })
            }
    
    def process_demande(self, message: str) -> Dict[str, Any]:
        """
        Traite une demande citoyenne avec l'IA
        
        Args:
            message: Message du citoyen
        
        Returns:
            dict: Réponse structurée
        """
        logger.info(f"Traitement de la demande : {message[:100]}...")
        
        # Si pas de clé API Groq, utiliser les réponses par défaut
        if not self.llm:
            logger.info("Utilisation du mode simulation (pas d'API Groq)")
            return self._get_default_response(message)
        
        try:
            # Créer les agents
            analyste = Agent(
                role='Analyste des services publics ivoiriens',
                goal='Comprendre la demande du citoyen et identifier le service concerné',
                backstory="""Expert des procédures administratives en Côte d'Ivoire.
                Vous connaissez parfaitement le fonctionnement de l'administration ivoirienne.
                Vous analysez les demandes des citoyens avec précision et empathie.""",
                verbose=False,
                allow_delegation=False,
                llm=self.llm
            )
            
            informateur = Agent(
                role='Informateur administratif',
                goal='Fournir des informations précises sur les démarches administratives',
                backstory="""Spécialiste de l'information administrative en Côte d'Ivoire.
                Vous fournissez des réponses claires, structurées et utiles sur les procédures.
                Vous connaissez les délais, coûts et lieux exacts pour chaque démarche.""",
                verbose=False,
                allow_delegation=False,
                llm=self.llm
            )
            
            # Créer les tâches
            task_analyse = Task(
                description=f"""
                Analyse la demande suivante d'un citoyen ivoirien :
                
                "{message}"
                
                Identifie :
                1. La nature exacte de la demande
                2. Le service administratif concerné
                3. La complexité de la démarche
                4. L'urgence éventuelle
                
                Format de réponse : JSON avec les champs "nature", "service", "complexite", "urgence"
                """,
                agent=analyste,
                expected_output="Analyse structurée de la demande"
            )
            
            task_information = Task(
                description="""
                Sur la base de l'analyse précédente, fournis une réponse COMPLÈTE et STRUCTURÉE incluant :
                
                1. Un résumé clair de la procédure
                2. Les étapes numérotées à suivre
                3. La liste des documents requis
                4. Le lieu exact pour effectuer la démarche
                5. Le délai approximatif
                6. Le coût (si applicable)
                7. Les contacts utiles (téléphone, site web, email)
                
                IMPORTANT : Réponds UNIQUEMENT en format JSON valide avec ces champs exacts :
                {
                    "resume": "string",
                    "etapes": ["étape 1", "étape 2", ...],
                    "documents_requis": ["doc 1", "doc 2", ...],
                    "lieu": "string",
                    "delai": "string",
                    "cout": "string",
                    "contacts": {"nom": "valeur", ...}
                }
                
                Sois précis et adapté au contexte ivoirien.
                """,
                agent=informateur,
                expected_output="JSON structuré avec toutes les informations"
            )
            
            # Créer et exécuter le crew
            crew = Crew(
                agents=[analyste, informateur],
                tasks=[task_analyse, task_information],
                verbose=False,
                process=Process.sequential
            )
            
            result = crew.kickoff()
            
            # Parser le résultat
            try:
                if isinstance(result, str):
                    # Nettoyer le résultat
                    result = result.strip()
                    # Enlever les marqueurs de code si présents
                    if result.startswith("```json"):
                        result = result[7:]
                    if result.startswith("```"):
                        result = result[3:]
                    if result.endswith("```"):
                        result = result[:-3]
                    result = result.strip()
                    
                    parsed = json.loads(result)
                    return parsed
                return result
                
            except json.JSONDecodeError:
                logger.warning(f"Impossible de parser le résultat JSON : {result}")
                return self._get_default_response(message)
                
        except Exception as e:
            logger.error(f"Erreur CrewAI : {str(e)}")
            return self._get_default_response(message)
    
    def save_reponse_to_db(self, db: Session, demande_id, crew_result: Dict[str, Any]) -> Reponse:
        """
        Sauvegarde la réponse de l'IA dans la base de données
        
        Args:
            db: Session de base de données
            demande_id: ID de la demande
            crew_result: Résultat de l'IA
        
        Returns:
            Reponse: La réponse sauvegardée
        """
        try:
            reponse = Reponse(
                demande_id=demande_id,
                resume=crew_result.get('resume', 'Réponse en cours de traitement'),
                etapes=json.dumps(crew_result.get('etapes', []), ensure_ascii=False),
                documents_requis=json.dumps(crew_result.get('documents_requis', []), ensure_ascii=False),
                lieu=crew_result.get('lieu', 'Information non disponible'),
                delai=crew_result.get('delai', 'Délai non précisé'),
                cout=crew_result.get('cout', 'Coût non précisé'),
                contacts=json.dumps(crew_result.get('contacts', {}), ensure_ascii=False),
                source='crew_ai'
            )
            
            db.add(reponse)
            db.commit()
            db.refresh(reponse)
            
            logger.info(f"Réponse sauvegardée pour la demande {demande_id}")
            return reponse
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erreur sauvegarde réponse : {str(e)}")
            raise