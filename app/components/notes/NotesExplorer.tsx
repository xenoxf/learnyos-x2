"use client";

import React from "react";
import { NotesSearch } from "./NotesSearch";
import { NotesGrid } from "./NotesGrid";
import type { Note } from "@/types";
import styles from "@/styles/notes/NotesExplorer.module.css";

interface NotesExplorerProps {
  notes: Note[];
  filteredNotes: Note[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDeleteNote: (id: number) => Promise<void>;
  isDeleting: boolean;
  isLoading: boolean;
}

export function NotesExplorer({
  notes,
  filteredNotes,
  searchQuery,
  onSearchChange,
  onDeleteNote,
  isDeleting,
  isLoading,
}: NotesExplorerProps) {
  return (
    <div className={styles.container}>
      <NotesSearch
        value={searchQuery}
        onChange={onSearchChange}
        totalNotes={notes.length}
        filteredCount={filteredNotes.length}
      />

      <NotesGrid
        notes={filteredNotes}
        onDelete={onDeleteNote}
        isDeleting={isDeleting}
        isLoading={isLoading}
      />
    </div>
  );
}
