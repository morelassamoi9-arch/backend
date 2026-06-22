from app.agents.crew_service import traiter_demande

def create_demande(db, demande, user_id):
    db.add(demande)
    db.commit()
    db.refresh(demande)

    # Appel IA (CrewAI)
    resultat = traiter_demande(demande.message)

    return {
        "demande": demande,
        "resultat_ia": resultat
    }


def get_demandes_by_user(db, user_id):
    return db.query(Demande).filter(Demande.user_id == user_id).all()
