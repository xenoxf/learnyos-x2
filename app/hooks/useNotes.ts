"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import type { NoteDeck } from "@/types";

export function useNotes() {
  const [notes, setNotes] = useState<NoteDeck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getNotes();
        setNotes(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Error al cargar notas");
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const addNote = (note: NoteDeck) => {
    setNotes((prev: NoteDeck[]) => [...prev, note]);
  };

  const removeNote = (noteId: number) => {
    setNotes((prev: NoteDeck[]) => prev.filter((n) => n.id !== noteId));
  };

  const updateNote = (noteId: number, updated: Partial<NoteDeck>) => {
    setNotes((prev: NoteDeck[]) =>
      prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n)),
    );
  };

  return { notes, loading, error, addNote, removeNote, updateNote };
}
