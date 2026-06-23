import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Preferences, DemandeRequest, AuthUser } from './types';

interface DemandesSlice {
  demandes: DemandeRequest[];
  addDemande: (demande: DemandeRequest) => void;
  removeDemande: (id: string) => void;
  clearDemandes: () => void;
}

interface PreferencesSlice {
  preferences: Preferences;
}

interface AuthSlice {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export type AppStore = PreferencesSlice & DemandesSlice & AuthSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      preferences: {},
      demandes: [],
      accessToken: null,
      user: null,
      addDemande: (demande: DemandeRequest) =>
        set((state) => ({
          demandes: [demande, ...state.demandes],
        })),
      removeDemande: (id: string) =>
        set((state) => ({
          demandes: state.demandes.filter((d) => d.id !== id),
        })),
      clearDemandes: () => set({ demandes: [] }),
      setAuth: (token: string, user: AuthUser) =>
        set({ accessToken: token, user }),
      logout: () =>
        set({ accessToken: null, user: null }),
    }),
    {
      name: 'ecitoyen-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        demandes: state.demandes,
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);
