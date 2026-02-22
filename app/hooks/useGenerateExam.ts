'use client';

import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import type { Exam, GenerateExamDto } from '@/types';

export function useGenerateExam() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateExam = useCallback(
    async (data: GenerateExamDto): Promise<Exam | null> => {
      try {
        setLoading(true);
        setError(null);
        // backend allows optional fields, so we can send data as-is
        const generated = await apiService.generateExam(data);

        if (generated) {
          setExam(generated);
          return generated;
        }
        return null;
      } catch (err: any) {
        setError(err.message || 'Error al generar examen');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const resetExam = () => {
    setExam(null);
    setError(null);
  };

  return { exam, loading, error, generateExam, resetExam };
}
