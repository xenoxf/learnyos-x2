'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import type { User, AuthResponse } from '@/types';

export const useGoogleAuth = () => {
  const [user, setUser] = useState<User | null>(apiService.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!idToken || idToken.length === 0) {
          throw new Error('Token de Google inválido');
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${baseUrl}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as { message?: string };
          throw new Error(errorData.message ?? 'Error al autenticarse con Google');
        }

        const data: AuthResponse = await response.json();
        apiService.setToken(data.token);
        if (data.user && typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        setUser(data.user);

        toast({
          title: 'Éxito',
          description: `Bienvenido, ${data.user.name}`,
        });

        return data;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error al autenticarse con Google';
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
    apiService.logout();
    setUser(null);
    setError(null);
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente',
    });
    router.push('/');
  }, [toast, router]);

  const handleGoogleCallback = useCallback(
    async (code: string) => {
      try {
        setIsLoading(true);
        const response = await apiService.googleAuthWithCode(code);
        if (response.user && typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        setUser(response.user);
        router.push('/study');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al autenticar con Google';
        setError(msg);
        toast({
          title: 'Error',
          description: msg,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [router, toast]
  );

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleGoogleCallback(code);
    }
  }, [searchParams, handleGoogleCallback]);

  return {
    user,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    isAuthenticated: apiService.isAuthenticated(),
    router,
  };
};
