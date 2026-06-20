# e-Citoyen CI

**Assistant administratif intelligent pour les citoyens ivoiriens**

Projet réalisé par l'équipe **IA Force CI (Team 17)** dans le cadre du **Challenge IA 2026** — Leading Change Africa & Intro Group.

Thème : *Écosystème multi-agents pour automatiser les services administratifs publics*

---

## Le problème

En Côte d'Ivoire, accomplir une démarche administrative simple (acte de naissance, CNI, allocations CNPS, inscription CMU) prend souvent plusieurs jours et plusieurs déplacements, car :

- le citoyen ne sait pas quels documents rassembler
- les procédures changent selon les situations (acte perdu, naissance hors mariage, etc.)
- l'information est dispersée entre administrations qui ne communiquent pas entre elles
- chaque guichet demande des justificatifs que l'État possède déjà ailleurs

Un événement de vie simple, comme la naissance d'un enfant, déclenche en réalité **trois démarches séparées** (Mairie, CNPS, CMU), que le citoyen doit aujourd'hui gérer seul, guichet par guichet.

## La solution

e-Citoyen CI est un assistant conversationnel — utilisable **au clavier ou à la voix** — qui comprend la situation d'un citoyen en langage naturel, identifie automatiquement les démarches concernées, et produit un plan d'action complet et personnalisé — y compris pour des cas particuliers que des règles fixes ne couvriraient pas (document perdu, situation familiale atypique, etc.).

Le système repose sur une **architecture multi-agents** : plusieurs agents IA spécialisés collaborent, chacun avec un rôle précis, plutôt qu'un seul modèle généraliste qui répond de façon approximative à tout.

### Exemple

```
Citoyen : "Mon enfant est né hier à Anyama, mais je n'ai pas
           encore d'acte de mariage avec le père"

→ Agent Accueil      : identifie un cas complexe (naissance + 
                        reconnaissance paternelle à traiter séparément)
→ Agent Documentaliste : récupère les procédures exactes pour 
                        chaque démarche concernée
→ Agent Rédacteur     : génère un plan clair, les délais, les lieux,
                        et une lettre de déclaration prête à imprimer
```

## Architecture réelle

```
┌──────────────┐     ┌──────────────┐
│   Web App    │     │  Mobile App  │
│ (React/Vite, │     │  (Fastshot,  │
│  codé main)  │     │ React Native)│
└──────┬───────┘     └──────┬───────┘
       │                    │
       └─────────┬──────────┘
                  │  API REST (HTTPS)
                  ▼
       ┌─────────────────────────┐
       │   Backend FastAPI        │
       │   déployé sur Render      │
       └──────────┬───────────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │   Orchestration CrewAI        │
   │                                │
   │  Agent Accueil                │
   │       │                       │
   │       ▼                       │
   │  Agent Documentaliste         │
   │       │                       │
   │       ▼                       │
   │  Agent Rédacteur              │
   └──────────────┬─────────────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │  Base de connaissances│
       │  (procedures.json)     │
       └─────────────────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │   Groq (llama-3.3-     │
       │   70b-versatile)        │
       └─────────────────────┘
```

> ⚠️ **Web ≠ Mobile** : le **web** est codé à la main (React + Vite), Fastshot est imposé par les organisateurs **pour le mobile uniquement**.

### Les 3 agents

| Agent | Rôle |
|---|---|
| **Agent Accueil** | Comprend la demande du citoyen, même formulée de façon imprécise ou avec des complications imprévues, et identifie l'événement de vie concerné |
| **Agent Documentaliste** | Interroge la base de connaissances des procédures administratives ivoiriennes et détermine les documents, délais et bureaux compétents pour chaque démarche identifiée |
| **Agent Rédacteur** | Compile une réponse claire et personnalisée pour le citoyen, et génère si besoin un courrier ou une liste prête à utiliser |

## Stack technique

| Composant | Technologie | Notes |
|---|---|---|
| Backend & agents IA | Python 3.12, CrewAI 1.14.7, FastAPI, UV | Code écrit et maîtrisé par l'équipe |
| LLM | Groq — llama-3.3-70b-versatile | Tier gratuit (100 000 tokens/jour) — upgrade Developer tier prévu le **26 juin** |
| Base de connaissances | `backend/app/knowledge/procedures.json` | Données de **test** actuellement — vraies procédures en cours de collecte par Joran |
| Déploiement backend | **Render** (Web Service, tier gratuit) | URL : `https://e-citoyen-ci-backend.onrender.com` — cold start ~30-60s après inactivité |
| Interface Web | React 19 + Vite 8, codé à la main | Formulaire + vocal (reconnaissance et synthèse, Web Speech API) + copier/email de la lettre générée |
| Application mobile | **Fastshot** (fastshot.ai) — React Native / Expo | Imposé par les organisateurs. Reproduit le web (texte + vocal via `expo-speech-recognition` / `expo-speech`) |
| Gestion de version | GitHub (`morelassamoi9-arch/backend`) | Voir section *Accès au dépôt* ci-dessous |

