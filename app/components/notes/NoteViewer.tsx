"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "@/styles/notes/noteViewer.module.css";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import type { NoteKlek } from "@/types";
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
  const [note, setNote] = useState<NoteKlek | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

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

  const toggleSection = useCallback((index: number) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const sections = useMemo(() => {
    if (!note?.noteContents?.length) return [];
    return [...note.noteContents].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }, [note]);

  // Expand first 2 sections by default
  useEffect(() => {
    const initialExpanded: Record<number, boolean> = {};
    sections.forEach((_, index) => {
      initialExpanded[index] = index < 2;
    });
    setExpandedSections(initialExpanded);
  }, [sections]);

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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="note-title">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 id="note-title" className={styles.title}>{note.title}</h2>
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
              <FileText size={48} className={styles.emptyIcon} aria-hidden="true" />
              <p>No hay contenido en esta nota</p>
            </div>
          ) : (
            <div className={styles.contentList}>
              {sections.map((content, index) => {
                const isExpanded = expandedSections[index] ?? index < 2;
                const heading = noteSectionHeading(
                  content.tema,
                  content.title,
                  content.order ?? index,
                );
                const md = normalizeNoteContentBody(content.content);

                return (
                  <article key={content.id} className={styles.contentItem}>


                    <div
                      id={`content-${content.id}`}
                      className={`${styles.contentBody} ${styles.contentBodyExpanded}`}
                      role="region"
                    >
                      <div className={styles.contentMd}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {md}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerInfo}>
            {sections.length} secci{sections.length !== 1 ? 'ones' : 'ón'}
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
