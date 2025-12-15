"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ApiService } from "@/services/apiService"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const apiService = new ApiService()
      const authenticated = apiService.isAuthenticated()
      const token = apiService.getToken()
      
      setIsAuthenticated(authenticated && !!token)
      setIsChecking(false)

      if (!authenticated || !token) {
        router.push("/auth")
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
          <p className="text-muted-foreground text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

