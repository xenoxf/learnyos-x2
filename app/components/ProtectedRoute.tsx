'use client';

import { useRouter } from 'next/navigation';
import { useTokenVerification } from '@/hooks/useTokenVerification';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isValid, isLoading } = useTokenVerification();

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
  }

  if (!isValid) {
    router.push('/auth');
    return null;
  }

  return <>{children}</>;
}