"use client";

import { useState, useEffect } from "react";
import type { FlashCardKlek, CardsDeck, GenerateFlashCardData } from "@/types";
import { cardsService } from "@/services/cardsService";

export function useFlashCards() {
  const [flashcards, setFlashcards] = useState<FlashCardKlek[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cardsService.getFlashcards();
        // Filtramos solo los que tienen flashcards
        const cardsWithFlashcards = Array.isArray(data)
          ? data.filter(
              (card: CardsDeck) =>
                card.flashcards && card.flashcards.length > 0,
            )
          : [];
        const allFlashcards = cardsWithFlashcards.flatMap(
          (card: CardsDeck) => card.flashcards || [],
        );
        setFlashcards(Array.isArray(allFlashcards) ? allFlashcards : []);
      } catch (err: any) {
        setError(err.message || "Error al cargar flashcards");
        setFlashcards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  const addFlashcard = (flashcard: FlashCardKlek) => {
    setFlashcards((prev) => [...prev, flashcard]);
  };

  const removeFlashcard = (flashcardId: number) => {
    setFlashcards((prev) => prev.filter((f) => f.id !== flashcardId));
  };

  return { flashcards, loading, error, addFlashcard, removeFlashcard };
}
