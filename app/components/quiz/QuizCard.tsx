"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  HelpCircle,
  Heart,
  User,
  BookOpen,
  ScrollText,
  Target,
  Zap,
  ArrowRight,
  BookmarkPlus,
  BookmarkCheck,
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
import styles from "@/styles/quiz/quizCard.module.css";
import type { ExamDeck } from "@/types";
import { likesService } from "@/services/likesService";

interface QuizCardProps {
  quiz: ExamDeck & { canDelete?: boolean };
  onQuizDeleted?: () => void;
  isEspacio?: boolean;
  onShowOptions?: () => void;
}

const difficultyConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  easy: {
    label: "Fácil",
    color: "emerald",
    icon: <Zap size={14} />,
  },
  medium: {
    label: "Medio",
    color: "amber",
    icon: <Zap size={14} />,
  },
  hard: {
    label: "Difícil",
    color: "rose",
    icon: <Zap size={14} />,
  },
};

const typeConfig = {
  quiz: { label: "Quiz", icon: <BookOpen size={15} />, color: "violet" },
  icfes: { label: "ICFES", icon: <ScrollText size={15} />, color: "blue" },
};

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
  const [isHovered, setIsHovered] = useState(false);

  const isOwner = quiz.canDelete ?? false;
  const diff = difficultyConfig[quiz.difficulty || "easy"] || difficultyConfig.easy;
  const typeInfo = typeConfig[quiz.type as keyof typeof typeConfig] || typeConfig.quiz;
  const estimatedMinutes = Math.max(5, Math.ceil(quiz.totalQuestions * 1.5));

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
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
        className={`${styles.card} ${styles[`card--${typeInfo.color}`]}`}
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
        {/* Accent bar */}
        <div className={`${styles.cardAccent} ${styles[`accent--${typeInfo.color}`]}`} />

        {/* Header: Type badge + Title */}
        <div className={styles.cardHeader}>
          <div className={styles.typeRow}>
            <span className={`${styles.typeBadge} ${styles[`typeBadge--${typeInfo.color}`]}`}>
              {typeInfo.icon}
              {typeInfo.label}
            </span>
            <span className={`${styles.difficultyBadge} ${styles[`diff--${diff.color}`]}`}>
              {diff.icon}
              {diff.label}
            </span>
          </div>

          <h3 className={styles.cardTitle}>{quiz.title}</h3>
        </div>

        {/* Description */}
        {quiz.description && (
          <p className={styles.cardDescription}>
            {quiz.description}
          </p>
        )}

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <HelpCircle size={15} />
            <span>{quiz.totalQuestions} <small>preguntas</small></span>
          </div>
          <div className={styles.statItem}>
            <Target size={15} />
            <span>~{estimatedMinutes} <small>min</small></span>
          </div>
        </div>

        {/* Tags: Tema + Área */}
        {(quiz.tema || quiz.area) && (
          <div className={styles.tagsRow}>
            {quiz.tema && (
              <span className={styles.tagItem}>
                <BookmarkCheck size={13} />
                {quiz.tema}
              </span>
            )}
            {quiz.area && (
              <span className={styles.tagItem}>
                <BookmarkPlus size={13} />
                {quiz.area}
              </span>
            )}
          </div>
        )}

        {/* Footer: Creator + Like + CTA */}
        <div className={styles.cardFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.cardCreator}>
              <User size={13} />
              {quiz.creatorName}
            </span>
          </div>

          <div className={styles.footerRight}>
            {!isOwner && (
              <button
                className={`${styles.likeBtn} ${userLiked ? styles.likeBtnActive : ""}`}
                onClick={handleLike}
                disabled={isLiking}
                title="Me gusta"
                aria-label="Me gusta"
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

            {/* CTA Arrow - appears on hover */}
            <div className={`${styles.ctaArrow} ${isHovered ? styles.ctaArrowVisible : ""}`}>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* Delete button (top-right, only for owner) */}
        {isOwner && !isEspacio && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            title="Eliminar quiz"
            aria-label="Eliminar quiz"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        )}
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
