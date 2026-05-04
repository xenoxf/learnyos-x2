"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExamDeck, GenerateExamData } from "@/types";
import { quizzesService } from "@/services/quizzesService";
import { toast } from "@/hooks/useLocalToast";

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

  const generateMutation = useMutation<any, Error, GenerateExamData>({
    mutationFn: (data: GenerateExamData) => quizzesService.generateExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Éxito", "Tu nuevo examen ya está disponible en tu biblioteca.");
    },
    onError: (err) => {
      toast.error("Error al generar", err.message || "No se pudo generar el examen.");
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (examId: number) => quizzesService.deleteExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Eliminado", "El examen se ha eliminado correctamente.");
    },
    onError: (err) => {
      toast.error("Error al eliminar", err.message || "No se pudo eliminar el examen.");
    },
  });

  const scoreMutation = useMutation<ExamDeck[], Error, { examId: number; score: number }>({
    mutationFn: ({ examId, score }: { examId: number; score: number }) =>
      quizzesService.updateExamScore(examId, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Puntaje guardado", "El puntaje se ha actualizado correctamente.");
    },
    onError: (err) => {
      toast.error("Error al actualizar", err.message || "No se pudo actualizar el puntaje.");
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
    generateExam: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
}
