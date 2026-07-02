import pytest
import sys
from app.agents.crew import ECitoyenCrew

def test_crew_agents_initialization():
    """Verify that all three agents are properly instantiated with the expected roles."""
    crew_instance = ECitoyenCrew()
    
    agent_accueil = crew_instance.accueil()
    assert agent_accueil is not None
    assert "accueil" in agent_accueil.role.lower() or "d'accueil" in agent_accueil.role.lower()

    agent_doc = crew_instance.documentaliste()
    assert agent_doc is not None
    assert "documentaliste" in agent_doc.role.lower()

    agent_redacteur = crew_instance.redacteur()
    assert agent_redacteur is not None
    assert "rédacteur" in agent_redacteur.role.lower() or "redacteur" in agent_redacteur.role.lower()

def test_crew_tasks_initialization():
    """Verify that all three tasks are properly instantiated with their corresponding agents."""
    crew_instance = ECitoyenCrew()
    
    task_comprendre = crew_instance.comprendre_demande()
    assert task_comprendre is not None
    assert task_comprendre.agent.role == crew_instance.accueil().role

    task_documenter = crew_instance.documenter_demarche()
    assert task_documenter is not None
    assert task_documenter.agent.role == crew_instance.documentaliste().role

    task_rediger = crew_instance.rediger_reponse()
    assert task_rediger is not None
    assert task_rediger.agent.role == crew_instance.redacteur().role

def test_crew_assembly():
    """Verify that the Crew object aggregates all agents and tasks correctly."""
    crew_instance = ECitoyenCrew().crew()
    assert len(crew_instance.agents) == 3
    assert len(crew_instance.tasks) == 3
