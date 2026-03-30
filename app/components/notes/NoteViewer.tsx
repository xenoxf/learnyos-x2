"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "@/styles/notes/noteViewer.module.css";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import type { Note } from "@/types";
import {
  normalizeNoteContentBody,
  noteSectionHeading,
} from "@/lib/noteContent";

interface NoteViewerProps {
  noteId: number;
  onClose: () => void;
}

export default function NoteViewer({ noteId, onClose }: NoteViewerProps) {
  const { toast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedContent, setExpandedContent] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;
    const loadNote = async () => {
      try {
        setLoading(true);
        const data = await apiService.getNote(noteId);
        if (!cancelled) setNote(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al cargar nota";
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadNote();
    return () => {
      cancelled = true;
    };
  }, [noteId, onClose, toast]);

  const toggleContent = useCallback((key: string) => {
    setExpandedContent((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const sections = useMemo(() => {
    if (!note?.noteContents?.length) return [];
    return [...note.noteContents].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }, [note]);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    sections.forEach((c, i) => {
      next[`${c.id}-${i}`] = i < 2;
    });
    setExpandedContent(next);
  }, [noteId, sections]);

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loadingContent}>
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>{note.title}</h2>
            {note.description ? (
              <p className={styles.description}>{note.description}</p>
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
              <p>No hay contenido en esta nota</p>
            </div>
          ) : (
            <div className={styles.contentList}>
              {sections.map((content, index) => {
                const key = `${content.id}-${index}`;
                const open = expandedContent[key] ?? index < 2;
                const heading = noteSectionHeading(
                  content.tema,
                  content.title,
                  content.order ?? index,
                );
                const md = normalizeNoteContentBody(content.content);

                return (
                  <div key={key} className={styles.contentItem}>
                    <div className={styles.contentBody}>
                      <div className={styles.contentMd}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {md}
                        </ReactMarkdown>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.levelInfo}>
            Nivel: {note.levelOfDetail || "breve"}
            {note.code ? ` · Código ${note.code}` : ""}
          </span>
          <button
            className={styles.closeFooterBtn}
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
