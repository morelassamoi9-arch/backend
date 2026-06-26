# 🏗️ Architecture Propre — e-Citoyen CI

> Architecture recommandée basée sur l'audit du code existant (E-citoyenCI) et l'analyse de faisabilité.  
> **Objectif** : Une architecture claire, maintenable, et prête pour la démo du 28 juin 2026.

---

## I. Ce Qui Existe Déjà (État des Lieux)

Avant de proposer une architecture, voici ce qui **fonctionne déjà** dans E-citoyenCI :

### ✅ Backend opérationnel
- **FastAPI** avec rate limiting (SlowAPI), CORS configuré
- **3 agents CrewAI** (Accueil → Documentaliste → Rédacteur) via YAML
- **Groq llama-3.3-70b** comme LLM (gratuit)
- **SQLAlchemy + SQLite** (Users, Demandes, Reponses)
- **JWT Auth** (register, login, verify)
- **API demandes** avec CRUD complet + traitement CrewAI en arrière-plan
- **Base de connaissances** JSON (procedures.json — 2 démarches : acte_naissance, CNI)
- **Déployé sur Render** (`e-citoyen-ci-backend.onrender.com`)

### ✅ Frontend Web opérationnel
- **React 19 + Vite 8** (codé à la main)
- 10 pages : Landing, Login, CitizenDashboard, NewRequest, AIResponse, MyRequests, AgentDashboard, RequestManagement, RequestDetails, Statistics
- Vocal : Web Speech API (reconnaissance + synthèse)
- Composants UI : AppHeader, MobileNav, StatCard, StatusBadge

### ⚠️ Points faibles identifiés (audit)
- Double système Crew (crew.py YAML-based + crew_services.py inline) → confusion
- Tests quasi absents
- Endpoint `/api/demande` (Morel) synchrone bloquant + routes `/api/demandes/` (Manassé) async → **deux systèmes parallèles**
- Réponses mockées dans `demandes.py` + vraies réponses dans `routes.py`
- Compteur de tokens en mémoire non fiable

---

## II. Architecture Propre Proposée

### Diagramme Global

