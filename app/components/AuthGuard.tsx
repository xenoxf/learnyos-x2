"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/apiService";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      // Si no hay token, redirigir a auth
      if (!token) {
        router.push("/auth");
        setLoading(false);
        return;
      }

      // Verificar si el token es válido
      try {
        const isValid = await apiService.verifyToken();
        if (isValid) {
          setIsAuthed(true);
        } else {
          // Token inválido, limpiar y redirigir
          await apiService.logout();
          router.push("/auth");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        await apiService.logout();
        router.push("/auth");
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
          <p className="text-muted-foreground text-sm">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  return isAuthed ? <>{children}</> : null;
}

