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
