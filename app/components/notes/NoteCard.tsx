"use client";

import React from "react";
import { Trash2, FileText } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/notes/noteCard.module.css";
import type { Note } from "@/types";

interface NoteCardProps {
  note: Note & { canDelete?: boolean };
  onNoteOpen?: (noteId: number) => void;
  onNoteDeleted?: () => void;
}

export default function NoteCard({
  note,
  onNoteOpen,
  onNoteDeleted,
}: NoteCardProps) {
  const { toast } = useToast();
  const isOwner = note.canDelete ?? false;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isOwner) {
      toast({
        variant: "destructive",
        title: "No permitido",
        description: "Solo puedes eliminar tus propias notas",
      });
      return;
    }

    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer."
    );

    if (confirm) {
      try {
        await apiService.deleteNote(note.id);
        toast({
          title: "Éxito",
          description: "Nota eliminada correctamente",
        });
        if (onNoteDeleted) {
          onNoteDeleted();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al eliminar nota";
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      }
    }
  };

  const handleCardClick = () => {
    if (onNoteOpen) {
      onNoteOpen(note.id);
    }
  };

  return (
    <div
      className={styles.card}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick();
        }
      }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.titleSection}>
          <FileText size={20} className={styles.icon} />
          <h3 className={styles.cardTitle}>{note.title}</h3>
        </div>
        {isOwner && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            title="Eliminar nota"
            aria-label="Eliminar nota"
            type="button"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <p className={styles.cardDescription}>{note.description || ""}</p>

      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          <span className={styles.levelBadge}>
            {note.levelOfDetail || "breve"}
          </span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardHint}>Abrir nota</span>
        <span className={styles.noteCode}>#{note.id}</span>
      </div>
    </div>
  );
}
