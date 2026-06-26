# PROMPT DE GÉNÉRATION DE L'APPLICATION MOBILE (EXPO / REACT NATIVE)

> **Instructions** : Copiez-collez l'intégralité du texte ci-dessous dans votre outil de génération de code IA (Fastshot, Cursor, Claude, etc.) pour générer la structure et le code de l'application mobile.

---

```text
Tu es un expert React Native et Expo. Génère le code complet pour l'application mobile "e-Citoyen CI" (assistant IA pour les démarches administratives en Côte d'Ivoire) sous Expo (TypeScript) avec Expo Router, en respectant scrupuleusement l'architecture technique et le design system décrits ci-dessous.

Ne crée pas de fausses pages ou de structures alternatives, conforme-toi exactement à ce plan de dossiers.

---

### 1. CHARTE GRAPHIQUE & STYLE (Tailwind / NativeWind ou Stylesheet)
- Fond de l'application (Parchemin de confiance) : `#F5EFE3`
- Couleur primaire / Boutons (Terracotta) : `#C86A4A`
- Couleur secondaire / Validation (Vert forêt) : `#2E6B57`
- Couleur d'accentuation / Status (Orange tampon) : `#D9622B`
- Texte principal : `#1E1E1E`
- Typographie : Esthétique soignée, épurée et solennelle (style papier administratif officiel avec des cartes blanches bien espacées et des ombres légères).

---

### 2. INFRASTRUCTURE & SERVICES DE BASE

Génère d'abord les fichiers d'infrastructure suivants :

#### 📁 `constants/theme.ts`
Exporte la palette de couleurs et les espacements de la charte graphique sous forme de constantes TypeScript réutilisables.

#### 📁 `services/api.ts`
Un client API basé sur `fetch` communiquant avec le backend FastAPI :
- API_URL de production : `https://e-citoyen-ci-backend.onrender.com`
- Préfixe automatique `/api` sur toutes les routes.
- Ajoute automatiquement le jeton JWT dans les en-têtes sous la forme `Authorization: Bearer <token>` s'il est stocké dans `@react-native-async-storage/async-storage`.
- Si l'API renvoie un statut `401`, efface le token et redirige automatiquement vers `/login` en utilisant `router.replace('/login')`.
- Endpoints implémentés :
  - `auth.login(data)` -> `POST /auth/login`
  - `auth.register(data)` -> `POST /auth/register`
  - `demandes.create(message)` -> `POST /demandes/` { "message": message }
  - `demandes.getAll()` -> `GET /demandes/`
  - `demandes.getOne(id)` -> `GET /demandes/{id}`
  - `demandes.getStats()` -> `GET /demandes/stats/overview`

#### 📁 `hooks/useAuth.ts`
Un hook global gérant l'authentification avec `AsyncStorage` :
- Méthodes exposées : `login(email, password)`, `register(nom, email, password)`, `logout()`.
- Variables exposées : `user` (objet utilisateur), `token` (string), `isAuthenticated` (boolean), `loading` (boolean).

---

### 3. COMPOSANTS PARTAGÉS

#### 📁 `components/AppHeader.tsx`
Barre supérieure affichant :
- À gauche : Le logo de l'application et le titre "e-Citoyen CI" (style officiel ivoirien).
- À droite : Les initiales de l'utilisateur connecté dans un cercle vert forêt, qui au clic affiche un menu pour se déconnecter.

#### 📁 `components/StatusBadge.tsx`
Badge de statut pour les demandes (prend en paramètre un `status` string) :
- "En cours" / "Brouillon" : fond orange léger, texte `#D9622B`
- "Traité" / "Validé" : fond vert léger, texte `#2E6B57`
- "Rejeté" : fond rouge léger, texte foncé

---

### 4. STRUCTURE DE NAVIGATION & ÉCRANS (EXPO ROUTER)

Génère tous les fichiers d'écrans dans le dossier `app/` en utilisant Expo Router :

