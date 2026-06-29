import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import CitizenDashboard from '../../app/(citizen)/index';
import { useAppStore } from '../../store/useAppStore';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('../../store/useAppStore', () => {
  const mockStore = {
    user: { id: 'user_1', nom: 'Gbagbo' },
    requests: [
      { id: '1', message: 'Je veux renouveler ma CNI', status: 'traitee', createdAt: '2026-06-26T12:00:00.000Z' }
    ],
    isLoading: false,
    fetchRequests: jest.fn(() => ({
      finally: (cb) => {
        cb();
        return Promise.resolve();
      }
    })),
    logout: jest.fn(),
  };
  return {
    useAppStore: () => mockStore,
  };
});

describe('CitizenDashboard Screen Tests', () => {
  it('devrait rendre l\'accueil citoyen avec le bon nom', async () => {
    render(<CitizenDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Bienvenue, Gbagbo 👋')).toBeTruthy();
    });
  });

  it('devrait afficher les demandes existantes de la session', async () => {
    render(<CitizenDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Je veux renouveler ma CNI')).toBeTruthy();
      expect(screen.getByText('Traitée')).toBeTruthy();
    });
  });

  it('devrait lancer le chargement des demandes à l\'initialisation', async () => {
    render(<CitizenDashboard />);
    const store = useAppStore();
    await waitFor(() => {
      expect(store.fetchRequests).toHaveBeenCalled();
    });
  });
});