```
┌─────────────────────────────────────────────────────────────────────┐
│                    e-Citoyen CI — Architecture Propre                │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │   🌐 WEB APP      │
                    │ React 19 + Vite  │
                    │ (codé à la main) │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ 🔊 Couche Vocale  │
                    │ Web Speech API   │
                    │ STT + TTS        │
                    └────────┬─────────┘
                             │
                             │ HTTPS / API REST
                             │
              ┌──────────────▼──────────────┐
              │    🔧 BACKEND FASTAPI        │
              │    (Python 3.12 + UV)        │
              │    Déployé sur Render         │
              ├──────────────────────────────┤
              │                              │
              │  ┌────────────────────────┐  │
              │  │ 🔐 COUCHE AUTH         │  │
              │  │ JWT + bcrypt           │  │
              │  │ register / login       │  │
              │  └────────────────────────┘  │
              │                              │
              │  ┌────────────────────────┐  │
              │  │ 🛡️ COUCHE SÉCURITÉ     │  │
              │  │ Rate Limiting (3/min)  │  │
              │  │ CORS restreint         │  │
              │  │ Validation Pydantic    │  │
              │  └────────────────────────┘  │
              │                              │
              │  ┌────────────────────────┐  │
              │  │ 📡 COUCHE API          │  │
              │  │                        │  │
              │  │ POST /api/demande      │──┼──── Entrée principale
              │  │    (public, rate-limited)│  │     (texte citoyen → IA)
              │  │                        │  │
              │  │ POST /api/demandes/    │──┼──── Avec auth JWT
              │  │ GET  /api/demandes/    │  │     (historique, CRUD)
              │  │ GET  /api/demandes/:id │  │
              │  │                        │  │
              │  │ POST /api/auth/register│  │
              │  │ POST /api/auth/login   │  │
              │  │ GET  /api/auth/verify  │  │
              │  └───────────┬────────────┘  │
              │              │               │
              │  ┌───────────▼────────────┐  │
              │  │ 🧠 COUCHE AGENTS IA    │  │
              │  │ (CrewAI + Groq)        │  │
              │  │                        │  │
              │  │  ┌──────────────────┐  │  │
              │  │  │ 🤵 Agent Accueil │  │  │
              │  │  │ Comprendre la    │  │  │
              │  │  │ demande citoyen  │  │  │
              │  │  └────────┬─────────┘  │  │
              │  │           │             │  │
              │  │  ┌────────▼─────────┐  │  │
              │  │  │ 📚 Agent         │  │  │
              │  │  │ Documentaliste   │  │  │
              │  │  │ Consulte la base │  │  │
              │  │  │ de connaissances │  │  │
              │  │  └────────┬─────────┘  │  │
              │  │           │             │  │
              │  │  ┌────────▼─────────┐  │  │
              │  │  │ ✍️ Agent          │  │  │
              │  │  │ Rédacteur        │  │  │
              │  │  │ Réponse claire + │  │  │
              │  │  │ lettre si besoin │  │  │
              │  │  └──────────────────┘  │  │
              │  │                        │  │
              │  └───────────┬────────────┘  │
              │              │               │
              │  ┌───────────▼────────────┐  │
              │  │ 📖 BASE DE             │  │
              │  │ CONNAISSANCES          │  │
              │  │ procedures.json        │  │
              │  │                        │  │
              │  │ • acte_naissance       │  │
              │  │ • cni                  │  │
              │  │ • cnps_allocations ⬅ NEW│  │
              │  │ • cmu_inscription ⬅ NEW│  │
              │  │ • certificat_nat. ⬅ NEW│  │
              │  └────────────────────────┘  │
              │                              │
              │  ┌────────────────────────┐  │
              │  │ 💾 BASE DE DONNÉES     │  │
              │  │ SQLite (ecitoyen.db)   │  │
              │  │                        │  │
              │  │ Users (auth)           │  │
              │  │ Demandes (historique)   │  │
              │  │ Reponses (résultats IA)│  │
              │  └────────────────────────┘  │
              │                              │
              └──────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   ☁️ GROQ API               │
              │   llama-3.3-70b-versatile    │
              │   100K tokens/jour (gratuit) │
              │   → Developer tier le 26/06  │
              └──────────────────────────────┘
```

---

## III. Structure des Dossiers (Nettoyée)

