"use client"

import { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import type { User, AuthResponse, LoginInput, RegisterInput } from '@/types';
import { ApiError } from '@/lib/apiErrors';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getProfile: () => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(apiService.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.login(input);
      setUser(response.user);
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : err?.message || 'Error en login';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.register(input);
      setUser(response.user);
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : err?.message || 'Error en registro';
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

  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await apiService.getProfile();
      setUser(profile);
      return profile;
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : err?.message || 'Error al obtener perfil';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiService.updateProfile(data);
      setUser(updated);
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : err?.message || 'Error al actualizar perfil';
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
      await apiService.deleteAccount();
      logout();
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : err?.message || 'Error al eliminar cuenta';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.loginWithGoogle(idToken);
      setUser(response.user);
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : err?.message || 'Error en Google login';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = apiService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: apiService.isAuthenticated(),
    getProfile,
    updateProfile,
    deleteAccount,
    loginWithGoogle,
    clearError,
  };
}