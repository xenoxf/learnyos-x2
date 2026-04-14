"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Tag, BookOpen, Heart, User } from "lucide-react";
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
import styles from "@/styles/flashCards/card.module.css";
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

  const isOwner = card.canDelete ?? false;

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOwner) {
        toast.error("No permitido", "Solo puedes eliminar tus propios mazos");
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
        const result = await likesService.toggleFlashcardLike(card.id);
        setLikesCount(result.count);
        setUserLiked(result.liked);
      } catch {
        // Silent fail for likes
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
        className={styles.card}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
      >
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{card.title}</h3>
          {isOwner && !isEspacio && (
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              title="Eliminar mazo"
              aria-label="Eliminar mazo"
              type="button"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <p className={styles.cardDescription}>
          {card.description || "Sin descripción"}
        </p>

        <div className={styles.cardMeta}>
          {(card.area || card.tema) && (
            <span className={styles.cardHint}>
              {card.area && (
                <>
                  <Tag
                    size={14}
                    style={{ marginRight: "3px", verticalAlign: "middle" }}
                  />
                  Área: {card.area}
                </>
              )}
              {card.area && card.tema && <br />}
              {card.tema && (
                <>
                  <BookOpen
                    size={14}
                    style={{ marginRight: "3px", verticalAlign: "middle" }}
                  />
                  Tema: {card.tema}
                </>
              )}
            </span>
          )}
          <span className={styles.cardHint}>{card.totalCards} tarjetas</span>
        </div>

        <div className={styles.cardCreator}>
          <User size={12} />
          <span>{card.creatorName}</span>
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
            <span className={styles.cardLikesCount}>
              <Heart size={14} fill="currentColor" />
              <span>{likesCount}</span>
            </span>
          )}
          {isOwner && card.code && (
            <span className={styles.cardCode}>{card.code}</span>
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
};

export default React.memo(CardContent);
