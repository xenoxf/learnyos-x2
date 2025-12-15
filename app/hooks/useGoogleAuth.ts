"use client"

import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import { StorageManager } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import type { User, AuthResponse } from '@/types';

export const useGoogleAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validar que sea un token válido
        if (!idToken || idToken.length === 0) {
          throw new Error('Token de Google inválido');
        }

        // Llamar al endpoint de Google auth del backend
        const response = await fetch(
          `${process.env.VITE_BACKEND_URL || 'http://localhost:3000/api'}/auth/google`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al autenticarse con Google');
        }

        const data: AuthResponse = await response.json();

        // Guardar en localStorage
        StorageManager.setAuth(data.token, data.user);
        setUser(data.user);

        toast({
          title: 'Éxito',
          description: `Bienvenido, ${data.user.name}`,
        });

        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al autenticarse con Google';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const logout = useCallback(() => {
    StorageManager.clearAuth();
    setUser(null);
    setError(null);
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente',
    });
  }, [toast]);

  return {
    user,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user && StorageManager.isAuthenticated(),
  };
};