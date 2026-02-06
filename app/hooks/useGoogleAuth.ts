"use client"

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '@/services/apiService';
import { StorageManager } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import type { User, AuthResponse } from '@/types';

declare global {
  interface Window {
    google: any;
  }
}

export const useGoogleAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const initializeGoogleSignIn = useCallback(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.accounts) {
        // Google Sign-In está listo
        console.log('Google Sign-In initialized');
      }
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    return initializeGoogleSignIn();
  }, [initializeGoogleSignIn]);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleGoogleCallback(code);
    }
  }, [searchParams]);

  const handleGoogleCallback = useCallback(
    async (code: string) => {
      try {
        setIsLoading(true);
        const response = await apiService.googleAuthWithCode(code);
        apiService.setToken(response.token);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        router.push('/(protected)/dashboard');
      } catch (err: any) {
        setError(err.message || 'Error al autenticar con Google');
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return {
    user,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user && StorageManager.isAuthenticated(),
    router,
  };
};