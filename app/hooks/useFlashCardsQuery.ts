"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FlashCardKlek, CardsDeck, GenerateFlashCardData } from "@/types";
import { cardsService } from "@/services/cardsService";

export function useFlashCardsQuery() {
  const queryClient = useQueryClient();

  const {
    data: cards = [],
    isLoading,
    error,
  } = useQuery<CardsDeck[]>({
    queryKey: ["flashcards"],
    queryFn: () => cardsService.getFlashcards(),
  });

  // Extraer todas las flashcards de todos los cards
  const flashcards: FlashCardKlek[] = cards.flatMap(
    (card: CardsDeck) => card.flashcards || [],
  );

  const generateMutation = useMutation<void, Error, GenerateFlashCardData>({
    mutationFn: async (input) => {
      await cardsService.generateFlashcards({
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
    mutationFn: (cardId: number) => cardsService.deleteCard(cardId),
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
