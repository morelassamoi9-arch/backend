// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import api from './api';

describe('Web API Client Unit Tests', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
    
    // Simuler sessionStorage
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { for (const k in store) delete store[k]; },
      },
      writable: true
    });
    sessionStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('devrait envoyer les identifiants de connexion et retourner la réponse', async () => {
    const mockResponse = { access_token: 'web-token-123', user: { email: 'citoyen@example.ci' } };
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await api.auth.login({ email: 'citoyen@example.ci', password: 'password123!' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ email: 'citoyen@example.ci', password: 'password123!' }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('devrait injecter le token Bearer s\'il est présent en session', async () => {
    sessionStorage.setItem('token', 'active-token');
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([]),
    });

    await api.demandes.getAll();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/demandes/'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer active-token',
        }),
      })
    );
  });

  it('devrait vider la session et lever une exception lors d\'un retour 401', async () => {
    sessionStorage.setItem('token', 'expired-token');
    sessionStorage.setItem('user', JSON.stringify({ name: 'User' }));

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Token invalide' }),
    });

    const eventSpy = vi.fn();
    window.addEventListener('auth_unauthorized', eventSpy);

    await expect(api.users.me()).rejects.toThrow('Non authentifié');

    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
    expect(eventSpy).toHaveBeenCalled();
  });
});
