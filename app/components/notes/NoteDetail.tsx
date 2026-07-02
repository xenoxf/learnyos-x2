"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "@/styles/notes/noteDetail.module.css";
import { toast } from "@/hooks/useLocalToast";
import type { NoteKlek } from "@/types";
import {
  normalizeNoteContentBody,
} from "@/lib/noteContent";
import { notesService } from "@/services/notesService";

interface NoteDetailProps {
  noteId: number;
  onBack: () => void;
}

export default function NoteDetail({ noteId, onBack }: NoteDetailProps) {
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
        onBack();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadNote();
    return () => {
      cancelled = true;
    };
  }, [noteId, onBack]);

  const sections = useMemo(() => {
    if (!note?.noteContents?.length) return [];
    return [...note.noteContents].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }, [note]);

  if (loading) {
    return (
      <div className={styles.noteDetailContainer}>
        <div className={styles.loadingDetail}>
          <div className={styles.loadingDetailSpinner} aria-hidden="true" />
          <p>Cargando nota...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className={styles.noteDetailContainer}>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderLeft}>
          <h2 className={styles.detailTitle}>{note.title}</h2>
          {note.description ? (
            <p className={styles.detailDescription}>{note.description}</p>
          ) : null}
        </div>
        <button
          className={styles.backBtn}
          onClick={onBack}
          type="button"
          aria-label="Volver a la lista de notas"
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
      </header>

      <div className={styles.detailContentContainer}>
        {sections.length === 0 ? (
          <div className={styles.emptyDetail}>
            <FileText
              size={48}
              className={styles.emptyDetailIcon}
              aria-hidden="true"
            />
            <p>No hay contenido en esta nota</p>
          </div>
        ) : (
          <div className={styles.detailContentList}>
            {sections.map((content, _index) => {
              const md = normalizeNoteContentBody(content.content);

              return (
                <article key={content.id} className={styles.detailContentItem}>
                  <div className={styles.detailContentBody}>
                    <div className={styles.detailContentMd}>
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
    </div>
  );
}
