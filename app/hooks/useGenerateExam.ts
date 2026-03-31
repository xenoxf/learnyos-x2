"use client";

import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import type { ExamKlek, GenerateExamData } from '@/types';

export function useGenerateExam() {
  const [exam, setExam] = useState<ExamKlek | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateExam = useCallback(async (data: GenerateExamData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.generateExam(data);
      setExam(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al generar examen');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearExam = useCallback(() => {
    setExam(null);
    setError(null);
  }, []);

  return { exam, loading, error, generateExam, clearExam };
}
