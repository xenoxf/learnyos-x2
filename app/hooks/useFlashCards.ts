import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import type { FlashCard, Card, GenerateFlashCardData } from "@/types";

export function useFlashCards() {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getFlashcards();
        // getFlashcards devuelve Card[], necesitamos extraer todas las FlashCard de todos los Cards
        const allFlashcards = Array.isArray(data)
          ? data.flatMap((card: Card) => card.flashcards || [])
          : [];
        setFlashcards(allFlashcards);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar flashcards";
        setError(errorMessage);
        setFlashcards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  const addFlashCard = (card: FlashCard) => {
    setFlashcards((prev: FlashCard[]) => [...prev, card]);
  };

  const addFlashCards = (cards: FlashCard[]) => {
    setFlashcards((prev: FlashCard[]) => [...prev, ...cards]);
  };

  const removeFlashCard = (cardId: number) => {
    setFlashcards((prev: FlashCard[]) => prev.filter((c) => c.id !== cardId));
  };

  const updateFlashCard = (cardId: number, updated: Partial<FlashCard>) => {
    setFlashcards((prev: FlashCard[]) =>
      prev.map((c) => (c.id === cardId ? { ...c, ...updated } : c)),
    );
  };

  const generateFlashCards = async (
    data: GenerateFlashCardData,
  ): Promise<FlashCard[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const res: Card = await apiService.generateFlashcards({
        reference: data.reference,
        quantity: data.quantity ?? 10,
        acceso: data.acceso,
      });
      if (res.flashcards?.length) {
        addFlashCards(res.flashcards);
        return res.flashcards;
      }
      return null;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al generar flashcards";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    flashcards,
    loading,
    error,
    addFlashCard,
    addFlashCards,
    removeFlashCard,
    updateFlashCard,
    generateFlashCards,
  };
}