## Fonctionnalités vocales

Le web intègre une saisie et une restitution vocales, pour rester utilisable par un citoyen peu à l'aise avec l'écrit :

- 🎤 **Reconnaissance vocale** (parole → texte) — Web Speech API du navigateur, `fr-FR`
- 🔊 **Synthèse vocale** (texte → parole) — lit l'intégralité de la réponse (résumé, plan d'action, documents, lieu/délai/coût) sur clic d'un bouton, jamais automatiquement
- 📋 **Copier** et ✉️ **Envoyer par email** la lettre administrative générée, quand l'agent en produit une

Le mobile (Fastshot) vise à reproduire ces mêmes fonctionnalités — en cours de génération.

## Démarrer le projet en local

### Prérequis
- Python 3.12 (géré automatiquement par `uv` si absent)
- [uv](https://docs.astral.sh/uv/) installé
- Node.js + npm (pour le web)
- Une clé API Groq (demander à Morel — jamais committée dans le repo)

### Backend

```bash
cd backend
cp .env.example .env   # puis coller la clé GROQ_API_KEY réelle dans .env (jamais sur GitHub)
uv sync
uv run uvicorn main:app --reload --port 8000
```

L'API est disponible sur `http://localhost:8000`, documentation interactive sur `http://localhost:8000/docs`.

### Web

```bash
cd web
npm install
npm run dev
```

Le web local appelle par défaut l'API déployée sur Render (`https://e-citoyen-ci-backend.onrender.com`). Pour tester contre ton backend local à la place, modifie `API_URL` dans `web/src/App.jsx` pour pointer vers `http://localhost:8000/api/demande`.

> ⚠️ Chaque requête (locale ou via Render) consomme le quota Groq partagé (100 000 tokens/jour sur le tier gratuit actuel). Éviter les tests en rafale — un test bien choisi à la fois.

## Accès au dépôt

Le dépôt est **public** sur GitHub : `https://github.com/morelassamoi9-arch/backend`

Pour pouvoir **pousser du code** (pas juste le lire), il faut être ajouté comme collaborateur — demander à Morel d'envoyer l'invitation GitHub.

## Périmètre du MVP

Le MVP se concentre sur **un scénario de vie traité de bout en bout** plutôt que sur une couverture large et superficielle :

- **Scénario principal** : naissance d'un enfant (Mairie, CNPS, CMU)
- **Scénario secondaire** (si le temps le permet) : demande de carte nationale d'identité

Volontairement exclus du MVP : connexions à de vraies API gouvernementales, paiement Mobile Money, signature électronique, blockchain/traçabilité, authentification biométrique. Ces éléments relèvent d'une vision long terme du projet, pas d'une démonstration en 2 semaines.

## Équipe — IA Force CI (Team 17)

| Membre | Rôle |
|---|---|
| Morel Assamoi | Chef d'équipe — architecture, coordination, lien mentor, déploiement |
| Manassé | Responsable technique — agents CrewAI, backend FastAPI |
| Fahisol | Responsable communication — interfaces (web & mobile), daily updates |
| Béni | Responsable projet — GitHub, base de connaissances, organisation des tâches |
| Joran | Responsable recherche — collecte des procédures administratives réelles |

## Calendrier

| Période | Étape | Statut |
|---|---|---|
| 15–21 juin | Backend agents + API + web (texte et vocal) | ✅ Fait |
| 22–23 juin | Stabilisation vocal web | En cours |
| 24–26 juin | Mobile Fastshot (texte + vocal) | À venir |
| **26 juin** | Upgrade Groq tier Developer | Planifié |
| 27 juin | Tests finaux croisés web/mobile | À venir |
| 28 juin | Démo + pitch | — |
| 29 juin – 12 juillet | Pitch final & évaluation | — |

## Critères d'évaluation visés

Solution proposée · Usage pertinent de l'IA · Innovation · Faisabilité SMART · Impact potentiel · Qualité du pitch

---

*Challenge IA 2026 — Leading Change Africa & Intro Group*