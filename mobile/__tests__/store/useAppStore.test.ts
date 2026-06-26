import { useAppStore } from '../../store/useAppStore';

describe('App Store Unit Tests', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
    // Réinitialiser le store avant chaque test
    useAppStore.getState().logout();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('devrait connecter un utilisateur avec succès', async () => {
    const mockUserResponse = {
      access_token: 'fake-jwt-token',
      user: {
        id: 'user_1',
        nom: 'Koffi',
        prenom: 'Armand',
        email: 'koffi@example.ci',
        telephone: '+22501020304',
        role: 'client',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserResponse,
    });

    await useAppStore.getState().login('koffi@example.ci', 'password123!');

    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.nom).toBe('Koffi');
    expect(state.user?.token).toBe('fake-jwt-token');
    expect(state.error).toBeNull();
  });

  it('devrait enregistrer une erreur de connexion si les identifiants sont incorrects', async () => {
    const mockErrorResponse = { detail: 'Identifiants incorrects' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    });

    try {
      await useAppStore.getState().login('koffi@example.ci', 'wrong');
    } catch {}

    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBe('Identifiants incorrects');
  });

  it('devrait inscrire un utilisateur avec succès', async () => {
    const mockRegisterResponse = {
      access_token: 'fake-register-jwt',
      user: {
        id: 'user_2',
        nom: 'Touré',
        email: 'toure@example.ci',
        role: 'client',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRegisterResponse,
    });

    await useAppStore.getState().register('Touré', 'toure@example.ci', 'Password123!');

    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.nom).toBe('Touré');
    expect(state.user?.token).toBe('fake-register-jwt');
  });

  it('devrait réinitialiser l\'état lors de la déconnexion', async () => {
    const state = useAppStore.getState();
    // Simuler connexion manuelle
    useAppStore.setState({
      isAuthenticated: true,
      user: {
        id: 'user_1',
        nom: 'Koffi',
        email: 'koffi@example.ci',
        role: 'client',
        token: 'token',
      },
      requests: [{ id: '1', message: 'test', status: 'en_attente', createdAt: '2026-06-26' }],
    });

    useAppStore.getState().logout();

    const updatedState = useAppStore.getState();
    expect(updatedState.isAuthenticated).toBe(false);
    expect(updatedState.user).toBeNull();
    expect(updatedState.requests).toEqual([]);
  });
});
