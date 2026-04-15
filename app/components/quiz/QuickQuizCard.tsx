"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Brain, Clock, Heart, User } from "lucide-react";
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
import styles from "@/styles/quiz/quickQuizCard.module.css";
import type { QuickQuizDeck } from "@/types";
import { likesService } from "@/services/likesService";

interface QuickQuizCardProps {
  quiz: QuickQuizDeck & { canDelete?: boolean };
  onQuizDeleted?: () => void;
  isEspacio?: boolean;
  onShowOptions?: () => void;
}

export default function QuickQuizCard({
  quiz,
  onQuizDeleted,
  isEspacio,
  onShowOptions,
}: QuickQuizCardProps) {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(quiz.likesCount || 0);
  const [userLiked, setUserLiked] = useState(quiz.userLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  const isOwner = quiz.canDelete ?? false;

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOwner) {
        toast.error("No permitido", "Solo puedes eliminar tus propios quizzes");
        return;
      }
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
        const result = await likesService.toggleExamLike(quiz.id);
        setLikesCount(result.count);
        setUserLiked(result.liked);
      } catch {
        // Silent fail
      } finally {
        setIsLiking(false);
      }
    },
    [quiz.id, isLiking],
  );

  const handleOpen = useCallback(() => {
    if (isEspacio && onShowOptions) {
      onShowOptions();
    } else {
      router.push(`/study/quick-quiz/${quiz.id}`);
    }
  }, [isEspacio, onShowOptions, router, quiz.id]);

  return (
    <>
      <AlertDialog open={showGuestAlert} onOpenChange={setShowGuestAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acceso restringido</AlertDialogTitle>
            <AlertDialogDescription>
              Debes iniciar sesión para dar like.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className={styles.card} onClick={handleOpen} role="button" tabIndex={0}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <Brain size={18} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>{quiz.title}</h3>
          </div>
          <div className={styles.cardHeaderRight}>
            {isOwner && (
              <button
                className={styles.deleteBtn}
                title="Eliminar"
                aria-label="Eliminar"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <p className={styles.cardDescription}>
          {quiz.description || "Sin descripción"}
        </p>

        <div className={styles.cardMeta}>
          {quiz.area && (
            <span className={styles.badge}>Área: {quiz.area}</span>
          )}
          {quiz.tema && (
            <span className={styles.badge}>Tema: {quiz.tema}</span>
          )}
          {quiz.totalQuestions && (
            <span className={styles.badge}>
              <Clock size={12} />
              {quiz.totalQuestions} preguntas
            </span>
          )}
          {quiz.difficulty && (
            <span className={`${styles.badge} ${styles.diffBadge}`}>
              {quiz.difficulty}
            </span>
          )}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.cardFooterLeft}>
            <User size={14} />
            <span>{quiz.creatorName || "Anónimo"}</span>
          </div>
          <div className={styles.cardFooterRight}>
            <button
              className={`${styles.likeBtn} ${userLiked ? styles.liked : ""}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart size={14} fill={userLiked ? "currentColor" : "none"} />
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
