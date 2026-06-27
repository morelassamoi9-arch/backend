import sqlite3
import json
import os

dbs = [
    "ecitoyen.db",
    os.path.join("backend", "ecitoyen.db"),
    os.path.join("backend", "app.db")
]

for db_path in dbs:
    if not os.path.exists(db_path):
        continue
        
    print("\n" + "="*80)
    print(f"Connexion à la base de données : {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id, message, status, reponse, created_at FROM demandes WHERE status = 'erreur' ORDER BY created_at DESC LIMIT 5")
        rows = cur.fetchall()
        
        if not rows:
            print("Aucune demande avec le statut 'erreur' trouvée.")
            cur.execute("SELECT id, message, status, created_at FROM demandes ORDER BY created_at DESC LIMIT 5")
            print("\nDernières demandes enregistrées :")
            for r in cur.fetchall():
                print(f"  ID: {r[0]} | Message: {r[1]} | Statut: {r[2]} | Créé le: {r[3]}")
        else:
            print(f"Trouvé {len(rows)} demande(s) en erreur :")
            for r in rows:
                print("-"*60)
                print(f"ID : {r[0]}")
                print(f"Message citoyen : {r[1]}")
                print(f"Statut : {r[2]}")
                print(f"Date de création : {r[4]}")
                print("Détails de la réponse :")
                try:
                    rep_data = json.loads(r[3])
                    print(json.dumps(rep_data, indent=2, ensure_ascii=False))
                except Exception:
                    print(r[3])
    except Exception as e:
        print(f"Erreur lors de la lecture de la base : {e}")
    finally:
        conn.close()