```
E-citoyenCI/
│
├── 🔧 backend/
│   ├── main.py                         # Point d'entrée FastAPI
│   ├── pyproject.toml                  # Dépendances (uv)
│   ├── .env.example                    # Variables d'environnement
│   │
│   └── app/
│       ├── __init__.py
│       ├── limiter.py                  # Rate limiting config
│       │
│       ├── agents/                     # 🧠 COUCHE IA (à garder)
│       │   ├── crew.py                 # ECitoyenCrew (YAML-based) ← PRINCIPAL
│       │   ├── tools.py                # Outil: consulter_procedure
│       │   └── config/
│       │       ├── agents.yaml         # Définition des 3 agents
│       │       └── tasks.yaml          # Définition des 3 tâches
│       │
│       ├── knowledge/                  # 📖 BASE DE CONNAISSANCES
│       │   └── procedures.json         # ⚠️ À ENRICHIR (priorité #1)
│       │
│       ├── api/                        # 📡 COUCHE API
│       │   ├── __init__.py
│       │   ├── routes.py               # POST /api/demande (Morel) ← UNIFIER
│       │   ├── auth.py                 # Auth routes (Manassé)
│       │   ├── demandes.py             # CRUD demandes (Manassé)
│       │   └── users.py                # Users routes
│       │
│       ├── services/                   # 🔧 COUCHE SERVICES
│       │   ├── auth_services.py        # Logique auth
│       │   ├── crew_services.py        # ⚠️ À SUPPRIMER (doublon)
│       │   └── demandes_services.py    # Logique demandes
│       │
│       ├── database/                   # 💾 COUCHE BDD
│       │   ├── base.py                 # SQLAlchemy Base
│       │   ├── sessions.py             # Session factory
│       │   ├── models.py               # User, Demande, Reponse
│       │   └── migrations.py           # Schema migrations
│       │
│       ├── schemas/                    # 📋 VALIDATION
│       │   ├── demandes.py             # Pydantic schemas demandes
│       │   └── user.py                 # Pydantic schemas users
│       │
│       ├── auth/                       # 🔐 AUTH
│       │   └── dependencies.py         # get_current_user
│       │
│       ├── models/                     # 📋 SCHEMAS API
│       │   └── schemas.py              # DemandeCitoyen, ReponseCitoyen
│       │
│       └── tests/                      # 🧪 TESTS
│           └── test_crew.py            # ⚠️ À REMPLIR
│
├── 🌐 web/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.tsx                    # Point d'entrée React
│       ├── index.css                   # Styles globaux
│       │
│       ├── app/
│       │   ├── App.tsx                 # App root
│       │   ├── routes.tsx              # React Router config
│       │   │
│       │   ├── pages/                  # 📄 PAGES
│       │   │   ├── LandingPage.tsx     # Page d'accueil publique
│       │   │   ├── LoginPage.tsx       # Inscription / Connexion
│       │   │   ├── CitizenDashboard.tsx# Tableau de bord citoyen
│       │   │   ├── NewRequest.tsx      # Nouvelle demande (texte + vocal)
│       │   │   ├── AIResponse.tsx      # Réponse IA (plan + lettre)
│       │   │   ├── MyRequests.tsx      # Historique des demandes
│       │   │   ├── AgentDashboard.tsx  # Dashboard admin (V2)
│       │   │   ├── RequestManagement.tsx# Gestion demandes admin
│       │   │   ├── RequestDetails.tsx  # Détail demande admin
│       │   │   └── Statistics.tsx      # Statistiques admin
│       │   │
│       │   └── components/             # 🧩 COMPOSANTS
│       │       ├── AppHeader.tsx
│       │       ├── MobileNav.tsx
│       │       ├── StatCard.tsx
│       │       └── StatusBadge.tsx
│       │
│       ├── services/                   # 🔌 SERVICES API
│       │   └── api.ts                  # Appels HTTP vers le backend
│       │
│       └── styles/                     # 🎨 STYLES
│           └── *.css
│
├── 📱 mobile/                          # Squelette Expo/React Native (Fastshot ready)
│   ├── app/                            # Expo Router (navigation par fichier)
│   │   ├── _layout.tsx                 # Providers (Auth, Theme) & layout racine
│   │   ├── index.tsx                   # Accueil/Redirection automatique
│   │   ├── login.tsx                   # Authentification (Connexion/Inscription)
│   │   ├── (citizen)/                  # Espace Citoyen (Tabs)
│   │   │   ├── _layout.tsx             # Barre de navigation citoyen
│   │   │   ├── index.tsx               # Tableau de bord citoyen
│   │   │   ├── new-request.tsx         # Saisie demande (texte/vocal)
│   │   │   ├── requests.tsx            # Historique des demandes
│   │   │   └── request/
│   │   │       └── [id].tsx            # Détails + réponse IA unifiée
│   │   └── (agent)/                    # Espace Agent Public (Tabs)
│   │       ├── _layout.tsx             # Barre de navigation agent
│   │       ├── index.tsx               # Tableau de bord agent
│   │       ├── requests.tsx            # Liste de gestion des demandes
│   │       ├── request/
│   │       │   └── [id].tsx            # Détails demande agent + validation
│   │       └── statistics.tsx          # Statistiques administratives
│   ├── components/                     # Composants UI partagés
│   │   ├── AppHeader.tsx               # En-tête avec informations utilisateur
│   │   └── StatusBadge.tsx             # Badge de statut (En cours, Traité, etc.)
│   ├── constants/
│   │   └── theme.ts                    # Couleurs, espacements et tokens de la marque
│   ├── hooks/
│   │   └── useAuth.ts                  # Hook de gestion de session JWT (AsyncStorage)
│   ├── services/
│   │   └── api.ts                      # Client d'intégration API Backend
│   ├── package.json                    # Dépendances (Expo, Safe Area, Router, etc.)
│   └── app.json                        # Configuration de l'application mobile
│
├── .gitignore
├── README.md                           # Doc principale
└── audite.md                           # Audit sécurité
```

