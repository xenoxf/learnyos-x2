import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/quiz/createQuickQuizModal.module.css";
import type { GenerateExamData } from "@/types";
import { useRouter } from "next/navigation";
import { creditsService } from "@/services/creditsService";
import { quizzesService } from "@/services/quizzesService";

interface CreateQuickQuizModalProps {
  onClose: () => void;
  onQuizCreated: () => void;
}

export default function CreateQuickQuizModal({
  onClose,
  onQuizCreated,
}: CreateQuickQuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [creditsStatus, setCreditsStatus] = useState<{ remaining: number; total: number } | null>(null);
  const [formData, setFormData] = useState<GenerateQuickQuizData>({
    topic: "",
    numberOfQuestions: 10,
    difficulty: "medium",
    acceso: "private",
  });
  const router = useRouter();

  useEffect(() => {
    creditsService.getStatus().then((s) => setCreditsStatus({ remaining: s.remaining, total: s.total })).catch(() => {});
  }, []);

  const estimatedCost = 2; // Quick quiz fixed cost
  const canAfford = creditsStatus ? creditsStatus.remaining >= estimatedCost : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic || formData.topic.length < 3) {
      toast.error("Error", "Debes proporcionar un texto con más de 3 caracteres");
      return;
    }

    try {
      setLoading(true);
      const result = await quickQuizzesService.generateQuickQuiz(formData);
      toast.success("Éxito", "Quiz rápido creado correctamente");
      onQuizCreated();
      router.refresh();
      onClose();
      router.push(`/study/quick-quiz/${result.quizId}`);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Error al crear quiz rápido";
      toast.error("Error", message, 6000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Crear Quiz Rápido</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tema o referencia</label>
            <textarea
              className={styles.textarea}
              placeholder="¿Sobre qué quieres el quiz?"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Preguntas</label>
              <input
                type="number"
                className={styles.input}
                min="5"
                max="20"
                value={formData.numberOfQuestions}
                onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Dificultad</label>
              <select
                className={styles.select}
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="very_easy">Muy Fácil</option>
                <option value="easy">Fácil</option>
                <option value="medium">Medio</option>
                <option value="hard">Difícil</option>
                <option value="very_hard">Muy Difícil</option>
                <option value="expert">Experto</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Privacidad</label>
              <select
                className={styles.select}
                value={formData.acceso || "private"}
                onChange={(e) => setFormData({ ...formData, acceso: e.target.value })}
              >
                <option value="private">Privado</option>
                <option value="public">Público</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading || !canAfford}>
              {loading ? "Creando..." : "Crear Quiz Rápido"}
            </button>
          </div>
        </form>

        {creditsStatus && (
          <div className={styles.creditPreview}>
            <span>Costo: ~{estimatedCost} créditos</span>
            <span>•</span>
            <span>Tus créditos: {creditsStatus.remaining}/{creditsStatus.total}</span>
            {!canAfford && <span className={styles.creditWarning}>Créditos insuficientes</span>}
          </div>
        )}
      </div>
    </div>
  );
}
