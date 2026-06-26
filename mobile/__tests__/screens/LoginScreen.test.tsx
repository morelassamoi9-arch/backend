import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/login';
import { useAppStore } from '../../store/useAppStore';

// Mocks nécessaires pour Expo et React Native Navigation / Safe Area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-image', () => ({
  Image: () => 'ExpoImageMock',
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// Mocker le store Zustand
jest.mock('../../store/useAppStore', () => {
  const mockStore = {
    login: jest.fn(),
    register: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  };
  return {
    useAppStore: () => mockStore,
  };
});

describe('LoginScreen Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait rendre l\'écran de connexion par défaut', () => {
    render(<LoginScreen />);
    
    expect(screen.getByText('e-Citoyen CI')).toBeTruthy();
    expect(screen.getByPlaceholderText('amani@email.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Votre mot de passe')).toBeTruthy();
    expect(screen.getByText('Se connecter')).toBeTruthy();
    // Le nom complet ne devrait pas être présent
    expect(screen.queryByPlaceholderText('Amani Kouassi')).toBeNull();
  });

  it('devrait afficher le champ nom complet en basculant en mode Inscription', () => {
    render(<LoginScreen />);
    
    // Cliquer sur le bouton d'onglet "Inscription"
    const tabInscription = screen.getByText('Inscription');
    fireEvent.press(tabInscription);

    expect(screen.getByPlaceholderText('Amani Kouassi')).toBeTruthy();
    expect(screen.getByText("S'inscrire")).toBeTruthy();
  });

  it('devrait soumettre les identifiants de connexion au clic', async () => {
    const store = useAppStore();
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('amani@email.com');
    const passwordInput = screen.getByPlaceholderText('Votre mot de passe');
    const submitBtn = screen.getByText('Se connecter');

    fireEvent.changeText(emailInput, 'test@example.ci');
    fireEvent.changeText(passwordInput, 'SecuredPass123!');
    fireEvent.press(submitBtn);

    await waitFor(() => {
      expect(store.login).toHaveBeenCalledWith('test@example.ci', 'SecuredPass123!');
    });
  });
});
