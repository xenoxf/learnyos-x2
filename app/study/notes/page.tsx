"use client";

import React, { useCallback } from "react";
import NotesGrid from "@/components/notes/NotesGrid";
import NoteDetail from "@/components/notes/NoteDetail";
import { useViewerNavigation } from "@/hooks/useViewerNavigation";

export default function NotesPage() {
  const { selectedId, isOpen, openDetail, closeDetail } = useViewerNavigation();

  const handleNoteOpen = useCallback((noteId: number) => {
    openDetail(noteId);
  }, [openDetail]);

  if (isOpen && selectedId) {
    return <NoteDetail noteId={selectedId} onBack={closeDetail} />;
  }

  return <NotesGrid onNoteOpen={handleNoteOpen} />;
}