---

## IV. Flux de Données — Scénario Complet

```
┌─────────────────────────────────────────────────────────────────────┐
│ FLUX : Le citoyen déclare "Mon enfant est né hier à Anyama"        │
└─────────────────────────────────────────────────────────────────────┘

  ÉTAPE 1 — SAISIE (Web)
  ───────────────────────
  Le citoyen tape ou dicte sa demande (Web Speech API)
  ┌──────────────────────┐
  │ 🎤 "Mon enfant est   │   Texte OU voix
  │ né hier à Anyama,    │──────────────────────────┐
  │ mais je n'ai pas     │                          │
  │ d'acte de mariage"   │                          │
  └──────────────────────┘                          │
                                                     │
  ÉTAPE 2 — API (Backend)                            │
  ─────────────────────────                          ▼
  POST /api/demande                       ┌─────────────────────┐
  {                                       │ FastAPI reçoit       │
    "message": "Mon enfant est né..."     │ • Valide (Pydantic)  │
  }                                       │ • Rate limit check   │
                                          └──────────┬──────────┘
                                                     │
  ÉTAPE 3 — AGENTS IA (CrewAI)                       │
  ──────────────────────────────                     ▼

  ┌─────────────────────────────────────────────────────────┐
  │                                                          │
  │  🤵 Agent Accueil                                       │
  │  Input: "Mon enfant est né hier à Anyama..."            │
  │  Output: {                                              │
  │    demarche_identifiee: "acte_naissance",               │
  │    cas_particulier: true,                               │
  │    description_cas_particulier: "naissance hors mariage, │
  │       reconnaissance paternelle nécessaire",            │
  │    resume_situation: "Déclaration de naissance avec      │
  │       cas particulier: pas d'acte de mariage"           │
  │  }                                                      │
  │              │                                          │
  │              ▼                                          │
  │  📚 Agent Documentaliste                                │
  │  → Appelle l'outil consulter_procedure("acte_naissance")│
  │  → Lit procedures.json                                  │
  │  → Trouve le cas_particulier "naissance_hors_mariage"   │
  │  Output: {                                              │
  │    demarche: "Acte de naissance",                       │
  │    documents_requis: [...],                             │
  │    lieu: "Mairie du lieu de naissance",                 │
  │    delai: "3 mois",                                    │
  │    cout: "Gratuit dans le délai légal",                 │
  │    note_cas_particulier: "La reconnaissance paternelle  │
  │       est une démarche distincte..."                    │
  │  }                                                      │
  │              │                                          │
  │              ▼                                          │
  │  ✍️ Agent Rédacteur                                     │
  │  → Rédige un plan clair pour le citoyen                │
  │  → Génère une lettre si nécessaire                     │
  │  Output: {                                              │
  │    resume_situation: "Votre enfant est né à Anyama...", │
  │    plan_action: ["1. ...", "2. ...", "3. ..."],        │
  │    documents_a_apporter: [...],                         │
  │    lieu: "Mairie d'Anyama",                            │
  │    delai_estime: "1 à 3 jours",                        │
  │    cout: "Gratuit",                                     │
  │    lettre_generee: true,                               │
  │    contenu_lettre: "Objet: Déclaration de naissance..." │
  │  }                                                      │
  │                                                          │
  └─────────────────────────────────────────────────────────┘
                          │
  ÉTAPE 4 — RÉPONSE       │
  ─────────────────────    ▼

  ┌──────────────────────────────────────────────────┐
  │ 📱 Le citoyen voit sur l'interface web :          │
  │                                                   │
  │ ✅ Résumé : "Votre enfant est né à Anyama..."    │
  │                                                   │
  │ 📋 Plan d'action :                                │
  │    1. Se rendre à la Mairie d'Anyama              │
  │    2. Apporter le certificat médical              │
  │    3. Déclarer la naissance dans les 3 mois       │
  │    4. Pour la reconnaissance paternelle...        │
  │                                                   │
  │ 📄 Documents à apporter : [...]                   │
  │ 📍 Lieu : Mairie d'Anyama                        │
  │ ⏱️ Délai : 1 à 3 jours                           │
  │ 💰 Coût : Gratuit                                │
  │                                                   │
  │ ✉️ Lettre générée :                               │
  │    [📋 Copier]  [✉️ Email]                        │
  │                                                   │
  │ 🔊 [Écouter la réponse]                          │
  │                                                   │
  └──────────────────────────────────────────────────┘
```

