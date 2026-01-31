"use client"

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';

export function useFlashCards() {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getFlashcards();
      setFlashcards(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateFlashcards = useCallback(async (data: { topic?: string; referenceText?: string; quantity?: number; level?: string }) => {
    try {
      setLoading(true);
      const generated = await apiService.generateFlashcards(data);
      if (Array.isArray(generated)) {
        setFlashcards([...flashcards, ...generated]);
      } else {
        setFlashcards([...flashcards, generated]);
      }
      return generated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [flashcards]);

  const deleteFlashcard = useCallback(async (cardId: number) => {
    try {
      await apiService.deleteFlashcard(cardId);
      setFlashcards(flashcards.filter(c => c.id !== cardId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [flashcards]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  return { flashcards, loading, error, generateFlashcards, deleteFlashcard, loadFlashcards };
}