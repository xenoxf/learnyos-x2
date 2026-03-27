"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import type { FlashCard, Card, GenerateFlashCardData } from "@/types";

export function useFlashCardsQuery() {
  const queryClient = useQueryClient();

  const {
    data: cards = [],
    isLoading,
    error,
  } = useQuery<Card[]>({
    queryKey: ["flashcards"],
    queryFn: () => apiService.getFlashcards(),
  });

  // Extraer todas las flashcards de todos los cards
  const flashcards: FlashCard[] = cards.flatMap(
    (card: Card) => card.flashcards || [],
  );

  const generateMutation = useMutation<void, Error, GenerateFlashCardData>({
    mutationFn: async (input) => {
      await apiService.generateFlashcards({
        reference: input.reference,
        quantity: input.quantity,
        acceso: input.acceso,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });

  const deleteMutation = useMutation<void, unknown, number>({
    mutationFn: (cardId: number) => apiService.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
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
