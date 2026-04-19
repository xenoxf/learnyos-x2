"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/useLocalToast";
import { authService } from "@/services/authService";

interface GoogleAuthButtonProps {
  onSuccess?: (user: { id: number; email: string; name: string }) => void;
  onError?: (error: string) => void;
}

export function GoogleAuthButton({
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      const { url } = await authService.getGoogleAuthUrl();

      // Open Google auth in new window - doesn't reload current page
      const authWindow = window.open(
        url,
        "google-auth",
        "width=500,height=600,scrollbars=yes,resizable=yes",
      );

      if (!authWindow) {
        // Fallback if popup blocked - redirect in same window
        window.location.href = url;
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "AUTH_SUCCESS") {
          window.removeEventListener("message", handleMessage);
          authWindow.close();
          setLoading(false);
          router.push("/study");
          onSuccess?.({ id: 0, email: "", name: "" });
        }
      };

      window.addEventListener("message", handleMessage);

      // Poll for auth completion as fallback
      const checkAuth = setInterval(() => {
        try {
          if (authWindow.closed) {
            clearInterval(checkAuth);
            window.removeEventListener("message", handleMessage);
            setLoading(false);

            // Check if user was authenticated
            const userStr = localStorage.getItem("user");
            if (userStr) {
              router.push("/study");
              onSuccess?.({ id: 0, email: "", name: "" });
            }
          }
        } catch {
          // Cross-origin error - window still open
        }
      }, 500);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(checkAuth);
        window.removeEventListener("message", handleMessage);
        setLoading(false);
      }, 300000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al iniciar autenticación con Google";
      toast.error("Error", message);
      onError?.(message);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleClick}
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 h-12 text-base"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Conectando con Google...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="currentColor"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="currentColor"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="currentColor"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="currentColor"
            />
          </svg>
          <span>Continuar con Google</span>
        </>
      )}
    </Button>
  );
}
