# PITCH CHALLENGE IA 2026 - e-Citoyen CI

**Équipe** : IA Force CI (Team 17)  
**Challenge** : Leading Change Africa & Intro Group  
**Date** : 28 juin 2026

---

## 🎯 PROBLÈME

En Côte d'Ivoire, des millions de citoyens sont bloqués dans leurs démarches administratives quotidiennes :

**Douleurs constatées** :
- **Complexité administrative** : Procédures dispersées, jargon incompréhensible, documents manquants
- **Perte de temps** : Allers-retours inutiles entre mairies, préfectures, CNPS, CMU
- **Exclusion numérique** : Populations peu alphabétisées incapables de naviguer les systèmes actuels
- **Inégalité d'accès** : Citoyens ruraux et populations vulnérables sans accompagnement

**Impact réel** :
- Naissances non déclarées dans les délais légaux
- Citoyens sans papiers d'identité
- Prestations sociales non réclamées
- Perte d'opportunités économiques

---

## 💡 SOLUTION

**e-Citoyen CI** : Assistant administratif intelligent multi-agents pour les citoyens ivoiriens

**Innovation fondamentale** :
- **IA multi-agents spécialisés** : 3 agents CrewAI orchestrés (Accueil, Documentaliste, Rédacteur)
- **Langage naturel** : Le citoyen décrit sa situation simplement, l'IA identifie la procédure
- **Accessibilité vocale** : Dictée et synthèse vocale pour populations peu alphabétisées
- **Plans d'action personnalisés** : Étapes, documents, coûts, délais, lettres générées

**Technologies** :
- Backend : FastAPI + CrewAI 1.14.7 + Google Gemini 2.5 Flash (via LiteLLM)
- Frontend web : React 19 + Vite 8 + Tailwind CSS
- Mobile : Expo / React Native via Fastshot AI
- Déploiement : Render (backend en production)

---

## 🚀 DIFFÉRENTIATEURS

**1. Spécialisation procédures locales CI**
- Base de connaissances officielle ivoirienne (ONECI, servicepublic.gouv.ci)
- Procédures réelles et à jour (CNI, acte de naissance, CMU, passeport)
- Contexte africain priorisé dans le design et l'expérience utilisateur

**2. Accessibilité citoyens peu alphabétisés**
- Interface vocale complète (dictée + synthèse)
- Langage simple, sans jargon administratif
- Lettres administratives automatiques générées
- Design adapté aux contraintes locales

**3. Fiabilité architecture multi-agents**
- **Agent Accueil** : Comprend les situations complexes et cas particuliers
- **Agent Documentaliste** : Consulte systématiquement la base de connaissances officielle
- **Agent Rédacteur** : Transforme la technique en réponses humaines actionnables
- Validation croisée entre agents avant de livrer la réponse

**4. Conception contexte africain**
- Palette couleurs : terracotta #C86A4A, vert #2E6B57 (inspiration culturelle)
- Interface mobile-first (contraintes réseaux locaux)
- Accessibilité offline partielle
- Coûts et délais en FCFA et jours ouvrés

---

## 🎨 DÉMONSTRATION SCÉNARISÉE

**Partie 1 : Le problème (30 secondes)**
- Citoyen : "Mon enfant est né hier à Abidjan, je veux faire la déclaration mais je ne sais pas quoi faire"
- Douleur : Perdu dans les démarches, risque de dépassement du délai légal (30 jours)

**Partie 2 : La solution (1 minute)**
- **Étape 1** : Citoyen dicte sa demande via interface vocale mobile
- **Étape 2** : Agent Accueil identifie : "Déclaration de naissance + cas particulier naissance récente"
- **Étape 3** : Agent Documentaliste consulte la base officielle : procédure complète, documents, coûts
- **Étape 4** : Agent Rédacteur génère plan d'action + lettre administrative prête à l'emploi
- **Résultat** : Citoyen reçoit guide complet en 3 étapes avec lettre officielle

**Partie 3 : L'impact (30 secondes)**
- **Avant** : Plusieurs jours, multiples allers-retours, risque d'erreur
- **Après** : Guide complet en quelques secondes, lettre prête, zéro ambiguïté
- **Scalabilité** : Solution applicable à toutes les démarches administratives ivoiriennes

---

## 📊 MÉTRIQUES & IMPACT

**Indicateurs de succès** :
- **Réduction du temps** : Guide administratif instantané vs démarches traditionnelles
- **Taux de réussite** : Plans d'action structurés et complets
- **Accessibilité** : Interface vocale pour populations analphabètes
- **Couverture** : Démarches nationales principales (CNI, naissance, CMU, passeport)

**Cibles prioritaires** :
- Nouveaux parents (déclaration naissance)
- Demandeurs d'identité (CNI, passeport)
- Populations rurales (accès simplifié)
- Populations peu alphabétisées (interface vocale)

---

## 🏗️ ARCHITECTURE TECHNIQUE

