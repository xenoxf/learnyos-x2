"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  FileText,
  User,
  BookOpen,
  ArrowRight,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";

import styles from "@/styles/quiz/quizCard.module.css"; // Reuse premium styles
import type { NoteDeck } from "@/types";
import { LikeButton } from "@/components/common/LikeButton";

interface NoteCardProps {
  note: NoteDeck & { canDelete?: boolean };
  onNoteDeleted?: () => void;
  isEspacio?: boolean;
  onShowOptions?: () => void;
}

export default function NoteCard({
  note,
  isEspacio,
  onShowOptions,
}: NoteCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const isOwner = note.canDelete ?? false;

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOwner) return;
      // Handle delete logic via parent if needed
    },
    [isOwner],
  );

  const handleOpen = useCallback(() => {
    if (isEspacio && onShowOptions) {
      onShowOptions();
    } else {
      router.push(`/study/notes/${note.id}`);
    }
  }, [isEspacio, onShowOptions, router, note.id]);

  return (
    <>
      <div
        className={`${styles.card} ${styles["card--emerald"]}`}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`${styles.cardAccent} ${styles["accent--emerald"]}`} />

        <div className={styles.cardHeader}>
          <div className={styles.typeRow}>
            <span className={`${styles.typeBadge} ${styles["typeBadge--emerald"]}`}>
              <FileText size={15} />
              Nota
            </span>
          </div>

          <h3 className={styles.cardTitle}>{note.title}</h3>
        </div>

        {note.description && (
          <p className={styles.cardDescription}>
            {note.description}
          </p>
        )}

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <BookOpen size={15} />
            <span>{note.contentsCount} <small>secciones</small></span>
          </div>
        </div>

        {(note.tema || note.area) && (
          <div className={styles.tagsRow}>
            {note.tema && (
              <span className={styles.tagItem}>
                <BookmarkCheck size={13} />
                {note.tema}
              </span>
            )}
            {note.area && (
              <span className={styles.tagItem}>
                <BookmarkPlus size={13} />
                {note.area}
              </span>
            )}
          </div>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.cardCreator}>
              <User size={13} />
              {note.creatorName}
            </span>
          </div>

          <div className={styles.footerRight}>
            <LikeButton 
              id={note.id} 
              type="note" 
              initialLikes={note.likesCount} 
              initialLiked={note.userLiked} 
              isOwner={isOwner}
            />

            <div className={`${styles.ctaArrow} ${isHovered ? styles.ctaArrowVisible : ""}`}>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {isOwner && !isEspacio && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </>
  );
}
