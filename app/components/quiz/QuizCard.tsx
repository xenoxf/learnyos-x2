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
import { LikeButton } from "@/components/common/LikeButton";

interface QuizCardProps {
  quiz: ExamDeck & { canDelete?: boolean };
  onQuizDeleted?: () => void;
  isEspacio?: boolean;
  onShowOptions?: () => void;
}

const difficultyConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  very_easy: {
    label: "Muy Fácil",
    color: "cyan",
    icon: <Zap size={14} />,
  },
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
  very_hard: {
    label: "Muy Difícil",
    color: "violet",
    icon: <Zap size={14} />,
  },
  expert: {
    label: "Experto",
    color: "indigo",
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
            <LikeButton 
              id={quiz.id} 
              type="exam" 
              initialLikes={quiz.likesCount} 
              initialLiked={quiz.userLiked} 
              isOwner={isOwner}
            />

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
    </>
  );
}
