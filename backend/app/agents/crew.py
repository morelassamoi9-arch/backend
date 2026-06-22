from pathlib import Path
from typing import Optional, List

from crewai import Agent, Task, Crew
from crewai.project import CrewBase, agent, task, crew
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# WORKAROUND CONNU : bug CrewAI 1.14.x où 'cache_breakpoint' est injecté
# dans les messages système même pour des providers non-Anthropic (Groq).
# Voir https://github.com/crewAIInc/crewAI/issues/5886
# À retirer si une version corrigée de CrewAI est publiée.
import crewai.llms.cache as _crewai_cache

from app.agents.tools import consulter_procedure

_crewai_cache.mark_cache_breakpoint = lambda msg: msg

load_dotenv()

BASE_DIR = Path(__file__).parent


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


class FicheDemarche(BaseModel):
    demarche: str = Field(description="Nom de la démarche concernée")
    documents_requis: List[str] = Field(description="Liste des documents nécessaires")
    lieu: str = Field(description="Où effectuer la démarche")
    delai: str = Field(description="Délai légal ou de traitement")
    cout: str = Field(description="Coût de la démarche")
    etapes_prealables: Optional[List[str]] = Field(default=None)
    note_cas_particulier: Optional[str] = Field(default=None)


class ReponseFinale(BaseModel):
    resume_situation: str = Field(
        description="Résumé simple en 1-2 phrases, sans jargon administratif"
    )
    plan_action: List[str] = Field(
        description="Étapes numérotées dans l'ordre logique"
    )
    documents_a_apporter: List[str] = Field(default_factory=list)
    lieu: str = Field(description="Lieu où effectuer la démarche")
    delai_estime: str = Field(description="Délai estimé pour le citoyen")
    cout: str = Field(description="Coût pour le citoyen")
    lettre_generee: bool = Field(
        description="True si une lettre formelle a été générée pour ce cas"
    )
    contenu_lettre: Optional[str] = Field(
        default=None,
        description="Texte complet de la lettre si lettre_generee est True"
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

    @agent
    def redacteur(self) -> Agent:
        return Agent(
            config=self.agents_config["redacteur"],
            llm="groq/llama-3.3-70b-versatile",
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

    @task
    def rediger_reponse(self) -> Task:
        return Task(
            config=self.tasks_config["rediger_reponse"],
            agent=self.redacteur(),
            context=[self.documenter_demarche()],
            output_pydantic=ReponseFinale
        )

    # RISQUE RÉSIDUEL CONNU (observé une fois, non systématique sur 3 runs
    # de test le 19/06) : Groq peut occasionnellement renvoyer un format de
    # function-call non standard (<function=...></function> au lieu du
    # format tool_calls natif) sur le schéma ReponseFinale, probablement à
    # cause du champ texte libre contenu_lettre. CrewAI retry
    # automatiquement (max_retry par défaut) et la 2e tentative a toujours
    # réussi dans nos tests. Si ce comportement devient fréquent en démo,
    # piste de correction : simplifier ReponseFinale ou augmenter explicitement
    # le nombre de tentatives ci-dessous.
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

    print("\n=== RÉPONSE FINALE AU CITOYEN ===")
    print(f"\nSituation : {resultat.pydantic.resume_situation}")
    print("\nPlan d'action :")
    for i, etape in enumerate(resultat.pydantic.plan_action, 1):
        print(f"  {i}. {etape}")
    print(f"\nDocuments à apporter : {resultat.pydantic.documents_a_apporter}")
    print(f"Lieu : {resultat.pydantic.lieu}")
    print(f"Délai estimé : {resultat.pydantic.delai_estime}")
    print(f"Coût : {resultat.pydantic.cout}")
    if resultat.pydantic.lettre_generee:
        print("\n=== LETTRE GÉNÉRÉE ===")
        print(resultat.pydantic.contenu_lettre)
    else:
        print("\nAucune lettre nécessaire pour ce cas.")
