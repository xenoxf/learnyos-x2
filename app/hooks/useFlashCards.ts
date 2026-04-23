"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FlashCardKlek, CardsDeck } from "@/types";
import { cardsService } from "@/services/cardsService";

export function useFlashCards() {
  const queryClient = useQueryClient();

  const {
    data: flashcards = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const data = await cardsService.getFlashcards();
      const cardsWithFlashcards = Array.isArray(data)
        ? data.filter(
            (card: CardsDeck) => card.flashcards && card.flashcards.length > 0,
          )
        : [];
      const allFlashcards = cardsWithFlashcards.flatMap(
        (card: CardsDeck) => card.flashcards || [],
      );
      return Array.isArray(allFlashcards) ? allFlashcards : [];
    },
  });

  const addFlashcard = (flashcard: FlashCardKlek) => {
    queryClient.setQueryData(["flashcards"], (old: FlashCardKlek[] = []) => [
      ...old,
      flashcard,
    ]);
  };

  const removeFlashcard = (flashcardId: number) => {
    queryClient.setQueryData(["flashcards"], (old: FlashCardKlek[] = []) =>
      old.filter((f) => f.id !== flashcardId),
    );
  };

  return {
    flashcards,
    loading,
    error: queryError ? (queryError as Error).message : null,
    addFlashcard,
    removeFlashcard,
  };
}
