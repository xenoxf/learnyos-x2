'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/apiService';
import type { AuthResponse, LoginInput, RegisterInput } from '@/types';

export const useAuthFlow = () => {
  const router = useRouter();

  const login = useCallback(async (data: LoginInput) => {
    try {
      const result = await apiService.login(data);
      router.push('/study');
      return result;
    } catch (error) {
      throw error;
    }
  }, [router]);

  const register = useCallback(async (data: RegisterInput) => {
    try {
      const result = await apiService.register(data);
      router.push('/study');
      return result;
    } catch (error) {
      throw error;
    }
  }, [router]);

  const googleAuth = useCallback(async (code: string) => {
    try {
      const result = await apiService.googleAuthWithCode(code);
      router.push('/study');
      return result;
    } catch (error) {
      throw error;
    }
  }, [router]);

  const logout = useCallback(() => {
    apiService.logout();
    router.push('/');
  }, [router]);

  return {
    login,
    register,
    googleAuth,
    logout,
    isAuthenticated: apiService.isAuthenticated(),
    user: apiService.getUser(),
  };
};
