"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "@/styles/notes/noteViewer.module.css";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import type { Note } from "@/types";

interface NoteViewerProps {
  noteId: number;
  onClose: () => void;
}

export default function NoteViewer({
  noteId,
  onClose,
}: NoteViewerProps) {
  const { toast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedContent, setExpandedContent] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        const data = await apiService.getNote(noteId);
        setNote(data);
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
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId, onClose, toast]);

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

  const contents = note.noteContents || [];

  const toggleContent = (id: number) => {
    setExpandedContent((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>{note.title}</h2>
            {note.description && (
              <p className={styles.description}>{note.description}</p>
            )}
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
          {contents.length === 0 ? (
            <div className={styles.emptyContent}>
              <p>No hay contenido en esta nota</p>
            </div>
          ) : (
            <div className={styles.contentList}>
              {contents
                .sort((a, b) => a.order - b.order)
                .map((content) => (
                  <div key={content.id} className={styles.contentItem}>
                    <button
                      className={styles.contentHeader}
                      onClick={() => toggleContent(content.id)}
                      type="button"
                    >
                      <span className={styles.contentTitle}>
                        {content.title || `Sección ${content.order}`}
                      </span>
                      {expandedContent[content.id] ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>

                    {expandedContent[content.id] && (
                      <div className={styles.contentBody}>
                        <p className={styles.contentText}>
                          {content.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.levelInfo}>
            Nivel: {note.levelOfDetail || "breve"}
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