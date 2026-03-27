import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import styles from "@/styles/quiz/createQuizModal.module.css";
import type { GenerateExamData } from "@/types";

interface CreateQuizModalProps {
  onClose: () => void;
  onQuizCreated: () => void;
}

export default function CreateQuizModal({
  onClose,
  onQuizCreated,
}: CreateQuizModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GenerateExamData>({
    numberOfQuestions: 10,
    difficulty: "medium",
    acceso: "private",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic && !formData.reference) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes proporcionar un tema o una referencia",
      });
      return;
    }

    try {
      setLoading(true);
      await apiService.generateExam(formData);
      toast({
        title: "Éxito",
        description: "Quiz creado correctamente",
      });
      onQuizCreated();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear quiz";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Crear Quiz</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tema</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej: Historia de España"
              value={formData.topic || ""}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Referencia (opcional)</label>
            <textarea
              className={styles.textarea}
              placeholder="Pega aquí tu texto de referencia"
              value={formData.reference || ""}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Número de preguntas</label>
              <input
                type="number"
                className={styles.input}
                min="5"
                max="50"
                value={formData.numberOfQuestions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfQuestions: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Dificultad</label>
              <select
                className={styles.select}
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
              >
                <option value="easy">Fácil</option>
                <option value="medium">Medio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Privacidad</label>
              <select
                className={styles.select}
                value={formData.acceso || "private"}
                onChange={(e) =>
                  setFormData({ ...formData, acceso: e.target.value })
                }
              >
                <option value="private">Privado</option>
                <option value="public">Publico</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}