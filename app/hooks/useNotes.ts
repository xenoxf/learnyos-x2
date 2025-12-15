"use client"

// filepath: /home/juniorxf/proyectos/learnyos/src/hooks/useNotes.ts

import { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import type { Note, GenerateNoteInput } from '@/types';

export interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  getNotes: () => Promise<Note[]>;
  getNoteById: (id: number) => Promise<Note>;
  generateNote: (input: GenerateNoteInput) => Promise<Note>;
  deleteNote: (id: number) => Promise<void>;
  refreshNotes: () => Promise<void>;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getNotes();
      setNotes(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNoteById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getNoteById(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateNote = useCallback(async (input: GenerateNoteInput) => {
    setLoading(true);
    setError(null);
    try {
      const newNote = await apiService.generateNote(input);
      setNotes([...notes, newNote]);
      return newNote;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [notes]);

  const deleteNote = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteNote(id);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [notes]);

  const refreshNotes = useCallback(async () => {
    await getNotes();
  }, [getNotes]);

  useEffect(() => {
    getNotes();
  }, []);

  return {
    notes,
    loading,
    error,
    getNotes,
    getNoteById,
    generateNote,
    deleteNote,
    refreshNotes,
  };
}