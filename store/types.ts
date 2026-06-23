/**
 * Entity types for e-Citoyen CI app.
 */

export interface DemandeResponse {
  resume_situation: string;
  plan_action: string;
  documents_a_apporter: string;
  lieu: string;
  delai_estime: string;
  cout: string;
  contenu_lettre: string;
}

export interface DemandeRequest {
  id: string;
  message: string;
  createdAt: string;
  response: DemandeResponse;
}

export type Preferences = {}

/** Auth types for login and agent flow */
export type UserRole = "agent" | "citoyen";

export interface AuthUser {
  id: string;
  email: string;
  nom?: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

/** Agent dashboard demande (from backend) */
export type DemandeStatut = "en_attente" | "verifiee" | "confirmee";

export interface AgentDemande {
  _id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  message: string;
  statut: DemandeStatut;
  reponse_ia?: DemandeResponse;
  createdAt: string;
  updatedAt?: string;
}
