/**
 * Data model types for e-Citoyen CI
 * Aligned with backend DemandeStatus enum (en_attente/en_cours/traitee/rejetee)
 */

export type DemandeStatus = 'en_attente' | 'en_cours' | 'traitee' | 'rejetee' | 'erreur';

export interface User {
  id: string;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  role: string;
  token: string;
}

export interface AIResponse {
  situation: string;
  actionPlan: string[];
  documents: string[];
  location: string;
  delay: string;
  cost: string;
  letter: string; // NOTE: pas encore exposé par ReponseSchema backend - à valider avec Manassé
}

export interface Request {
  id: string;
  message: string;
  categorie?: string;
  status: DemandeStatus;
  createdAt: string;
  aiResponse?: AIResponse;
}

export interface Preferences {
  hasSeenOnboarding?: boolean;
}