---

## V. Les 5 Actions Prioritaires (2 jours)

### 🔴 Action 1 : UNIFIER les deux systèmes Crew

**Problème** : Il existe DEUX systèmes d'agents parallèles.

| Fichier | Auteur | Approche | LLM |
|---------|--------|----------|-----|
| `app/agents/crew.py` | Morel | YAML + Pydantic output | Groq llama-3.3-70b |
| `app/services/crew_services.py` | Manassé | Inline + JSON parsing | Groq mixtral-8x7b |

**Solution** : **Garder `crew.py` (Morel)** — il est supérieur :
- Utilise les décorateurs CrewAI natifs (`@CrewBase`, `@agent`, `@task`)
- Outputs structurés Pydantic (pas de parsing JSON fragile)
- Config YAML séparée (plus maintenable)
- Utilise llama-3.3-70b (plus performant que mixtral)

**→ Supprimer** `crew_services.py` et faire pointer `demandes.py` vers `crew.py`.

---

### 🔴 Action 2 : UNIFIER les deux routes API

**Problème** : Deux endpoints font la même chose.

| Route | Fichier | Auth | Méthode |
|-------|---------|------|---------|
| `POST /api/demande` | routes.py | Aucune (rate limit seulement) | Synchrone, bloquant |
| `POST /api/demandes/` | demandes.py | JWT requis | Async, background task |

**Solution** : Garder les deux, mais les spécialiser :

```
POST /api/demande         → Démo rapide SANS compte (landing page)
                            Rate limited, pas d'historique

POST /api/demandes/       → Usage réel AVEC compte (CitizenDashboard)
                            Auth JWT, historique, background task
                            → Mais utiliser crew.py au lieu de crew_services.py
```

---

### 🟡 Action 3 : ENRICHIR procedures.json

**Priorité absolue** pour la crédibilité. Actuellement : 2 démarches (acte_naissance, CNI).

**Ajouter au minimum :**

