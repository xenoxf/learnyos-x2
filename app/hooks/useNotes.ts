"use client"

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';

export function useNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotes();
      setNotes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateNote = useCallback(async (data: { topic?: string; referenceText?: string; quantity?: number; level?: string }) => {
    try {
      setLoading(true);
      const note = await apiService.createNote(data);
      setNotes([...notes, note]);
      return note;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [notes]);

  const deleteNote = useCallback(async (noteId: number) => {
    try {
      await apiService.deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [notes]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return { notes, loading, error, generateNote, deleteNote, loadNotes };
}