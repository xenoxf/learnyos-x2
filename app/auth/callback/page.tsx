"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/authService";
import { httpClient } from "@/services/client";

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");
    const code = params.get("code");

    if (error) {
      // toast.error(
      //   "Error de autenticación",
      //   error === "google_failed" ? "Error al autenticarse con Google." : error,
      // );
      setStatus("error");
      router.replace("/auth");
      return;
    }

    if (token) {
      if (typeof window !== "undefined" && window.opener) {
        window.opener.postMessage({ type: "AUTH_SUCCESS", token }, "*");
        window.close();
      }
      httpClient.setToken(token);
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
      authService
        .googleAuthWithCode(code)
        .then((res) => {
          if (res.user && typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(res.user));
            localStorage.removeItem("isGuest");
            if (window.opener) {
              window.opener.postMessage({ type: "AUTH_SUCCESS" }, "*");
              window.close();
            }
          }
          setStatus("ok");
          router.replace("/study");
        })
        .catch(() => {
          setStatus("error");
          router.replace("/auth");
        });
      return;
    }

    setStatus("error");
    // toast.error("Error", "Algo salió mal");
    router.replace("/auth");
  }, [params, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4">
      {status === "loading" && (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Completando inicio de sesión...
          </p>
        </>
      )}
      {status === "error" && (
        <p className="text-sm text-muted-foreground">Redirigiendo...</p>
      )}
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
