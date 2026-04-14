"use client";

import { useState, useEffect } from "react";
import type { ExamDeck } from "@/types";
import { quizzesService } from "@/services/quizzesService";

export function useExams() {
  const [exams, setExams] = useState<ExamDeck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await quizzesService.getExams();
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

  const addExam = (exam: ExamDeck) => {
    setExams((prevExams: ExamDeck[]) => [...prevExams, exam]);
  };

  const removeExam = async (examId: number) => {
    await quizzesService.deleteExam(examId);
    const exams = await quizzesService.getExams();
    setExams(exams);
  };

  const updateExamScore = async (examId: number, score: number) => {
    const exams: ExamDeck[] = await quizzesService.updateExamScore(
      examId,
      score,
    );
    setExams(exams);
  };

  return { exams, loading, error, addExam, removeExam, updateExamScore };
}
