"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FileText } from "lucide-react";
import MarkdownRenderer from "../MarkdownRenderer";
import styles from "@/styles/notes/noteViewer.module.css";
import { toast } from "@/hooks/useLocalToast";
import type { NoteKlek } from "@/types";
import {
  normalizeNoteContentBody,
} from "@/lib/noteContent";
import { notesService } from "@/services/notesService";

interface NoteViewerProps {
  noteId: number;
  onClose: () => void;
}

export default function NoteViewer({ noteId, onClose }: NoteViewerProps) {
  const [note, setNote] = useState<NoteKlek | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let cancelled = false;
    const loadNote = async () => {
      try {
        setLoading(true);
        const data = await notesService.getNote(noteId);
        if (!cancelled) setNote(data);
      } catch (err) {
        toast.info("");
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadNote();
    return () => {
      cancelled = true;
    };
  }, [noteId, onClose]);

  const sections = useMemo(() => {
    if (!note?.noteContents?.length) return [];
    return [...note.noteContents].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }, [note]);



  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner} aria-hidden="true" />
            <p>Cargando nota...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-title"
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div id="note-title" className={styles.title}>
              <MarkdownRenderer content={note.title} />
            </div>
            {note.description ? (
              <div className={styles.description}>
                <MarkdownRenderer content={note.description} />
              </div>
            ) : null}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className={styles.contentContainer}>
          {sections.length === 0 ? (
            <div className={styles.emptyContent}>
              <FileText
                size={48}
                className={styles.emptyIcon}
                aria-hidden="true"
              />
              <p>No hay contenido en esta nota</p>
            </div>
          ) : (
            <div className={styles.contentList}>
              {sections.map((content, _index) => {
                const md = normalizeNoteContentBody(content.content);

                return (
                  <article key={content.id} className={styles.contentItem}>
                    <div
                      id={`content-${content.id}`}
                      className={`${styles.contentBody} ${styles.contentBodyExpanded}`}
                      role="region"
                    >
                      <div className={styles.contentMd}>
                        <MarkdownRenderer content={md} />
                      </div>
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
