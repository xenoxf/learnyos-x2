"use client";

import React from "react";
import { NoteCard } from "./NoteCard";
import { Loader, BookOpen } from "lucide-react";
import type { Note } from "@/types";
import styles from "@/styles/notes/NotesGrid.module.css";

interface NotesGridProps {
  notes: Note[];
  onDelete: (id: number) => Promise<void>;
  isDeleting: boolean;
  isLoading: boolean;
}

export function NotesGrid({
  notes,
  onDelete,
  isDeleting,
  isLoading,
}: NotesGridProps) {
  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Loader className={styles.spinner} size={40} />
        <p className={styles.loadingText}>Cargando tus notas...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <BookOpen className={styles.emptyIcon} size={48} />
        <h3 className={styles.emptyTitle}>No hay notas para mostrar</h3>
        <p className={styles.emptyText}>
          ¡Comienza generando tu primera nota con IA!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
