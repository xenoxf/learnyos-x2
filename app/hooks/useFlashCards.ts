"use client"

import { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import type { Card, FlashCard, GenerateFlashcardsInput, GenerateFlashcardsResponse } from '@/types';

export interface UseFlashCardsReturn {
  cards: Card[];
  flashcards: FlashCard[];
  loading: boolean;
  error: string | null;
  createCard: (data: { title: string; description?: string }) => Promise<Card>;
  getCards: (filters?: Record<string, any>) => Promise<Card[]>;
  getCardById: (id: number) => Promise<Card>;
  updateCard: (id: number, data: Partial<Card>) => Promise<Card>;
  deleteCard: (id: number) => Promise<void>;
  createFlashcard: (data: Partial<FlashCard>) => Promise<FlashCard>;
  getFlashcardsByCard: (cardId: number, filters?: Record<string, any>) => Promise<FlashCard[]>;
  getFlashcardById: (id: number) => Promise<FlashCard>;
  updateFlashcard: (id: number, data: Partial<FlashCard>) => Promise<FlashCard>;
  deleteFlashcard: (id: number) => Promise<void>;
  markFlashcardAsReviewed: (id: number) => Promise<FlashCard>;
  generateFlashcards: (input: GenerateFlashcardsInput) => Promise<GenerateFlashcardsResponse>;
}

export function useFlashCards(): UseFlashCardsReturn {
  const [cards, setCards] = useState<Card[]>([]);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCard = useCallback(async (data: { title: string; description?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const card = await apiService.createCard(data);
      setCards([...cards, card]);
      return card;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cards]);

  const getCards = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getCards(filters);
      setCards(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCardById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getCardById(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCard = useCallback(async (id: number, data: Partial<Card>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiService.updateCard(id, data);
      setCards(cards.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cards]);

  const deleteCard = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteCard(id);
      setCards(cards.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cards]);

  const createFlashcard = useCallback(async (data: Partial<FlashCard>) => {
    setLoading(true);
    setError(null);
    try {
      const flashcard = await apiService.createFlashcard(data);
      setFlashcards([...flashcards, flashcard]);
      return flashcard;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [flashcards]);

  const getFlashcardsByCard = useCallback(async (cardId: number, filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getFlashcardsByCard(cardId, filters);
      setFlashcards(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFlashcardById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getFlashcardById(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFlashcard = useCallback(async (id: number, data: Partial<FlashCard>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiService.updateFlashcard(id, data);
      setFlashcards(flashcards.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [flashcards]);

  const deleteFlashcard = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteFlashcard(id);
      setFlashcards(flashcards.filter((f) => f.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [flashcards]);

  const markFlashcardAsReviewed = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiService.markFlashcardAsReviewed(id);
      setFlashcards(flashcards.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [flashcards]);

  const generateFlashcards = useCallback(async (input: GenerateFlashcardsInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.generateFlashcards(input);
      setCards([...cards, result.card]);
      setFlashcards([...flashcards, ...result.flashcards]);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cards, flashcards]);

  return {
    cards,
    flashcards,
    loading,
    error,
    createCard,
    getCards,
    getCardById,
    updateCard,
    deleteCard,
    createFlashcard,
    getFlashcardsByCard,
    getFlashcardById,
    updateFlashcard,
    deleteFlashcard,
    markFlashcardAsReviewed,
    generateFlashcards,
  };
}
