'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import type { FlashCard, GenerateFlashCardDto } from '@/types';

export function useFlashCardsQuery() {
  const queryClient = useQueryClient();

  const {
    data: flashcards = [],
    isLoading,
    error,
  } = useQuery<FlashCard[]>({
    queryKey: ['flashcards'],
    queryFn: () => apiService.getFlashcards(),
  });

  const generateMutation = useMutation<
    Awaited<ReturnType<typeof apiService.generateFlashcards>>,
    Error,
    GenerateFlashCardDto
  >({
    mutationFn: (input) =>
      apiService.generateFlashcards({
        ...input,
        quantity: input.quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  const deleteMutation = useMutation<void, unknown, number>({
    mutationFn: (cardId: number) => apiService.deleteFlashcard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  return {
    flashcards,
    isLoading,
    error: error ? (error as Error).message : null,
    generateFlashCards: generateMutation.mutate,
    deleteFlashCard: deleteMutation.mutate,
    isGenerating: generateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
