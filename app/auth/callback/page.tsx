"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/services/apiService";
import { toast } from "@/hooks/useLocalToast";
import { Loader2 } from "lucide-react";

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  ;
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");
    const code = params.get("code");

    if (error) {
      toast.error("Error de autenticación", error === "google_failed" ? "Error al autenticarse con Google." : error);
      setStatus("error");
      router.replace("/auth");
      return;
    }

    if (token) {
      apiService.setToken(token);
      const email = params.get("email");
      if (email && typeof window !== "undefined") {
        try {
          const user = { email, name: email.split("@")[0], id: 0 };
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.removeItem("isGuest");
        } catch (_) {}
      }
      setStatus("ok");
      router.replace("/study");
      return;
    }

    if (code) {
      apiService
        .googleAuthWithCode(code)
        .then((res) => {
          if (res.user && typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(res.user));
            localStorage.removeItem("isGuest");
          }
          setStatus("ok");
          router.replace("/study");
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Error durante la autenticación con Google.";
          toast.success("Éxito");
          setStatus("error");
          router.replace("/auth");
        });
      return;
    }

    setStatus("error");
    toast.error("Error", "Algo salió mal");
    router.replace("/auth");
  }, [params, router, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4">
      {status === "loading" && (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Completando inicio de sesión...</p>
        </>
      )}
      {status === "error" && <p className="text-sm text-muted-foreground">Redirigiendo...</p>}
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
