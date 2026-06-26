import React, { createContext, useState, useEffect, ReactNode } from "react";
import { authService } from "../services/authService";
import api from "../services/api";

export interface UserProfile {
  id: string;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  role: string;
  is_active: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: { nom: string; prenom?: string; email: string; password: string; telephone?: string }) => Promise<any>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
    setLoading(true);
    const token = sessionStorage.getItem("token");
    const storedUserStr = sessionStorage.getItem("user");

    if (token && storedUserStr) {
      try {
        // Optionnel : Précharger l'utilisateur stocké pour éviter le flash
        const parsed = JSON.parse(storedUserStr);
        setUser(parsed);

        // Valider/Rafraîchir les informations utilisateur avec le backend
        const freshUser = await api.users.me();
        setUser(freshUser);
        sessionStorage.setItem("user", JSON.stringify(freshUser));
      } catch (err) {
        console.error("Impossible de restaurer la session (token expiré ou invalide) :", err);
        // Vider la session si invalide
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    restoreSession();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth_unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth_unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    if (result && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (data: { nom: string; prenom?: string; email: string; password: string; telephone?: string }) => {
    const result = await authService.register(data);
    if (result && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
