"use client";

import React, { useState, useCallback } from "react";
import NotesGrid from "@/components/notes/NotesGrid";
import NoteViewer from "@/components/notes/NoteViewer";

export default function NotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  const handleNoteOpen = useCallback((noteId: number) => {
    setSelectedNoteId(noteId);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedNoteId(null);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <NotesGrid onNoteOpen={handleNoteOpen} />

      {selectedNoteId && (
        <NoteViewer
          noteId={selectedNoteId}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}
