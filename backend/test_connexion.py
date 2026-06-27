from dotenv import load_dotenv

# Le monkey-patch doit être appliqué AVANT toute exécution de crew,
# donc tout en haut, juste après les imports de base.
import crewai.llms.cache as _crewai_cache

from crewai import Agent, Task, Crew

_crewai_cache.mark_cache_breakpoint = lambda msg: msg

load_dotenv()

agent_test = Agent(
    role="Assistant administratif",
    goal="Répondre brièvement à une question simple sur les démarches administratives en Côte d'Ivoire",
    backstory="Tu es un agent IA de test pour valider la connexion technique du projet e-Citoyen CI.",
    llm="gemini/gemini-1.5-flash",
    verbose=True
)

tache_test = Task(
    description="Explique en une phrase ce qu'est un acte de naissance.",
    expected_output="Une phrase claire et courte.",
    agent=agent_test
)

crew_test = Crew(
    agents=[agent_test],
    tasks=[tache_test],
    verbose=True
)

resultat = crew_test.kickoff()
print("\n=== RÉSULTAT FINAL ===")
print(resultat)
