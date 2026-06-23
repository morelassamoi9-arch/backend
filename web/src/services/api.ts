// Utilisation de l'URL avec fallback
const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

// Helper pour les requêtes
async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Non authentifié');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }

  return response.json();
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