```json
{
  "demarches": {
    "acte_naissance": { ... },          // ✅ Existe
    "cni": { ... },                     // ✅ Existe
    "cnps_allocations": {               // ⬅ À AJOUTER
      "nom": "Allocations familiales CNPS",
      "documents_requis": [...],
      "lieu": "Agence CNPS la plus proche",
      "delai_legal": "1 à 2 mois",
      "cout": "Gratuit"
    },
    "cmu_inscription": {                // ⬅ À AJOUTER
      "nom": "Inscription CMU",
      "documents_requis": [...],
      "lieu": "Point d'enrôlement CMU",
      "delai_legal": "Immédiat après enrôlement",
      "cout": "1000 FCFA/an"
    },
    "certificat_nationalite": {         // ⬅ À AJOUTER
      "nom": "Certificat de nationalité ivoirienne",
      "documents_requis": [...],
      "lieu": "Tribunal de Première Instance",
      "delai_legal": "Variable",
      "cout": "Payant"
    }
  },
  "_dependances": {
    "cni": ["acte_naissance", "certificat_nationalite"],
    "cnps_allocations": ["acte_naissance"],
    "cmu_inscription": ["acte_naissance"]
  }
}
```

**→ C'est le travail de Joran (Responsable recherche)**. Les vraies procédures ivoiriennes doivent remplacer les données de test.

---

### 🟡 Action 4 : CORRIGER l'endpoint synchrone

**Problème** : `POST /api/demande` dans `routes.py` utilise `time.sleep()` et bloque le worker.

**Solution rapide** (sans tout refactorer) :

```python
# routes.py — changer def → async def, time.sleep → asyncio.sleep
import asyncio

@router.post("/demande", ...)
@limiter.limit("3/minute")
async def traiter_demande(request: Request, demande: DemandeCitoyen):
    # Lancer le crew dans un thread pour ne pas bloquer l'event loop
    resultat = await asyncio.to_thread(
        ECitoyenCrew().crew().kickoff,
        inputs={"demande_citoyen": demande.message}
    )
    ...
```

---

### 🟢 Action 5 : PRÉPARER le scénario de démo

Le parcours exact à montrer lors du pitch :

```
1. Ouvrir le site web → LandingPage
2. Montrer l'interface → "Bonjour, décrivez votre situation"
3. Taper ou dicter : "Mon enfant est né hier au CHU de Cocody"
4. Attendre la réponse des 3 agents (~15-30 secondes)
5. Montrer le plan d'action structuré
6. Montrer la lettre générée → [Copier] [Email]
7. Cliquer sur 🔊 pour écouter la réponse (synthèse vocale)
8. (Bonus) Se connecter → voir l'historique des demandes
9. (Bonus) Montrer le dashboard agent/fonctionnaire
```

---

## VI. Stack Technique Finale

| Couche | Technologie | Statut |
|--------|-------------|--------|
| **Frontend Web** | React 19 + Vite 8 + React Router | ✅ Opérationnel |
| **Vocal** | Web Speech API (STT + TTS) | ✅ En cours |
| **Backend** | FastAPI + Python 3.12 + UV | ✅ Opérationnel (CORS prêt pour mobile) |
| **Agents IA** | CrewAI 1.14.7 (YAML config) | ✅ Opérationnel |
| **LLM** | Groq llama-3.3-70b-versatile | ✅ Opérationnel |
| **BDD** | SQLAlchemy + SQLite | ✅ Opérationnel |
| **Auth** | JWT + bcrypt | ✅ Opérationnel |
| **Sécurité** | SlowAPI + CORS + Pydantic | ✅ Opérationnel |
| **Connaissances** | procedures.json | ⚠️ À enrichir |
| **Déploiement** | Render (backend) | ✅ Déployé |
| **Mobile** | Expo (React Native) + Expo Router | 🚀 Prioritaire (Fastshot ready) |

---

## VII. Ce Qu'il Ne Faut PAS Faire

| ❌ Ne pas faire | ✅ Faire à la place |
|-----------------|---------------------|
| Ajouter PostgreSQL, Redis, MinIO | Garder SQLite (suffisant pour la démo) |
| Créer des simulateurs séparés (Mairie, CNPS, CMU) | Enrichir procedures.json |
| Coder l'application mobile de zéro | Utiliser Fastshot sur le squelette d'architecture propre mobile |
| Ajouter Docker | Déployer directement sur Render |
| Implémenter l'OTP SMS | Garder l'auth email/password |
| Créer 15 agents IA | Garder les 3 agents actuels |
| Refactorer tout le code | Corriger uniquement les bugs critiques |

