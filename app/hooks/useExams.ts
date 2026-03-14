"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import type { Exam } from "@/types";

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getExams();
        setExams(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Error al cargar exámenes");
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const addExam = (exam: Exam) => {
    setExams((prevExams: Exam[]) => [...prevExams, exam]);
  };

  const removeExam = async (examId: number) => {
    apiService.deleteExam(examId);
    const exams = await apiService.getExams();
    setExams(exams);
  };

  const updateExamScore = async (examId: number, score: number) => {
    const exams: Exam[] = await apiService.updateExamScore(examId, score);
    setExams(exams);
  }



  return { exams, loading, error, addExam, removeExam, updateExamScore };
}