**Backend multi-agents** :
- Python 3.12 + FastAPI + CrewAI 1.14.7
- 3 agents spécialisés orchestrés via CrewAI
- LLM Google Gemini 2.5 Flash (via LiteLLM)
- Base de connaissances procédures.json (sources officielles ivoiriennes)
- SQLite + Auth JWT + Rate limiting

**Frontend web** :
- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 + shadcn/Radix UI
- Web Speech API (vocal navigateur)
- Déployé sur Render

**Mobile** :
- Expo / React Native via Fastshot AI
- expo-speech-recognition + expo-speech (vocal mobile)
- expo-haptics (retour tactile "tampon")
- Design "Le Tampon Officiel" : animation tampon-encre #D96A2B, typographie IBM Plex Mono, fond parchemin #F5EFE3

---

## 🎯 MARKET & ÉCONOMIE

**Cible principale** :
- **28 millions** de citoyens ivoiriens
- **Millions** de démarches administratives par an
- **Priorité** : Populations rurales et peu alphabétisées

**Modèle économique** :
- **Freemium** : Fonctionnalités de base gratuites (toutes les démarches principales)
- **Partenariats publics** : Intégration avec services gouvernementaux
- **API B2B** : Vente d'accès API aux entreprises pour leurs employés
- **Premium** : Fonctionnalités avancées payantes (priorité, support dédié)

**Scalabilité** :
- **Phase 1** : Côte d'Ivoire (déploiement national)
- **Phase 2** : Expansion sous-régionale (Bénin, Burkina, Mali)
- **Phase 3** : Modèle réutilisable pour autres pays francophones d'Afrique

---

## 👥 ÉQUIPE

**IA Force CI (Team 17)** :
- **Morel** — Chef d'équipe, architecture, coordination, déploiement, frontend web
- **Manassé** — Responsable technique (backend, CrewAI, authentification, base de données)
- **Fahisol** — Responsable communication (pitch, présentation, interfaces)
- **Béni** — Responsable projet (GitHub, administration, knowledge base)
- **Designer** — Maquettes Figma web et mobile

**Mentorat** : Collaboration avec mentor Challenge IA pour guidance technique et business

---

## 🎯 ROADMAP

**Court terme (28 juin - 12 juillet 2026)** :
- ✅ Backend multi-agents fonctionnel et déployé
- ✅ Frontend web avec interface vocale
- 🔄 Mobile : résolution crash APK + génération Fastshot scopes séparés
- 🔄 Finalisation pipeline vocal bidirectionnel mobile
- 🔄 Pitch final et préparation Q&A jury

**Moyen terme (3-6 mois)** :
- Peuplement procedures.json avec données officielles ONECI
- Dashboard agent fonctionnel
- Tests utilisateurs beta grand public

**Long terme (6-12 mois)** :
- Expansion sous-régionale
- Partenariats officiels avec services gouvernementaux
- IA prédictive (optimisation parcours)
- Tableau de bord administration publique

---

## ⚠️ RISQUES & MITIGATION

**Risques identifiés** :
- **Quota LLM** : Gestion du quota Gemini 2.5 Flash
- **Données administratives** : Fact-checking systématique via sources officielles
- **Adoption utilisateur** : Interface vocale + design local pour accessibilité
- **Scalabilité technique** : Architecture sans état compatible cloud

**Mitigation** :
- Validation continue avec sources officielles (ONECI, servicepublic.gouv.ci)
- Tests utilisateurs réguliers
- Rate limiting et monitoring
- Architecture modulaire pour évolutivité

---

## 🏆 AVANTAGE COMPÉTITIF

**Vs solutions actuelles** :
- **Services publics** : Plus accessible, 24/7, multimodal
- **Avocats/notaires** : Moins coûteux, immédiat, standardisé
- **Chatbots génériques** : Plus précis, contextuel, actionnable, spécialisé CI

**Barrières à l'entrée** :
- **Technique** : Stack moderne testée et validée
- **Réglementaire** : Conformité avec procédures officielles
- **Adoption** : Interface vocale pour inclusion maximale

---

## 🎯 CONCLUSION

**e-Citoyen CI** représente une innovation concrète au service de l'inclusion numérique administrative en Côte d'Ivoire.

**Notre promesse** :
- **Accessibilité universelle** : Du citoyen urbain au rural, de l'alphabétisé à l'analphabète
- **Fiabilité** : Réponses basées sur les textes officiels ivoiriens
- **Simplicité** : Langage naturel, interface vocale, plans d'action clairs
- **Scalabilité** : Architecture prête pour expansion sous-régionale

**Vision** : "L'administration publique, simple et accessible, pour tous les citoyens ivoiriens"

---

## 📞 CONTACT

**GitHub** : https://github.com/morelassamoi9-arch/backend.git  
**Backend en production** : https://e-citoyen-ci-backend.onrender.com  
**Prototype Figma** : https://github.com/morelassamoi9-arch/AIGovernmentAssistantUIUX.git

**Équipe IA Force CI** — Challenge IA 2026  
*Leading Change Africa & Intro Group*