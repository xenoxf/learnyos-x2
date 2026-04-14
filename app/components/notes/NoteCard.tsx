"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, FileText, Tag, BookOpen, Heart, User } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { isGuestUser } from "@/lib/auth-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import styles from "@/styles/notes/noteCard.module.css";
import type { NoteDeck } from "@/types";
import { likesService } from "@/services/likesService";

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
  const [likesCount, setLikesCount] = useState(note.likesCount || 0);
  const [userLiked, setUserLiked] = useState(note.userLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  const isOwner = note.canDelete ?? false;

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!isOwner) {
        toast.error("No permitido", "Solo puedes eliminar tus propias notas");
        return;
      }
    },
    [isOwner],
  );

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLiking) return;

      // Check if guest
      if (isGuestUser()) {
        setShowGuestAlert(true);
        return;
      }

      try {
        setIsLiking(true);
        const result = await likesService.toggleNoteLike(note.id);
        setLikesCount(result.count);
        setUserLiked(result.liked);
      } catch {
        // Silent fail for likes
      } finally {
        setIsLiking(false);
      }
    },
    [note.id, isLiking],
  );

  const handleCardClick = useCallback(() => {
    if (isEspacio && onShowOptions) {
      onShowOptions();
    } else {
      router.push(`/study/notes/${note.id}`);
    }
  }, [isEspacio, onShowOptions, router, note.id]);

  return (
    <>
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
              {note.area && (
                <div className={styles.item} >
                  <Tag size={14} />
                  Área: {note.area}
                </div>
              )}
              {note.tema && (
                <div className={styles.item}>
                  <BookOpen size={14} />
                  Tema: {note.tema}
                </div>
              )}
            </div>
          )}
          <div className={styles.metaItem}>
            <span className={styles.levelBadge}>
              {note.contentsCount} sección
            </span>
          </div>
        </div>



        <div className={styles.cardFooter}>
          <div className={styles.cardCreator}>
            <User size={12} />
            <span>{note.creatorName}</span>
          </div>
          {!isOwner && (
            <button
              className={`${styles.likeBtn} ${userLiked ? styles.likeBtnActive : ""}`}
              onClick={handleLike}
              disabled={isLiking}
              title="Me gusta"
              aria-label="Me gusta"
              type="button"
            >
              <Heart className={styles.likeIcon} fill={userLiked ? "currentColor" : "none"} />
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

      {/* Guest alert dialog */}
      <AlertDialog open={showGuestAlert} onOpenChange={setShowGuestAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inicia sesión para dar Me gusta</AlertDialogTitle>
            <AlertDialogDescription>
              Los usuarios invitados no pueden dar Me gusta. Inicia sesión o
              crea una cuenta gratis para acceder a esta función.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/auth")}>
              Ir a Iniciar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
