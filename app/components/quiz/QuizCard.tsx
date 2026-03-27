import React from "react";
import { Trash2, HelpCircle, Clock } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/quiz/quizCard.module.css";
import type { Exam } from "@/types";

interface QuizCardProps {
  quiz: Exam & { canDelete?: boolean };
  onQuizDeleted?: () => void;
  onQuizOpen?: (quizId: number) => void;
}

export default function QuizCard({
  quiz,
  onQuizDeleted,
  onQuizOpen,
}: QuizCardProps) {
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
      "¿Estás seguro de que deseas eliminar este quiz?"
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

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={() => onQuizOpen?.(quiz.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onQuizOpen?.(quiz.id);
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
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <p className={styles.cardDescription}>{quiz.description}</p>

      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          <HelpCircle size={16} />
          <span>{quiz.totalQuestions || 0} preguntas</span>
        </div>
        <div className={styles.metaItem}>
          <Clock size={16} />
          <span>{quiz.difficulty}</span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardHint}>Abrir quiz</span>
        {"code" in quiz && typeof (quiz as any).code === "string" ? (
          <span className={styles.cardCode}>{String((quiz as any).code)}</span>
        ) : null}
      </div>
    </div>
  );
}