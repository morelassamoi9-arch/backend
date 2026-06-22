const API_URL = 'http://localhost:8000';

export async function testConnection() {
  const response = await fetch(`${API_URL}/`);
  return response.json();
}

// Test santé
export async function healthCheck() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}

// Inscription
export async function register(data: {
  nom: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Connexion
export async function login(data: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (result.access_token) {
    localStorage.setItem('token', result.access_token);
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  return result;
}

// Créer une demande
export async function createDemande(data: { message: string; categorie?: string }) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/demandes/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Voir mes demandes
export async function getMesDemandes() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/demandes/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

// Voir mon profil
export async function getProfile() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

// Déconnexion
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}