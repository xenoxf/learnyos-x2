"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExamDeck } from "@/types";
import { quizzesService } from "@/services/quizzesService";

export function useExams() {
  const queryClient = useQueryClient();

  const {
    data: exams = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: () => quizzesService.getExams(),
  });

  const deleteMutation = useMutation({
    mutationFn: (examId: number) => quizzesService.deleteExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });

  const scoreMutation = useMutation({
    mutationFn: ({ examId, score }: { examId: number; score: number }) =>
      quizzesService.updateExamScore(examId, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });

  const addExam = (exam: ExamDeck) => {
    queryClient.setQueryData(["exams"], (old: ExamDeck[] = []) => [
      ...old,
      exam,
    ]);
  };

  const removeExam = async (examId: number) => {
    await deleteMutation.mutateAsync(examId);
  };

  const updateExamScore = async (examId: number, score: number) => {
    await scoreMutation.mutateAsync({ examId, score });
  };

  return {
    exams,
    loading,
    error: queryError ? (queryError as Error).message : null,
    addExam,
    removeExam,
    updateExamScore,
  };
}
