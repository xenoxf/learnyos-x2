"use client";

import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/apiService";
import type { User } from "@/types";

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
      const user = apiService.getUser();
      setAuthState({
        user: user || null,
        isAuthenticated: !!user,
        isLoading: false,
      });
    };

    initAuth();
  }, []);

  const updateUser = useCallback(
    async (data: { name?: string }) => {
      try {
        const updated = await apiService.updateUser(data);
        setAuthState((prev) => ({
          ...prev,
          user: updated,
        }));
        return updated;
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    apiService.logout();
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