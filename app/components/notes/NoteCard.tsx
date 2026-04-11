"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, FileText, Tag, BookOpen, Heart, User } from "lucide-react";
import { apiService } from "@/services/apiService";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/notes/noteCard.module.css";
import type { NoteDeck } from "@/types";

interface NoteCardProps {
  note: NoteDeck & { canDelete?: boolean };
  onNoteDeleted?: () => void;
  isEspacio?: boolean;
  onShowOptions?: () => void;
}

export default function NoteCard({
  note,
  onNoteDeleted,
  isEspacio,
  onShowOptions,
}: NoteCardProps) {
  const router = useRouter();
  ;
  const [likesCount, setLikesCount] = useState(note.likesCount || 0);
  const [userLiked, setUserLiked] = useState(note.userLiked || false);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = note.canDelete ?? false;

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isOwner) {
      toast.error("No permitido", "Solo puedes eliminar tus propias notas");
      return;
    }
  }, [isOwner]);

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    try {
      setIsLiking(true);
      const result = await apiService.toggleNoteLike(note.id);
      setLikesCount(result.count);
      setUserLiked(result.liked);
    } catch {
      // Silent fail for likes
    } finally {
      setIsLiking(false);
    }
  }, [note.id, isLiking]);

  const handleCardClick = useCallback(() => {
    if (isEspacio && onShowOptions) {
      onShowOptions();
    } else {
      router.push(`/study/notes/${note.id}`);
    }
  }, [isEspacio, onShowOptions, router, note.id]);


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
        {isOwner && !isEspacio && (
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

      <p className={styles.cardDescription}>
        {note.description || "Sin descripción"}
      </p>

      <div className={styles.cardMeta}>
        {(note.area || note.tema) && (
          <div className={styles.metaItem}>
            {note.area && <><Tag size={14} />Área: {note.area}</>}
            {note.area && note.tema && <span style={{ margin: "0 4px" }}>·</span>}
            {note.tema && <><BookOpen size={14} />Tema: {note.tema}</>}
          </div>
        )}
        <div className={styles.metaItem}>
          <span className={styles.levelBadge}>{note.contentsCount} sección</span>
        </div>
      </div>

      <div className={styles.cardCreator}>
        <User size={12} />
        <span>{note.creatorName}</span>
      </div>

      <div className={styles.cardFooter}>
        {!isOwner && (
          <button
            className={`${styles.likeBtn} ${userLiked ? styles.likeBtnActive : ""}`}
            onClick={handleLike}
            disabled={isLiking}
            title="Me gusta"
            aria-label="Me gusta"
            type="button"
          >
            <Heart size={14} fill={userLiked ? "currentColor" : "none"} />
            <span>{likesCount}</span>
          </button>
        )}
        {isOwner && (
          <span className={styles.likesCount}>
            <Heart size={14} fill="currentColor" />
            <span>{likesCount}</span>
          </span>
        )}
        {isOwner && note.code && (
          <span className={styles.noteCode}>{note.code}</span>
        )}
      </div>
    </div>
  );
}
