'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import type { TokenVerificationResult } from '@/types';

const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // Verificar cada 5 minutos

export function useTokenVerification() {
  const [result, setResult] = useState<TokenVerificationResult>({
    isValid: false,
    isLoading: true,
  });

  const verifyToken = useCallback(async () => {
    if (typeof window === 'undefined') {
      setResult({ isValid: false, isLoading: false });
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setResult({ isValid: false, isLoading: false });
      return;
    }

    try {
      setResult(prev => ({ ...prev, isLoading: true }));
      const verifyResult = await apiService.verifyToken();

      if (verifyResult.valid) {
        setResult({
          isValid: true,
          user: verifyResult.user,
          isLoading: false,
        });
      } else {
        // Token inválido o expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setResult({
          isValid: false,
          isLoading: false,
          error: 'Token inválido o expirado',
        });
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setResult({
        isValid: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al verificar token',
      });
    }
  }, []);

  // Verificar token al montar
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // Verificar token periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      verifyToken();
    }, TOKEN_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [verifyToken]);

  return { ...result, verifyToken };
}