"use client";

import { useCallback, useState } from "react";
import type { User, AuthResponse } from "@/types";
import { useToast } from "./use-toast";
import { authService } from "@/services/authService";

interface GoogleToken {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

function decodeJWT(token: string): GoogleToken {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );

    return decoded as GoogleToken;
  } catch (error) {
    throw new Error("Failed to decode JWT");
  }
}

export function useGoogleAuth() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = useCallback(
    async (idToken: string): Promise<AuthResponse> => {
      setLoading(true);
      setError(null);

      try {
        if (!idToken) {
          throw new Error("No credential received from Google");
        }

        const decoded = decodeJWT(idToken);

        if (!decoded.email) {
          throw new Error("No email in Google token");
        }

        const authResponse = await authService.loginWithGoogle({
          idToken,
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
        });

        if (authResponse.token && authResponse.user) {
          setUser(authResponse.user);
          return authResponse;
        }

        throw new Error("No token in response");
      } catch (err: any) {
        const errorMsg = err?.message || "Error al autenticarse con Google";
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const handleGoogleError = useCallback(() => {
    const errorMsg = "Error al autenticarse con Google";
    setError(errorMsg);
    toast({
      title: "Error",
      description: errorMsg,
      variant: "destructive",
    });
  }, [toast]);

  return {
    user,
    loading,
    error,
    handleGoogleSuccess,
    handleGoogleError,
  };
}
