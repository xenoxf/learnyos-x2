"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle } from "lucide-react"
import { ApiService, User } from "@/services/apiService"

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const apiService = new ApiService()

      const token = searchParams.get("token")
      const error = searchParams.get("error")

      console.log("AuthCallback - Token:", token ? "Sí" : "No")
      console.log("AuthCallback - Error:", error)

      if (error) {
        console.error("Error de autenticación:", error)
        router.replace("/auth?error=google_failed")
        return
      }

      if (!token) {
        router.replace("/auth")
        return
      }

      try {
        // 1. Guardar token
        apiService.saveToken(token)

        // 2. Decodificar JWT
        const payload = decodeJWT(token)

        const userData: User = {
          id: payload.sub,
          email: payload.email,
          avatar: payload.picture || "",
          name: payload.name || payload.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // 3. Guardar usuario
        apiService.saveUser(userData)

        // 4. Redirigir
        setTimeout(() => {
          router.replace("/dashboard")
        }, 500)
      } catch (err) {
        console.error("Error procesando token:", err)
        router.replace("/auth?error=token_invalid")
      }

      // Limpiar URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, "/auth/callback")
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-xl max-w-md w-full">
        <div className="mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            ¡Autenticación Exitosa!
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Estamos preparando tu experiencia de aprendizaje
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
            <span className="text-foreground text-sm sm:text-base">
              Redirigiendo al dashboard...
            </span>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Si no eres redirigido automáticamente,{" "}
              <button
                onClick={() => router.push("/dashboard")}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                haz clic aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// --------------------
// Utils
// --------------------
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding JWT:", error)
    return {}
  }
}
