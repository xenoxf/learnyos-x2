"use client";

import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import type { FlashCard, GenerateFlashCardData } from '@/types';

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
        setFlashcards(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar flashcards');
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

  const generateFlashCards = async (data: GenerateFlashCardData): Promise<FlashCard[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.generateFlashcards({
        ...data,
        quantity: data.quantity ?? data.numberOfCards ?? 10,
      });
      if (res?.flashcards?.length) {
        addFlashCards(res.flashcards);
        return res.flashcards;
      }
      return null;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar flashcards');
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