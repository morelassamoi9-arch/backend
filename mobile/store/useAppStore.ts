import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Request, AIResponse, DemandeStatus } from './types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://e-citoyen-ci-backend.onrender.com';

export interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Demandes
  requests: Request[];
  currentRequest: Request | null;

  // Loading / erreurs
  isLoading: boolean;
  isLoadingRequests: boolean;
  error: string | null;
  requestError: string | null;

  // Actions auth
  login: (email: string, password: string) => Promise<void>;
  register: (nom: string, email: string, password: string) => Promise<void>;
  logout: () => void;

  // Actions demandes
  createRequest: (message: string, categorie?: string) => Promise<Request>;
  fetchRequests: () => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;

  // Utilitaires
  clearError: () => void;
  clearRequestError: () => void;
}

/** Mappe DemandeResponse backend → Request store */
function mapDemande(data: any): Request {
  let aiResponse: AIResponse | undefined;

  const raw =
    data.reponse ??
    (Array.isArray(data.reponses) && data.reponses.length > 0
      ? data.reponses[0]
      : null);

  if (raw) {
    let actionPlan: string[] = [];
    let documents: string[] = [];
    try { actionPlan = typeof raw.etapes === 'string' ? JSON.parse(raw.etapes) : (raw.etapes ?? []); } catch {}
    try { documents = typeof raw.documents_requis === 'string' ? JSON.parse(raw.documents_requis) : (raw.documents_requis ?? []); } catch {}

    aiResponse = {
      situation: raw.resume ?? '',
      actionPlan,
      documents,
      location: raw.lieu ?? '',
      delay: raw.delai ?? '',
      cost: raw.cout ?? '',
      letter: '', // Pas encore dans ReponseSchema — à ajouter côté backend (Manassé)
    };
  }

  return {
    id: data.id,
    message: data.message,
    categorie: data.categorie ?? undefined,
    status: (data.status as DemandeStatus) ?? 'en_attente',
    createdAt: data.created_at,
    aiResponse,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      isAuthenticated: false,
      requests: [],
      currentRequest: null,
      isLoading: false,
      isLoadingRequests: false,
      error: null,
      requestError: null,

      // --- AUTH ---

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail ?? 'Email ou mot de passe incorrect');
          }
          const data = await res.json();
          set({
            user: {
              id: data.user.id,
              nom: data.user.nom,
              prenom: data.user.prenom,
              email: data.user.email,
              telephone: data.user.telephone,
              role: data.user.role,
              token: data.access_token,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          throw e;
        }
      },

      register: async (nom, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, email, password }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail ?? "Erreur lors de l'inscription");
          }
          const data = await res.json();
          set({
            user: {
              id: data.user.id,
              nom: data.user.nom,
              prenom: data.user.prenom,
              email: data.user.email,
              telephone: data.user.telephone,
              role: data.user.role,
              token: data.access_token,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          throw e;
        }
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          requests: [],
          currentRequest: null,
          error: null,
          requestError: null,
        }),

      // --- DEMANDES ---

      createRequest: async (message, categorie) => {
        const { user } = get();
        if (!user) throw new Error('Non connecté');
        set({ isLoadingRequests: true, requestError: null, currentRequest: null });
        try {
          const body: any = { message };
          if (categorie) body.categorie = categorie;

          const res = await fetch(`${API_BASE}/demandes/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail ?? 'Erreur lors de la création de la demande');
          }
          const data = await res.json();
          const newRequest = mapDemande(data);
          set((s) => ({
            requests: [newRequest, ...s.requests],
            currentRequest: newRequest,
            isLoadingRequests: false,
          }));
          return newRequest;
        } catch (e: any) {
          set({ requestError: e.message, isLoadingRequests: false });
          throw e;
        }
      },

      fetchRequests: async () => {
        const { user } = get();
        if (!user) return;
        set({ isLoadingRequests: true, requestError: null });
        try {
          const res = await fetch(`${API_BASE}/demandes/`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (!res.ok) throw new Error('Impossible de charger vos demandes');
          const data = await res.json();
          set({ requests: data.map(mapDemande), isLoadingRequests: false });
        } catch (e: any) {
          set({ requestError: e.message, isLoadingRequests: false });
        }
      },

      fetchRequestById: async (id) => {
        const { user } = get();
        if (!user) return;
        set({ isLoadingRequests: true, requestError: null });
        try {
          const res = await fetch(`${API_BASE}/demandes/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (!res.ok) throw new Error('Demande introuvable');
          const data = await res.json();
          const request = mapDemande(data);
          set((s) => ({
            requests: s.requests.map((r) => (r.id === id ? request : r)),
            currentRequest: request,
            isLoadingRequests: false,
          }));
        } catch (e: any) {
          set({ requestError: e.message, isLoadingRequests: false });
        }
      },

      // --- UTILITAIRES ---

      clearError: () => set({ error: null }),
      clearRequestError: () => set({ requestError: null, currentRequest: null }),
    }),
    {
      name: 'ecitoyen-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);