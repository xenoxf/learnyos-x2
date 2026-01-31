'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import type { FlashCard } from '@/types';

export const useFlashCards = () => {
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading, error } = useQuery({
    queryKey: ['flashcards'],
    queryFn: () => apiService.getFlashcards(),
    enabled: apiService.isAuthenticated(),
  });

  const generateFromTopicMutation = useMutation({
    mutationFn: ({ topic, numberOfCards }: any) =>
      apiService.generateFlashcardsFromTopic(topic, numberOfCards),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  const generateFromReferenceMutation = useMutation({
    mutationFn: ({ referenceText, numberOfCards }: any) =>
      apiService.generateFlashcardsFromReference(referenceText, numberOfCards),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  const createFlashcardMutation = useMutation({
    mutationFn: (data: Partial<FlashCard>) => apiService.createFlashcard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  const updateFlashcardMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FlashCard> }) =>
      apiService.updateFlashcard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  const deleteFlashcardMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteFlashcard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  return {
    cards,
    isLoading,
    error,
    generateFromTopic: generateFromTopicMutation.mutateAsync,
    generateFromReference: generateFromReferenceMutation.mutateAsync,
    createFlashcard: createFlashcardMutation.mutateAsync,
    updateFlashcard: updateFlashcardMutation.mutateAsync,
    deleteFlashcard: deleteFlashcardMutation.mutateAsync,
    isGenerating: generateFromTopicMutation.isPending || generateFromReferenceMutation.isPending,
  };
};
