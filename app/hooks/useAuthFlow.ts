"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { LoginInput, RegisterInput } from "@/types";
import { authService } from "@/services/authService";

export const useAuthFlow = () => {
  const router = useRouter();

  const login = useCallback(
    async (data: LoginInput) => {
      try {
        const result = await authService.login(data);
        router.push("/study");
        return result;
      } catch (error) {
        throw error;
      }
    },
    [router],
  );

  const register = useCallback(
    async (data: RegisterInput) => {
      try {
        const result = await authService.register(data);
        router.push("/study");
        return result;
      } catch (error) {
        throw error;
      }
    },
    [router],
  );

  const googleAuth = useCallback(
    async (code: string) => {
      try {
        const result = await authService.googleAuthWithCode(code);
        router.push("/study");
        return result;
      } catch (error) {
        throw error;
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    authService.logout();
    router.push("/");
  }, [router]);

  return {
    login,
    register,
    googleAuth,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getUser(),
  };
};
