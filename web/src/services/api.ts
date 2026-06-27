// Utilisation de l'URL avec fallback
const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

// Helper pour les requêtes
async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth_unauthorized'));
      throw new Error('Non authentifié');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const detail = error.detail;
      
      if (response.status >= 500) {
        throw new Error("Une erreur est survenue. Veuillez réessayer ultérieurement.");
      }
      
      const isTechnical = typeof detail === 'string' && (
        detail.toLowerCase().includes("traceback") ||
        detail.toLowerCase().includes("line ") ||
        detail.toLowerCase().includes("exception") ||
        detail.toLowerCase().includes("error") ||
        detail.toLowerCase().includes("database") ||
        detail.toLowerCase().includes("sqlite") ||
        detail.toLowerCase().includes("nameerror")
      );
      
      if (isTechnical) {
        throw new Error("Une erreur est survenue. Veuillez réessayer ultérieurement.");
      }
      
      throw new Error(detail || "Une erreur est survenue. Veuillez réessayer.");
    }

    return await response.json();
  } catch (err: any) {
    if (
      err.message === "Une erreur est survenue. Veuillez réessayer ultérieurement." ||
      err.message === "Non authentifié" ||
      err.message === "Email ou mot de passe incorrect" ||
      err.message === "Cet email est déjà utilisé"
    ) {
      throw err;
    }
    throw new Error("Une erreur est survenue. Veuillez réessayer ultérieurement.");
  }
}

// ============================================
// AUTH
// ============================================
export const auth = {
  login: (data: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  register: (data: { nom: string; prenom?: string; email: string; password: string; telephone?: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  },
};

// ============================================
// DEMANDES
// ============================================
export const demandes = {
  create: (data: { message: string; categorie?: string }) =>
    request('/demandes/', { method: 'POST', body: JSON.stringify(data) }),
  
  getAll: (params?: { skip?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.append('skip', String(params.skip));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status_filter', params.status);
    const url = `/demandes/${query.toString() ? '?' + query.toString() : ''}`;
    return request(url);
  },
  
  getOne: (id: string) =>
    request(`/demandes/${id}`),
  
  delete: (id: string) =>
    request(`/demandes/${id}`, { method: 'DELETE' }),
  
  getStats: () =>
    request('/demandes/stats/overview'),
  
  regenerate: (id: string) =>
    request(`/demandes/${id}/generate-response`, { method: 'POST' }),
};

// ============================================
// USERS
// ============================================
export const users = {
  me: () =>
    request('/users/me'),
  
  update: (data: { nom?: string; prenom?: string; telephone?: string }) =>
    request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
};

// ============================================
// TEST CONNEXION
// ============================================
export const test = {
  connection: () => request('/'),
  health: () => request('/health'),
};

export default {
  auth,
  demandes,
  users,
  test,
};
