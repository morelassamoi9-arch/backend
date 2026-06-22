import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Preferences, DemandeRequest } from './types';

interface DemandesSlice {
  demandes: DemandeRequest[];
  addDemande: (demande: DemandeRequest) => void;
  removeDemande: (id: string) => void;
  clearDemandes: () => void;
}

interface PreferencesSlice {
  preferences: Preferences;
}

export type AppStore = PreferencesSlice & DemandesSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      preferences: {},
      demandes: [],
      addDemande: (demande: DemandeRequest) =>
        set((state) => ({
          demandes: [demande, ...state.demandes],
        })),
      removeDemande: (id: string) =>
        set((state) => ({
          demandes: state.demandes.filter((d) => d.id !== id),
        })),
      clearDemandes: () => set({ demandes: [] }),
    }),
    {
      name: 'ecitoyen-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        demandes: state.demandes,
      }),
    }
  )
);
