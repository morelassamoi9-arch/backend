from app.agents.crew import ECitoyenCrew

def traiter_demande(message):
    result = (
        ECitoyenCrew()
        .crew()
        .kickoff(inputs={"demande_citoyen": message})
    )

    return result
