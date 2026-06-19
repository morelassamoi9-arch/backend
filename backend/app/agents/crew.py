import os
from pathlib import Path
from dotenv import load_dotenv

# WORKAROUND CONNU : bug CrewAI 1.14.x où 'cache_breakpoint' est injecté
# dans les messages système même pour des providers non-Anthropic (Groq).
# Voir https://github.com/crewAIInc/crewAI/issues/5886
# À retirer si une version corrigée de CrewAI est publiée.
import crewai.llms.cache as _crewai_cache
_crewai_cache.mark_cache_breakpoint = lambda msg: msg

from crewai import Agent, Task, Crew
from crewai.project import CrewBase, agent, task, crew
from pydantic import BaseModel, Field
from typing import Optional, List

from app.agents.tools import consulter_procedure

load_dotenv()

BASE_DIR = Path(__file__).parent


# ── Sortie structurée de l'Agent Accueil ──
class AnalyseDemande(BaseModel):
    demarche_identifiee: str = Field(
        description="Identifiant court en minuscules, ex: 'acte_naissance', 'cni'"
    )
    cas_particulier: bool = Field(
        description="True si un cas particulier complique la procédure standard"
    )
    description_cas_particulier: Optional[str] = Field(default=None)
    resume_situation: str = Field(
        description="Résumé factuel de la situation en une phrase"
    )
    information_manquante: Optional[str] = Field(default=None)


# ── Sortie structurée de l'Agent Documentaliste ──
class FicheDemarche(BaseModel):
    demarche: str = Field(description="Nom de la démarche concernée")
    documents_requis: List[str] = Field(description="Liste des documents nécessaires")
    lieu: str = Field(description="Où effectuer la démarche")
    delai: str = Field(description="Délai légal ou de traitement")
    cout: str = Field(description="Coût de la démarche")
    etapes_prealables: Optional[List[str]] = Field(
        default=None,
        description="Démarches à effectuer avant celle-ci, si applicable"
    )
    note_cas_particulier: Optional[str] = Field(
        default=None,
        description="Précision si un cas particulier modifie la procédure standard"
    )


@CrewBase
class ECitoyenCrew:
    """Crew principal du projet e-Citoyen CI"""

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def accueil(self) -> Agent:
        return Agent(
            config=self.agents_config["accueil"],
            llm="groq/llama-3.3-70b-versatile",
            verbose=True
        )

    @agent
    def documentaliste(self) -> Agent:
        return Agent(
            config=self.agents_config["documentaliste"],
            llm="groq/llama-3.3-70b-versatile",
            tools=[consulter_procedure],
            verbose=True
        )

    @task
    def comprendre_demande(self) -> Task:
        return Task(
            config=self.tasks_config["comprendre_demande"],
            agent=self.accueil(),
            output_pydantic=AnalyseDemande
        )

    @task
    def documenter_demarche(self) -> Task:
        return Task(
            config=self.tasks_config["documenter_demarche"],
            agent=self.documentaliste(),
            context=[self.comprendre_demande()],
            output_pydantic=FicheDemarche
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            verbose=True
        )


if __name__ == "__main__":
    demande_test = "Je veux faire ma carte d'identité mais j'ai perdu mon acte de naissance"

    resultat = ECitoyenCrew().crew().kickoff(
        inputs={"demande_citoyen": demande_test}
    )

    print("\n=== RÉSULTAT FINAL (Agent Documentaliste) ===")
    print(f"Démarche : {resultat.pydantic.demarche}")
    print(f"Documents requis : {resultat.pydantic.documents_requis}")
    print(f"Lieu : {resultat.pydantic.lieu}")
    print(f"Délai : {resultat.pydantic.delai}")
    print(f"Coût : {resultat.pydantic.cout}")
    print(f"Étapes préalables : {resultat.pydantic.etapes_prealables}")
    print(f"Note cas particulier : {resultat.pydantic.note_cas_particulier}")