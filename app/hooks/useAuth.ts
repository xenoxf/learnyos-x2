"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/types";
import { authService } from "@/services/authService";
import { errorHandler } from "@/services/errorHandler";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = () => {
      const user = authService.getUser();
      setAuthState({
        user: user || null,
        isAuthenticated: !!user,
        isLoading: false,
      });
    };

    initAuth();
  }, []);

  const updateUser = useCallback(async (data: { name?: string }) => {
    try {
      const updated = await authService.updateUser(data);
      setAuthState((prev) => ({
        ...prev,
        user: updated,
      }));
      return updated;
    } catch (error) {
      errorHandler(error, "Error updating user");
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    updateUser,
    logout,
  };
}
