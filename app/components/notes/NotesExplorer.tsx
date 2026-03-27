"use client";

import React, { useState, useCallback } from "react";
import NotesGrid from "./NotesGrid";
import NoteViewer from "./NoteViewer";
import styles from "@/styles/notes/NotesExplorer.module.css";

export function NotesExplorer() {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  const handleNoteOpen = useCallback((noteId: number) => {
    setSelectedNoteId(noteId);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedNoteId(null);
  }, []);

  return (
    <>
      <div className={styles.container}>
        <NotesGrid onNoteOpen={handleNoteOpen} />

        {selectedNoteId && (
          <NoteViewer
            noteId={selectedNoteId}
            onClose={handleCloseViewer}
          />
        )}
      </div>
    </>
  );
}
