"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/services/apiService";

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Procesando autenticación...");

  useEffect(() => {
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      setMessage(`Error: ${error}`);
      return;
    }

    if (!code) {
      setMessage("Código de autenticación no encontrado");
      return;
    }

    const handleAuth = async () => {
      try {
        await apiService.googleAuthWithCode(code);
        router.push("/");
      } catch (e) {
        setMessage("Error durante el proceso de autenticación");
      }
    };

    handleAuth();
  }, [params, router]);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">
        Callback de Autenticación
      </h1>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-4">Cargando...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
