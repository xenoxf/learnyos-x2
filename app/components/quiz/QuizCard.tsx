"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, HelpCircle, Clock, Tag, Heart, User } from "lucide-react";
import { apiService } from "@/services/apiService";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/quiz/quizCard.module.css";
import type { ExamDeck } from "@/types";

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
  ;
  const [likesCount, setLikesCount] = useState(quiz.likesCount || 0);
  const [userLiked, setUserLiked] = useState(quiz.userLiked || false);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = quiz.canDelete ?? false;

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOwner) {
      toast.error("No permitido", "Solo puedes eliminar tus propios quizzes");
      return;
    }
  }, [isOwner]);

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    try {
      setIsLiking(true);
      const result = await apiService.toggleExamLike(quiz.id);
      setLikesCount(result.count);
      setUserLiked(result.liked);
    } catch {
      // Silent fail for likes
    } finally {
      setIsLiking(false);
    }
  }, [quiz.id, isLiking]);

  const handleOpen = useCallback(() => {
    if (isEspacio && onShowOptions) {
      onShowOptions();
    } else {
      router.push(`/study/quiz/${quiz.id}`);
    }
  }, [isEspacio, onShowOptions, router, quiz.id]);

  return (
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
  );
}
