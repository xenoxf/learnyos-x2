"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NoteDeck } from "@/types";
import { notesService } from "@/services/notesService";

export function useNotes() {
  const queryClient = useQueryClient();

  const {
    data: notes = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: () => notesService.getNotes(),
  });

  const { data: publicNotes = [] } = useQuery({
    queryKey: ["notes", "public"],
    queryFn: () => notesService.getNotesPublic(),
  });

  const addNote = (note: NoteDeck) => {
    queryClient.setQueryData(["notes"], (old: NoteDeck[] = []) => [
      ...old,
      note,
    ]);
  };

  const removeNote = (noteId: number) => {
    queryClient.setQueryData(["notes"], (old: NoteDeck[] = []) =>
      old.filter((n) => n.id !== noteId),
    );
  };

  const updateNote = (noteId: number, updated: Partial<NoteDeck>) => {
    queryClient.setQueryData(["notes"], (old: NoteDeck[] = []) =>
      old.map((n) => (n.id === noteId ? { ...n, ...updated } : n)),
    );
  };

  return {
    notes,
    loading,
    error: queryError ? (queryError as Error).message : null,
    addNote,
    removeNote,
    updateNote,
  };
}
