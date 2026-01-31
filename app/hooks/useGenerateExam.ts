// ...existing imports...
import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';

interface GenerateExamInput {
  subject: string;
  quantity?: number;
  difficulty?: string;
}

export function useGenerateExam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateExam = useCallback(async (input: GenerateExamInput) => {
    try {
      setLoading(true);
      const exam = await apiService.generateExam(input.subject, input.quantity, input.difficulty);
      return exam;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateExam, loading, error };
}