#### 📁 `app/_layout.tsx`
Layout racine enveloppant l'application dans les providers d'authentification (`useAuth`), la zone de sécurité (`SafeAreaProvider`), et affichant une barre de statut noire. Redirige vers `/login` si l'utilisateur n'est pas authentifié.

#### 📁 `app/login.tsx`
Écran unifié double usage :
- Connexion (Champs : email, mot de passe)
- Inscription (Champs : nom complet, email, mot de passe, téléphone)
- Un bouton d'action principal (Terracotta) pour valider, et un bouton discret pour basculer entre Connexion et Inscription.

#### 📁 `app/(citizen)/_layout.tsx`
Navigation par onglets (Bottom Tab Bar) pour l'espace citoyen :
- Onglet 1 : "Tableau de Bord" (icône home, redirige vers `index.tsx`)
- Onglet 2 : "Mes Demandes" (icône historique, redirige vers `requests.tsx`)
- Onglet 3 : "Faire une Demande" (icône micro, redirige vers `new-request.tsx`)

#### 📁 `app/(citizen)/index.tsx` (Dashboard Citoyen)
- Message d'accueil personnalisé (ex: "Bonjour, [Nom] !")
- Liste raccourcie sous forme de cartes élégantes pour les démarches phares (CMU, CNI, Acte de naissance).
- Section "Ma dernière demande" affichant l'état en temps réel de la dernière requête envoyée au backend avec un badge de statut.
- Un bouton imposant et centré "Formuler une Demande" (Vert forêt) pour lancer la saisie vocale/texte.

#### 📁 `app/(citizen)/new-request.tsx` (Nouvelle Demande avec STT)
- Zone de saisie de texte multiligne avec placeholder "Décrivez votre situation ici (ex: Je viens d'avoir un enfant au CHU de Cocody et je n'ai pas de déclaration de naissance)...".
- Un grand bouton circulaire au milieu en bas avec une icône de microphone.
- **Logique vocale STT** : Lors de l'appui maintenu (ou clic pour démarrer/arrêter), déclenche des retours tactiles via `expo-haptics` et utilise `expo-speech-recognition` pour capturer la voix en français de Côte d'Ivoire (`fr-CIV` ou `fr-FR`). Affiche une animation d'ondes sonores vert forêt pendant l'écoute. Le texte décrypté est ajouté dans la zone de texte.
- Bouton de validation (Terracotta) "Envoyer à l'IA" qui appelle `api.demandes.create()` et redirige vers la page de réponse.

#### 📁 `app/(citizen)/request/[id].tsx` (Réponse IA & Plan d'Action avec TTS)
Récupère les détails de la demande via `api.demandes.getOne(id)` et affiche les champs retournés par l'IA dans un format hautement structuré :
1. **En-tête** : Catégorie identifiée par l'IA et badge de statut.
2. **Résumé de la situation** : Un encadré beige clair résumant la situation.
3. **Plan d'Action** : Une liste verticale (timeline) avec chaque étape chronologique (ex: "Étape 1 : Se rendre à la mairie de...").
4. **Pièces à fournir** : Une liste interactive de cases à cocher (Checklist) permettant au citoyen de cocher les pièces qu'il a déjà rassemblées.
5. **Informations Pratiques** : 3 badges alignés horizontalement (Lieu de dépôt, Délai de délivrance estimé, Coût officiel de la démarche).
6. **Courrier Administratif** : Si l'IA a généré un courrier, l'afficher dans un encadré blanc simulant une feuille de papier avec :
   - Un bouton "Copier le courrier"
   - Un bouton "Envoyer par e-mail"
7. **Option Vocale TTS** : Un bouton flottant avec icône de haut-parleur. Au clic, utilise `expo-speech` (`Speech.speak`) pour dicter vocalement le résumé et le plan d'action étape par étape afin de faciliter la compréhension pour les citoyens analphabètes.

#### 📁 `app/(citizen)/requests.tsx` (Historique des demandes)
Affiche l'historique complet des démarches lancées par l'utilisateur sous forme de liste. Chaque élément montre le début du message, la date, la catégorie administrative, le badge de statut, et un clic dessus redirige vers `app/(citizen)/request/[id].tsx`.
```
