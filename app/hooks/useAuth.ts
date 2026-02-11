"use client"

import { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';

export interface User {
  id: number;
  email: string;
  name: string;
  picture?: string;
  provider?: string;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (name: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario al montar
  useEffect(() => {
    const loadUser = () => {
      try {
        if (apiService.isAuthenticated()) {
          const userData = apiService.getUser();
          if (userData) {
            setUser(userData as User);
          }
        }
      } catch (err: any) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Verificar token al montar el componente
  useEffect(() => {
    const verifyUserToken = async () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const result = await apiService.verifyToken();
        if (!result.valid) {
          // Token inválido, limpiar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };

    verifyUserToken();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.login({ email, password });
      setUser(response.user as User);
    } catch (err: any) {
      const message = err?.message || 'Error en login';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.register({ name, email, password });
      setUser(response.user as User);
    } catch (err: any) {
      const message = err?.message || 'Error en registro';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await apiService.updateUser({ name });
      setUser(updatedUser as User);
    } catch (err: any) {
      const message = err?.message || 'Error al actualizar perfil';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteUser();
      setUser(null);
      apiService.logout();
    } catch (err: any) {
      const message = err?.message || 'Error al eliminar cuenta';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user && apiService.isAuthenticated(),
    updateProfile,
    deleteAccount,
    clearError,
  };
}