'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import type { AuthResponse, LoginInput, RegisterInput } from '@/types';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => apiService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/protected/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => apiService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/protected/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      apiService.logout();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
    },
  });

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: apiService.isAuthenticated(),
    user: apiService.getUser(),
  };
};
