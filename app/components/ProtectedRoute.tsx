'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/apiService';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (typeof window === 'undefined') {
        setIsValidating(false);
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        setIsTokenValid(false);
        setIsValidating(false);
        router.push('/auth');
        return;
      }

      try {
        const isValid = await apiService.verifyToken();

        if (isValid) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isGuest');
          router.push('/auth');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setIsTokenValid(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isGuest');
        router.push('/auth');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [router]);

  if (isValidating) {
    return <div>Validando...</div>;
  }

  if (!isTokenValid) {
    return null;
  }

  return <>{children}</>;
}