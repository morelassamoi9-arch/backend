Audit statique effectuée sur C:\Users\PC\e-citoyen\backend hors venv. Je n’ai pas pu lancer les commandes shell/tests: PowerShell expirait
  même sur des commandes simples, donc les constats ci-dessous viennent de la lecture du code et des manifests.

  Constats Critiques

  - API LLM publique sans authentification ni rate limiting: POST /api/demande déclenche directement un appel CrewAI/Groq coûteux. Un tiers
    peut vider le quota ou provoquer un déni de service. Voir /C:/Users/PC/e-citoyen/backend/backend/app/api/routes.py:29 et /C:/Users/PC/e-
    citoyen/backend/backend/app/api/routes.py:51.
    Correction: ajouter auth/API key ou session, rate limiting par IP/utilisateur, quotas, et retourner 429 quand le budget est dépassé.

  - CORS totalement ouvert avec credentials activés: allow_origins=["*"], allow_credentials=True, toutes méthodes et headers. Voir /C:/Users/
    PC/e-citoyen/backend/backend/main.py:19.
    Correction: restreindre aux domaines web/mobile réels via variable d’environnement, désactiver credentials si non utilisés.

  - Endpoint synchrone bloquant: la route FastAPI est def, appelle un LLM long, puis utilise time.sleep. Sous charge, chaque requête bloque un
    worker. Voir /C:/Users/PC/e-citoyen/backend/backend/app/api/routes.py:34 et /C:/Users/PC/e-citoyen/backend/backend/app/api/routes.py:71.
    Correction: passer par queue/background worker, timeout strict, circuit breaker, et asyncio.sleep si route async.

  Constats Sécurité Élevés

  - Risque de fuite de données personnelles dans les logs: les agents sont en verbose=True et les exceptions provider sont loggées. Les
    demandes citoyennes peuvent contenir identité, situation familiale, documents perdus, etc. Voir /C:/Users/PC/e-citoyen/backend/backend/
    app/agents/crew.py:80 et /C:/Users/PC/e-citoyen/backend/backend/app/api/routes.py:57.
    Correction: désactiver verbose en production, filtrer/redacter les logs, ne jamais logger le prompt complet ni la réponse LLM brute.

  - Prompt injection non encadrée: le texte utilisateur est injecté directement dans la tâche CrewAI. Voir /C:/Users/PC/e-citoyen/backend/
    backend/app/agents/config/tasks.yaml:3.
    Correction: ajouter règles système explicites contre les instructions utilisateur qui demandent d’ignorer la base de connaissances, forcer
    citations/provenance depuis procedures.json, refuser les sujets hors démarches administratives.

  - Pas de timeout applicatif sur le LLM: seules les tentatives sont gérées; une requête peut rester longtemps suspendue. Voir /C:/Users/PC/e-
    citoyen/backend/backend/app/api/routes.py:49.
    Correction: timeout par appel provider, deadline globale par requête, et annulation propre.

  - Fuite de chemin local en cas de base de connaissances manquante: l’outil retourne le chemin absolu interne. Voir /C:/Users/PC/e-citoyen/
    backend/backend/app/agents/tools.py:20.
    Correction: retourner un message générique côté utilisateur et logger le chemin côté serveur uniquement.

  Constats Code / Qualité

  - Tests quasi absents: /C:/Users/PC/e-citoyen/backend/backend/tests/test_crew.py est vide. test_connexion.py exécute un appel LLM au
    chargement, ce qui peut consommer du quota pendant une découverte de tests. Voir /C:/Users/PC/e-citoyen/backend/backend/
    test_connexion.py:22.
    Correction: tests unitaires pour extraire_delai_attente, validation schéma, route avec mock CrewAI, cas d’erreur, CORS; mettre le script
    de connexion sous if __name__ == "__main__".

  - Compteur de tokens en mémoire non fiable et non thread-safe. Il est global, réinitialisé au redémarrage, et peut être faux avec plusieurs
    workers. Voir /C:/Users/PC/e-citoyen/backend/backend/app/api/routes.py:25.
    Correction: stockage Redis/DB ou métrique provider; verrouillage si compteur local conservé.

  - Dépendances peu reproductibles: pyproject.toml utilise uniquement des bornes basses (>=) et le frontend utilise des carets. Voir /C:/
    Users/PC/e-citoyen/backend/backend/pyproject.toml:6 et /C:/Users/PC/e-citoyen/backend/web/package.json:12.
    Correction: utiliser les lockfiles en CI/prod, pinner ou borner les versions majeures.

  - Frontend hard-code http://localhost:8000, ce qui casse en production et interdit HTTPS propre sans rebuild manuel. Voir
    /C:/Users/PC/e-citoyen/backend/web/src/App.jsx:3.
    Correction: import.meta.env.VITE_API_URL.

  - Import Google Fonts externe: fuite potentielle IP/referrer vers Google pour un service citoyen. Voir /C:/Users/PC/e-citoyen/backend/web/
    src/index.css:1.
    Correction: héberger les polices localement ou utiliser system fonts.

  Points positifs

  - .env est bien ignoré et aucun fichier .env n’a été trouvé dans le projet.
  - La taille d’entrée utilisateur est limitée à 2000 caractères via Pydantic. Voir /C:/Users/PC/e-citoyen/backend/backend/app/models/
    schemas.py:7.

  - Le frontend rend les textes via React, sans dangerouslySetInnerHTML, donc le risque XSS direct est faible.

  Priorité de remédiation: auth/rate limiting, CORS, timeouts/worker async, puis logs/PII et tests avec mocks LLM.

─ Worked for 3m 54s ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
