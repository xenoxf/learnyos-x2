"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          toast({
            title: "Error de autenticación",
            description: error,
            variant: "destructive",
          });
          router.push("/auth");
          return;
        }

        if (!code) {
          toast({
            title: "Error",
            description: "No se recibió código de autenticación",
            variant: "destructive",
          });
          router.push("/auth");
          return;
        }

        // Enviar código al backend
        const response = await apiService.googleAuthWithCode(code);

        toast({
          title: "Éxito",
          description: "Autenticación completada",
        });

        router.push("/dashboard");
      } catch (error: any) {
        console.error("Error en callback:", error);
        toast({
          title: "Error",
          description: error.message || "Error al procesar la autenticación",
          variant: "destructive",
        });
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router, toast]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {loading ? (
        <div>Procesando autenticación...</div>
      ) : (
        <div>Redirigiendo...</div>
      )}
    </div>
  );
}
