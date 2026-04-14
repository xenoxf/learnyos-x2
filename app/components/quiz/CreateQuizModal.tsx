import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/quiz/createQuizModal.module.css";
import type { GenerateExamData, ApiErrorResponse } from "@/types";
import { useRouter } from "next/navigation";
import { creditsService } from "@/services/creditsService";
import { quizzesService } from "@/services/quizzesService";

interface CreateQuizModalProps {
  onClose: () => void;
  onQuizCreated: () => void;
}

export default function CreateQuizModal({
  onClose,
  onQuizCreated,
}: CreateQuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [creditsStatus, setCreditsStatus] = useState<{
    remaining: number;
    total: number;
  } | null>(null);
  const [formData, setFormData] = useState<GenerateExamData>({
    reference: "",
    numberOfQuestions: 10,
    difficulty: "medium",
    acceso: "private",
  });
  const router = useRouter();

  useEffect(() => {
    creditsService
      .getStatus()
      .then((status) => {
        setCreditsStatus({ remaining: status.remaining, total: status.total });
      })
      .catch(() => {});
  }, []);

  const estimatedCost = creditsService.estimateExamCost(
    formData.numberOfQuestions,
    formData.difficulty,
    formData.reference || "",
  );
  const canAfford = creditsStatus
    ? creditsStatus.remaining >= estimatedCost
    : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reference || formData.reference.length < 3) {
      toast.error(
        "Error",
        "Debes proporcionar un texto con más de 3 caracteres",
      );
      return;
    }

    try {
      setLoading(true);
      await quizzesService.generateExam(formData);
      toast.success("Éxito", "Quiz creado correctamente");
      onQuizCreated();
      router.refresh();
      onClose();
    } catch (err: any) {
      let message = "Error al crear quiz";
      let details = "";
      let errorCode = "";
      let rawResponse = null;

      // Manejar errores con estructura del backend
      if (err?.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        message = errorData.message || message;
        details = errorData.details || "";
        errorCode = errorData.errorCode || "";
        rawResponse = errorData.rawResponse;
      } else if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }

      // Construir descripción detallada del error
      let errorDescription = details || message;

      // Agregar información de la respuesta raw si está disponible
      if (rawResponse) {
        console.error("Raw response from AI:", rawResponse);

        // Mostrar información útil según el código de error
        if (errorCode === "INVALID_AI_RESPONSE") {
          errorDescription = `${details} La IA devolvo una respuesta con formato inesperado.`;
        } else if (errorCode === "NO_QUESTIONS_GENERATED") {
          errorDescription = `${details} Intenta con un tema más específico o diferente.`;
        } else if (errorCode === "MISSING_METADATA") {
          errorDescription = `${details} La IA generó preguntas pero sin título o descripción del quiz.`;
        } else if (errorCode === "INCOMPLETE_METADATA") {
          errorDescription = `${details} Campos faltantes detectados.`;
        } else if (errorCode === "INVALID_QUESTION_FORMAT") {
          errorDescription = `${details} Las preguntas generadas no tienen el formato correcto.`;
        }
      }

      // Mejorar mensajes de error específicos (fallback para errores antiguos)
      if (message.includes("metadata") && !details) {
        errorDescription =
          "La IA no pudo generar el quiz correctamente. Por favor, intenta con otro tema o referencia.";
      } else if (message.includes("questions") && !details) {
        errorDescription =
          "No se pudieron generar las preguntas. Intenta nuevamente con una referencia más específica.";
      }

      toast.error("Error al crear quiz", errorDescription, 8000);
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
            <label className={styles.label}>Referencia</label>
            <textarea
              className={styles.textarea}
              placeholder="¿Que quieres?"
              value={formData.reference}
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
                <option value="easy">Fácil </option>
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
                <option title="Solo tu podras usarlo" value="private">
                  Privado
                </option>
                <option
                  title="La comunidad tambien podra usarlo"
                  value="public"
                >
                  Publico
                </option>
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
              disabled={loading || !canAfford}
            >
              {loading ? "Creando..." : "Crear Quiz"}
            </button>
          </div>
        </form>

        {creditsStatus && (
          <div className={styles.creditPreview}>
            <span>Costo: ~{estimatedCost} créditos</span>
            <span>•</span>
            <span>
              Tus créditos: {creditsStatus.remaining}/{creditsStatus.total}
            </span>
            {!canAfford && (
              <span className={styles.creditWarning}>Crédito insuficiente</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
