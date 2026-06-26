import React from 'react';
import { render, screen } from '@testing-library/react-native';
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
    fetchRequests: jest.fn(),
    logout: jest.fn(),
  };
  return {
    useAppStore: () => mockStore,
  };
});

describe('CitizenDashboard Screen Tests', () => {
  it('devrait rendre l\'accueil citoyen avec le bon nom', () => {
    render(<CitizenDashboard />);
    expect(screen.getByText('Bonjour, Gbagbo 👋')).toBeTruthy();
  });

  it('devrait afficher les demandes existantes de la session', () => {
    render(<CitizenDashboard />);
    expect(screen.getByText('Je veux renouveler ma CNI')).toBeTruthy();
    expect(screen.getByText('Traitée')).toBeTruthy();
  });

  it('devrait lancer le chargement des demandes à l\'initialisation', () => {
    render(<CitizenDashboard />);
    const store = useAppStore();
    expect(store.fetchRequests).toHaveBeenCalled();
  });
});
