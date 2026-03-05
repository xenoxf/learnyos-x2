"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Loader,
  Tag,
  Sparkles,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import type { Note } from "@/types";
import styles from "@/styles/notes/NoteCard.module.css";

interface NoteCardProps {
  note: Note;
  onDelete: (id: number) => Promise<void>;
  isDeleting: boolean;
}

// Helper para extraer contenido
function getNoteContent(note: Note): string {
  if (note.noteContents?.length) {
    return note.noteContents
      .sort((a, b) => a.order - b.order)
      .map((c) => c.content)
      .filter(Boolean)
      .join("\n\n");
  }
  if (note.description) return note.description;
  if (note.noteContents?.length) {
    return note.noteContents
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((b) => b.content ?? "")
      .filter(Boolean)
      .join("\n\n");
  }
  return "";
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function NoteCard({ note, onDelete, isDeleting }: NoteCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fullContent = useMemo(() => getNoteContent(note), [note]);
  const previewContent = useMemo(() => {
    return fullContent.length > 200
      ? fullContent.slice(0, 200) + "..."
      : fullContent;
  }, [fullContent]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("¿Eliminar esta nota? Esta acción no se puede deshacer.")) {
      await onDelete(note.id);
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>{note.title}</h3>
          {note.description && (
            <p className={styles.description}>{note.description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
          className={styles.deleteButton}
          aria-label="Eliminar nota"
        >
          {isDeleting ? (
            <Loader className={styles.spinner} size={18} />
          ) : (
            <Trash2 size={18} />
          )}
        </Button>
      </div>

      <div className={styles.content}>
        {fullContent ? (
          <MarkdownRenderer
            content={isExpanded ? fullContent : previewContent}
          />
        ) : (
          <em className={styles.emptyContent}>Sin contenido</em>
        )}

        {fullContent.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={styles.expandButton}
          >
            {isExpanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.metadata}>
          {note.levelOfDetail && (
            <span className={styles.metaItem}>
              <Sparkles size={12} />
              {note.levelOfDetail}
            </span>
          )}
          {note.createdAt && (
            <span className={styles.metaItem}>
              <Clock size={12} />
              {formatDate(note.createdAt)}
            </span>
          )}
          <span className={styles.metaItem}>
            {fullContent.length} caracteres
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label="Copiar contenido"
        >
          {isCopied ? (
            <>
              <Check size={14} />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copiar</span>
            </>
          )}
        </Button>
      </div>

      {note.noteContents && note.noteContents.length > 0 && (
        <div className={styles.subNotes}>
          <h4 className={styles.subNotesTitle}>Subtemas</h4>
          <div className={styles.subNotesList}>
            {note.noteContents.map((subNote, index) => (
              <details key={index} className={styles.subNote}>
                <summary className={styles.subNoteSummary}>
                  {subNote.title || `Subtema ${index + 1}`}
                </summary>
                <div className={styles.subNoteContent}>
                  <MarkdownRenderer content={subNote.content} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
