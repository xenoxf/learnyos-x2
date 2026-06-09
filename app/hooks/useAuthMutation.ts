"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";

export function useAuthMutation() {
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return await authService.login(credentials);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
    }) => {
      return await authService.register(data);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { name?: string }) => {
      return await authService.updateUser(data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      authService.logout();
      return true;
    },
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,
    updateUserError: updateUserMutation.error,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      updateUserMutation.isPending ||
      logoutMutation.isPending,
  };
}
