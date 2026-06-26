import api from "./api";

export const authService = {
  register: async (data: { nom: string; prenom?: string; email: string; password: string; telephone?: string }) => {
    const response = await api.auth.register(data);
    if (response && response.access_token) {
      sessionStorage.setItem("token", response.access_token);
    }
    if (response && response.user) {
      sessionStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.auth.login(credentials);
    if (response && response.access_token) {
      sessionStorage.setItem("token", response.access_token);
    }
    if (response && response.user) {
      sessionStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    api.auth.logout();
  }
};
