"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import type { Note } from "@/types";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
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

  const addNote = (note: Note) => {
    setNotes((prev: Note[]) => [...prev, note]);
  };

  const removeNote = (noteId: number) => {
    setNotes((prev: Note[]) => prev.filter((n) => n.id !== noteId));
  };

  const updateNote = (noteId: number, updated: Partial<Note>) => {
    setNotes((prev: Note[]) =>
      prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n)),
    );
  };

  return { notes, loading, error, addNote, removeNote, updateNote };
}