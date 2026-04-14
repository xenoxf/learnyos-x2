"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, HelpCircle, Clock, Tag, Heart, User } from "lucide-react";
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
import styles from "@/styles/quiz/quizCard.module.css";
import type { ExamDeck } from "@/types";
import { likesService } from "@/services/likesService";

interface QuizCardProps {
  quiz: ExamDeck & { canDelete?: boolean };
  onQuizDeleted?: () => void;
  isEspacio?: boolean;
  onShowOptions?: () => void;
}

export default function QuizCard({
  quiz,
  onQuizDeleted,
  isEspacio,
  onShowOptions,
}: QuizCardProps) {
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

      // Check if guest
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
        // Silent fail for likes
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
      router.push(`/study/quiz/${quiz.id}`);
    }
  }, [isEspacio, onShowOptions, router, quiz.id]);

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
          <h3 className={styles.cardTitle}>{quiz.title}</h3>
          {isOwner && !isEspacio && (
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              title="Eliminar quiz"
              aria-label="Eliminar quiz"
              type="button"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <p className={styles.cardDescription}>
          {quiz.description || "Sin descripción"}
        </p>

        <div className={styles.cardMeta}>
          <div className={styles.metaItem}>
            <HelpCircle size={16} />
            <span>{quiz.totalQuestions} preguntas</span>
          </div>
          <div className={styles.metaItem}>
            <Clock size={16} />
            <span className={styles.difficultyBadge}>{quiz.difficulty}</span>
          </div>
          {quiz.area && (
            <div className={styles.metaItem}>
              <Tag size={16} />
              <span>Área: {quiz.area}</span>
            </div>
          )}
        </div>

        <div className={styles.cardCreator}>
          <User size={12} />
          <span>{quiz.creatorName}</span>
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
          {isOwner && quiz.code && (
            <span className={styles.cardCode}>{quiz.code}</span>
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
