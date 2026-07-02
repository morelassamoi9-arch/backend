import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { User, Request, AIResponse, DemandeStatus } from './types';

// Adaptateur de stockage sécurisé avec migration automatique de l'ancien AsyncStorage
const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    let value = await SecureStore.getItemAsync(name);
    if (!value) {
      // Tenter de migrer depuis AsyncStorage
      try {
        const oldVal = await AsyncStorage.getItem(name);
        if (oldVal) {
          await SecureStore.setItemAsync(name, oldVal);
          await AsyncStorage.removeItem(name);
          value = oldVal;
          console.log(`[SECURITY] Migration automatique de ${name} réussie.`);
        }
      } catch (e) {
        console.error("[SECURITY] Échec de la migration du stockage :", e);
      }
    }
    return value || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

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
  regenerateRequest: (id: string) => Promise<void>;
  restoreSession: () => Promise<void>; // Restaurer la session et recharger les demandes

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

    // Résolution robuste des étapes
    if (raw.etapes) {
      if (typeof raw.etapes === 'string') {
        try {
          const parsed = JSON.parse(raw.etapes);
          actionPlan = Array.isArray(parsed) ? parsed : [raw.etapes];
        } catch {
          actionPlan = [raw.etapes];
        }
      } else if (Array.isArray(raw.etapes)) {
        actionPlan = raw.etapes;
      }
    }

    // Résolution robuste des documents requis
    const docsSource = raw.documents_requis ?? raw.documents;
    if (docsSource) {
      if (typeof docsSource === 'string') {
        try {
          const parsed = JSON.parse(docsSource);
          documents = Array.isArray(parsed) ? parsed : [docsSource];
        } catch {
          documents = [docsSource];
        }
      } else if (Array.isArray(docsSource)) {
        documents = docsSource;
      }
    }

    // Résolution robuste du lieu / localisation
    let location = '';
    if (raw.lieu) {
      location = raw.lieu;
    } else if (raw.lieux) {
      location = Array.isArray(raw.lieux) ? raw.lieux.join(', ') : String(raw.lieux);
    }

    aiResponse = {
      situation: raw.error ? raw.error : (raw.resume ?? ''),
      actionPlan,
      documents,
      location,
      delay: raw.delai ?? '',
      cost: raw.cout ?? '',
      letter: raw.lettre ?? raw.letter ?? '',
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
          // Recharger les demandes après connexion réussie
          get().fetchRequests();
        } catch (e: any) {
          // Clear stale session on 401 or "non reconnu" error
          if (e.message?.includes('401') || e.message?.toLowerCase().includes('non reconnu')) {
            set({ user: null, isAuthenticated: false });
          }
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
          // Recharger les demandes après inscription réussie
          get().fetchRequests();
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          throw e;
        }
      },

      logout: () => {
        const { user } = get();
        if (user?.token) {
          fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user.token}`,
            },
          }).catch((err) => console.warn('[AUTH] Échec de la déconnexion serveur:', err));
        }
        set({
          user: null,
          isAuthenticated: false,
          requests: [],
          currentRequest: null,
          error: null,
          requestError: null,
        });
      },

      // --- DEMANDES ---

      createRequest: async (message, categorie) => {
        const { user } = get();
        if (!user) throw new Error('Non connecté');
        set({ isLoadingRequests: true, requestError: null, currentRequest: null });
        try {
          const createRes = await fetch(`${API_BASE}/demandes/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ message, categorie }),
          });
          if (!createRes.ok) {
            const err = await createRes.json().catch(() => ({}));
            throw new Error(err.detail ?? 'Erreur lors de la création de la demande');
          }
          let current = await createRes.json();
          const demandeId = current.id;

          const POLL_INTERVAL_MS = 3000;
          const MAX_ATTEMPTS = 30;
          const DONE_STATUSES = ['traitee', 'rejetee', 'erreur'];
          for (let i = 0; i < MAX_ATTEMPTS; i++) {
            if (DONE_STATUSES.includes(current.status)) break;
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
            const pollRes = await fetch(`${API_BASE}/demandes/${demandeId}`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            if (pollRes.ok) current = await pollRes.json();
          }

          if (current.status === 'erreur') {
            throw new Error('Le traitement de votre demande a échoué. Réessayez.');
          }

          const newRequest = mapDemande(current);
          set((s) => ({
            requests: [newRequest, ...s.requests.filter((r) => r.id !== newRequest.id)],
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

      regenerateRequest: async (id) => {
        const { user } = get();
        if (!user) return;
        set({ isLoadingRequests: true, requestError: null });
        try {
          const res = await fetch(`${API_BASE}/demandes/${id}/generate-response`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (!res.ok) throw new Error('Impossible de relancer le traitement');
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

      restoreSession: async () => {
        const { user, isAuthenticated } = get();
        if (isAuthenticated && user) {
          try {
             await get().fetchRequests();
          } catch (e) {
            console.log('Impossible de recharger les demandes:', e);
          }
        }
      },

      // --- UTILITAIRES ---

      clearError: () => set({ error: null }),
      clearRequestError: () => set({ requestError: null, currentRequest: null, isLoadingRequests: false }),
    }),
    {
      name: 'ecitoyen-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, requests: s.requests }),
    }
  )
);