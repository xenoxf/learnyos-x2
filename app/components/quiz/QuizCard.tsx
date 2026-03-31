import React from "react";
import { useRouter } from "next/navigation";
import { Trash2, HelpCircle, Clock, Tag } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/quiz/quizCard.module.css";
import type { ExamDeck } from "@/types";

interface QuizCardProps {
  quiz: ExamDeck & { canDelete?: boolean };
  onQuizDeleted?: () => void;
}

export default function QuizCard({
  quiz,
  onQuizDeleted,
}: QuizCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isOwner = quiz.canDelete ?? false;

  const handleDelete = async () => {
    if (!isOwner) {
      toast({
        variant: "destructive",
        title: "No permitido",
        description: "Solo puedes eliminar tus propios quizzes",
      });
      return;
    }

    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar este quiz?",
    );
    if (confirm) {
      try {
        await apiService.deleteExam(quiz.id);
        toast({
          title: "Éxito",
          description: "Quiz eliminado correctamente",
        });
        if (onQuizDeleted) {
          onQuizDeleted();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al eliminar quiz";
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      }
    }
  };

  const handleOpen = () => {
    router.push(`/study/quiz/${quiz.id}`);
  };

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
        {isOwner && (
          <button
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
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
            <span>{quiz.area}</span>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardHint}>
          {quiz.estimatedTime || "Sin límite de tiempo"}
        </span>
        {/* Solo mostrar el code si es el dueño */}
        {isOwner && quiz.code ? (
          <span className={styles.cardCode}>{quiz.code}</span>
        ) : null}
      </div>
    </div>
  );
}
