"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import MarkdownRenderer from "../MarkdownRenderer";
import styles from "@/styles/noteReaderFull.module.css";
import { toast } from "@/hooks/useLocalToast";
import type { NoteKlek } from "@/types";
import { useRouter } from "next/navigation";
import {
  normalizeNoteContentBody,
  noteSectionHeading,
} from "@/lib/noteContent";
import { notesService } from "@/services/notesService";

interface NoteReaderFullProps {
  noteId: number;
}

export default function NoteReaderFull({ noteId }: NoteReaderFullProps) {
  const router = useRouter();
  const [note, setNote] = useState<NoteKlek | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadNote = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await notesService.getNote(noteId);
        if (!cancelled) setNote(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al cargar nota";
        if (!cancelled) {
          setError(message);
          toast.info("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadNote();
    return () => {
      cancelled = true;
    };
  }, [noteId]);

  const sections = useMemo(() => {
    if (!note?.noteContents?.length) return [];
    return [...note.noteContents].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }, [note]);

  const handleBack = () => {
    router.push("/study/notes");
  };

  if (loading) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Cargando nota...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>Error al cargar la nota</h2>
          <p className={styles.errorMessage}>
            {error || "No se encontró la nota"}
          </p>
          <button
            onClick={handleBack}
            className={styles.backButton}
            type="button"
          >
            <ArrowLeft size={18} />
            Volver a Notas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fullPageContainer}>
      <div className={styles.notePage}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <button
            onClick={handleBack}
            className={styles.backButtonSmall}
            type="button"
          >
            <ArrowLeft size={18} />
            <span className={styles.backButtonText}>Volver</span>
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.pageTitle}>{note.title}</h1>
            {note.description && (
              <p className={styles.pageDescription}>{note.description}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={styles.mainContent}>
          {sections.length === 0 ? (
            <div className={styles.emptyContent}>
              <FileText size={48} className={styles.emptyIcon} />
              <p>No hay contenido en esta nota</p>
            </div>
          ) : (
            <div className={styles.contentList}>
              {sections.map((content, index) => {
                const heading = noteSectionHeading(
                  content.tema,
                  content.title,
                  content.order ?? index,
                );
                const md = normalizeNoteContentBody(content.content);

                return (
                  <article key={content.id} className={styles.contentItem}>
                    <h2 className={styles.contentHeading}>{heading}</h2>
                    <div className={styles.contentBody}>
                      <MarkdownRenderer content={md} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
