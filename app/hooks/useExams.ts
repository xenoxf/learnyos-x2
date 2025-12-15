"use client"

import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import type { Exam, GenerateExamInput, GenerateExamResponse } from '@/types';

export interface UseExamsReturn {
  exams: Exam[];
  loading: boolean;
  error: string | null;
  getExams: () => Promise<Exam[]>;
  getExamById: (id: number) => Promise<Exam>;
  createExam: (data: Partial<Exam>) => Promise<Exam>;
  updateExam: (id: number, data: Partial<Exam>) => Promise<Exam>;
  deleteExam: (id: number) => Promise<void>;
  generateExam: (input: GenerateExamInput) => Promise<GenerateExamResponse>;
}

export function useExams(): UseExamsReturn {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getExams();
      setExams(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getExamById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getExamById(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createExam = useCallback(async (data: Partial<Exam>) => {
    setLoading(true);
    setError(null);
    try {
      const newExam = await apiService.createExam(data);
      setExams([...exams, newExam]);
      return newExam;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [exams]);

  const updateExam = useCallback(async (id: number, data: Partial<Exam>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiService.updateExam(id, data);
      setExams(exams.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [exams]);

  const deleteExam = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteExam(id);
      setExams(exams.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [exams]);

  const generateExam = useCallback(async (input: GenerateExamInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.generateExam(input);
      setExams([...exams, result.exam]);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [exams]);

  return {
    exams,
    loading,
    error,
    getExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    generateExam,
  };
}