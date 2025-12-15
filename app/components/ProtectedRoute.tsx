import React, { useEffect, useState } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { apiService } from '@/services/apiService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación directamente desde apiService
    const checkAuth = () => {
      const authenticated = apiService.isAuthenticated();
      const token = apiService.getToken();
      
      // Usuario está autenticado solo si tiene token válido
      setIsAuthenticated(authenticated && !!token);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
          <p className="text-muted-foreground text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/");
  }

  return <>{children}</>;
};