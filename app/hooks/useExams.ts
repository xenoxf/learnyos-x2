"use client"

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';

export function useExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getExams();
      setExams(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateExam = useCallback(async (data: { topic?: string; reference?: string; quantity?: number; level?: string }) => {
    try {
      setLoading(true);
      const exam = await apiService.generateExam(data);
      setExams([...exams, exam]);
      return exam;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [exams]);

  const deleteExam = useCallback(async (examId: number) => {
    try {
      await apiService.deleteExam(examId);
      setExams(exams.filter(e => e.id !== examId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [exams]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  return { exams, loading, error, generateExam, deleteExam, loadExams };
}