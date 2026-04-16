"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Heart,
  User,
  BookOpen,
  ArrowRight,
  BookmarkPlus,
  BookmarkCheck,
  Layers,
} from "lucide-react";
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
import styles from "@/styles/quiz/quizCard.module.css"; // Reuse premium styles
import type { CardsDeck } from "@/types";
import { likesService } from "@/services/likesService";

interface CardProps {
  card: CardsDeck & { canDelete?: boolean };
  onCardDeleted?: () => void;
  onOpen: () => void;
  isEspacio?: boolean;
  onShowOptions?: () => void;
}

const CardContent: React.FC<CardProps> = ({
  card,
  onCardDeleted,
  onOpen,
  isEspacio,
  onShowOptions,
}) => {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(card.likesCount || 0);
  const [userLiked, setUserLiked] = useState(card.userLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [showGuestAlert, setShowGuestAlert] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOwner = card.canDelete ?? false;

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOwner) return;
    },
    [isOwner],
  );

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLiking) return;

      if (isGuestUser()) {
        setShowGuestAlert(true);
        return;
      }

      try {
        setIsLiking(true);
        const result = await likesService.toggleFlashcardLike(card.id);
        setLikesCount(result.count);
        setUserLiked(result.liked);
      } catch {
        // Silent fail
      } finally {
        setIsLiking(false);
      }
    },
    [card.id, isLiking],
  );

  const handleOpen = useCallback(() => {
    if (isEspacio && onShowOptions) {
      onShowOptions();
    } else {
      onOpen();
    }
  }, [isEspacio, onShowOptions, onOpen]);

  return (
    <>
      <div
        className={`${styles.card} ${styles["card--blue"]}`}
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
        <div className={`${styles.cardAccent} ${styles["accent--blue"]}`} />

        <div className={styles.cardHeader}>
          <div className={styles.typeRow}>
            <span className={`${styles.typeBadge} ${styles["typeBadge--blue"]}`}>
              <Layers size={15} />
              Mazo Flashcards
            </span>
          </div>

          <h3 className={styles.cardTitle}>{card.title}</h3>
        </div>

        {card.description && (
          <p className={styles.cardDescription}>
            {card.description}
          </p>
        )}

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <Layers size={15} />
            <span>{card.totalCards} <small>tarjetas</small></span>
          </div>
        </div>

        {(card.area || card.tema) && (
          <div className={styles.tagsRow}>
            {card.tema && (
              <span className={styles.tagItem}>
                <BookmarkCheck size={13} />
                {card.tema}
              </span>
            )}
            {card.area && (
              <span className={styles.tagItem}>
                <BookmarkPlus size={13} />
                {card.area}
              </span>
            )}
          </div>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.cardCreator}>
              <User size={13} />
              {card.creatorName}
            </span>
          </div>

          <div className={styles.footerRight}>
            {!isOwner && (
              <button
                className={`${styles.likeBtn} ${userLiked ? styles.likeBtnActive : ""}`}
                onClick={handleLike}
                disabled={isLiking}
                type="button"
              >
                <Heart
                  size={15}
                  fill={userLiked ? "currentColor" : "none"}
                  className={isLiking ? styles.likeAnimating : ""}
                />
                {likesCount > 0 && <span>{likesCount}</span>}
              </button>
            )}
            {isOwner && (
              <span className={styles.likesCount}>
                <Heart size={14} fill="currentColor" />
                {likesCount}
              </span>
            )}

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

      <AlertDialog open={showGuestAlert} onOpenChange={setShowGuestAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inicia sesión para dar Me gusta</AlertDialogTitle>
            <AlertDialogDescription>
              Los usuarios invitados no pueden dar Me gusta.
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
};

export default React.memo(CardContent);
