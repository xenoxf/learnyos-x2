'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import type { Note } from '@/types';

export const useNotesList = () => {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: () => apiService.getNotes(),
    enabled: apiService.isAuthenticated(),
  });

  const generateFromTopicMutation = useMutation({
    mutationFn: ({ topic, numberOfNotes, levelOfDetail }: any) =>
      apiService.generateNotesFromTopic(topic, numberOfNotes, levelOfDetail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const generateFromReferenceMutation = useMutation({
    mutationFn: ({ referenceText, numberOfNotes, levelOfDetail }: any) =>
      apiService.generateNotesFromReference(referenceText, numberOfNotes, levelOfDetail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: Partial<Note>) => apiService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Note> }) =>
      apiService.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    notes,
    isLoading,
    error,
    generateFromTopic: generateFromTopicMutation.mutateAsync,
    generateFromReference: generateFromReferenceMutation.mutateAsync,
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    isGenerating: generateFromTopicMutation.isPending || generateFromReferenceMutation.isPending,
  };
};