---

## VIII. Résumé des Responsabilités (2 jours)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RÉPARTITION FINALE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  👤 Morel (Chef d'équipe)                                           │
│  ├── Unifier les deux systèmes Crew → un seul crew.py              │
│  ├── Corriger l'endpoint synchrone → async                         │
│  ├── Vérifier le déploiement Render                                │
│  ├── Générer/Finaliser le mobile via Fastshot                      │
│  └── Coordonner l'intégration finale                               │
│                                                                      │
│  👤 Manassé (Responsable technique)                                 │
│  ├── Brancher demandes.py sur crew.py (supprimer crew_services.py) │
│  ├── Tester le flux complet POST /api/demandes/ → IA → réponse    │
│  ├── Configurer les origines CORS pour l'app mobile (Expo local)     │
│  ├── Corriger les bugs backend restants                             │
│  └── Stress test de la démo (5 scénarios)                          │
│                                                                      │
│  👤 Fahisol (Responsable communication)                              │
│  ├── Finaliser le vocal web (STT + TTS)                            │
│  ├── S'assurer que NewRequest → AIResponse fonctionne              │
│  ├── Polir l'interface pour la démo                                │
│  └── Enregistrer la vidéo backup de la démo                        │
│                                                                      │
│  👤 Joran (Responsable recherche)                                    │
│  ├── ENRICHIR procedures.json avec 3-5 vraies procédures           │
│  ├── Vérifier que les données sont exactes (sources officielles)   │
│  └── Aider à préparer les slides du pitch                         │
│                                                                      │
│  👤 Béni (Responsable projet)                                       │
│  ├── Préparer le pitch (slides, script, timing)                    │
│  ├── Mettre à jour le README final                                 │
│  ├── Organiser les répétitions de démo                             │
│  └── Préparer le plan B (vidéo + captures d'écran)                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## X. Guide d'Intégration Mobile & Fastshot (Pour Morel)

Pour assurer une intégration sans friction de l'application mobile grâce à Fastshot tout en gardant l'architecture propre, voici les lignes directrices techniques.

### 1. Intégration de l'API & Gestion de Session
L'application mobile communique avec les mêmes endpoints backend que le web. Les principales adaptations résident dans la persistance du JWT :
* **Stockage local** : Le web utilise `localStorage`. Sur mobile (React Native/Expo), il faut utiliser `@react-native-async-storage/async-storage` pour éviter les pertes de session.
* **Redirections** : Remplacer les redirections DOM (`window.location.href = '/login'`) par le routeur d'Expo (`router.replace('/login')`).
* **URL du Serveur (API_URL)** : En développement local, `localhost` ne fonctionne pas sur émulateur/appareil physique. Il faut utiliser l'adresse IP locale du PC (ex: `http://192.168.1.X:8000`) ou l'URL de production Render (`https://e-citoyen-ci-backend.onrender.com`).

#### Client API Mobile (`mobile/services/api.ts`) :
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API_URL = "https://e-citoyen-ci-backend.onrender.com"; // Remplacer par l'IP locale en dev

async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}/api${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/login');
    throw new Error('Non authentifié');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    logout: async () => {
      await AsyncStorage.multiRemove(['token', 'user']);
      router.replace('/login');
    }
  },
  demandes: {
    create: (data: { message: string }) => request('/demandes/', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => request('/demandes/'),
    getOne: (id: string) => request(`/demandes/${id}`),
    getStats: () => request('/demandes/stats/overview'),
  }
};
```

---

### 2. Adaptation du Module Vocal (STT & TTS)
Sur le Web, le projet utilise l'API native `Web Speech API` (`window.speechSynthesis` et `window.SpeechRecognition`). Celle-ci n'est pas disponible sur React Native. 

Pour le mobile, Morel doit s'assurer que Fastshot utilise les modules Expo suivants :
* **Synthèse vocale (Lecture - TTS)** : Utiliser `expo-speech`
  ```typescript
  import * as Speech from 'expo-speech';
  // Exemple de lecture :
  Speech.speak("Votre acte de naissance est prêt.", { language: 'fr-FR' });
  ```
* **Reconnaissance vocale (Saisie - STT)** : Utiliser `expo-speech-recognition`
  ```typescript
  import { SpeechRecognition } from 'expo-speech-recognition';
  // Exemple d'écoute :
  const startListening = async () => {
    const { granted } = await SpeechRecognition.requestPermissionsAsync();
    if (granted) {
      SpeechRecognition.start({
        lang: "fr-CIV", // français de Côte d'Ivoire
        onResult: (event) => {
          console.log(event.transcript);
        }
      });
    }
  };
  ```

---

### 3. Guide de Génération Fastshot
Pour générer les interfaces avec Fastshot, Morel peut copier-coller cette invite (prompt) structurée dans l'outil de génération :

> **Prompt de Génération Fastshot pour e-Citoyen CI :**
> 
> Génère les écrans de l'application mobile en React Native Expo avec Expo Router en respectant la charte graphique et la structure technique suivante :
> 
> **1. Charte Graphique & Design (CSS/Tailwind)** :
> - Couleur primaire (Terracotta) : `#C86A4A`
> - Couleur secondaire (Vert forêt) : `#2E6B57`
> - Couleur d'accentuation (Orange tampon) : `#D9622B`
> - Couleur de fond (Parchemin de confiance) : `#F5EFE3`
> - Style : Esthétique officielle épurée et rassurante (police avec empattement ou style machine à écrire pour les titres officiels, type d'écriture d'administration publique).
> 
> **2. Écrans à implémenter** :
> - `app/login.tsx` : Écran double Connexion / Inscription.
> - `app/(citizen)/index.tsx` : Dashboard Citoyen affichant le statut de la dernière demande et un bouton d'action principal bien visible "Nouvelle demande".
> - `app/(citizen)/new-request.tsx` : Formulaire avec un champ texte extensible pour décrire sa situation, accompagné d'un bouton micro (vocal) interactif et animé pour dicter son message.
> - `app/(citizen)/request/[id].tsx` : Affichage de la réponse structurée de l'IA (Résumé, Plan d'action par étapes, Documents requis sous forme de liste à cocher interactive, Lieu, Délai, Coût, Lettre officielle générée avec bouton de copie, et bouton de lecture vocale TTS).
> - `app/(citizen)/requests.tsx` : Historique des demandes passées avec badges de statut colorés.
> 
> **3. Intégration logique** :
> - Importer le client API de `@/services/api` et le hook d'authentification `@/hooks/useAuth`.
> - Utiliser `AsyncStorage` pour sauvegarder et charger le token JWT.
> - Intégrer les retours haptiques via `expo-haptics` lors du clic sur le bouton d'enregistrement vocal.
> - Utiliser `expo-speech` pour la lecture vocale à haute voix du plan d'action.

---

### 4. Configuration Réseau Importante (Pour Manassé)
Pour que l'application mobile puisse tester les requêtes en local :
1. Dans `backend/main.py`, autoriser les requêtes CORS provenant du client Expo (généralement sans origine fixe ou provenant d'un port local comme `localhost:8081` ou `192.168.X.X:*`).
2. S'assurer que le CORS accepte toutes les origines en mode développement :
   ```python
   # backend/main.py
   # Permettre aux simulateurs mobiles de requêter l'API locale
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"], # Recommandé uniquement pour le dev/demo locale
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

*Dernière mise à jour : 25 juin 2026 — Ajout du module d'intégration mobile et Fastshot*
