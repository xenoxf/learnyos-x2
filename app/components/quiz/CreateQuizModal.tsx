import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/quiz/createQuizModal.module.css";
import type { GenerateExamData, ApiErrorResponse } from "@/types";
import { useRouter } from "next/navigation";
import { creditsService } from "@/services/creditsService";
import { quizzesService } from "@/services/quizzesService";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  const [touched, setTouched] = useState({ reference: false });
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
  const isValid = formData.reference.trim().length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ reference: true });

    if (!isValid) {
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

      let errorDescription = details || message;

      if (rawResponse) {
        console.error("Raw response from AI:", rawResponse);

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
          <div className={styles.headerTitle}>
            <Sparkles className={styles.headerIcon} size={20} />
            <h2 className={styles.title}>Crear Quiz con IA</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tema o Referencia
              {touched.reference && !isValid && (
                <span className={styles.errorLabel}>Mínimo 3 caracteres</span>
              )}
            </label>
            <textarea
              className={`${styles.textarea} ${touched.reference && !isValid ? styles.textareaError : ""}`}
              placeholder="¿Qué quieres aprender? Escribe un tema, concepto o texto..."
              value={formData.reference}
              onChange={(e) => {
                setFormData({ ...formData, reference: e.target.value });
                if (!touched.reference) setTouched({ reference: true });
              }}
              onBlur={() => setTouched({ reference: true })}
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
                max="50"
                value={formData.numberOfQuestions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfQuestions: parseInt(e.target.value) || 10,
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
              <option value="private">Privado - Solo tú puedes usarlo</option>
              <option value="public">Público - La comunidad también puede usarlo</option>
            </select>
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
              disabled={loading || !canAfford || !isValid}
            >
              {loading ? "Creando..." : "Crear Quiz"}
            </button>
          </div>
        </form>

        {creditsStatus && (
          <div className={`${styles.creditPreview} ${!canAfford ? styles.creditInsufficient : ""}`}>
            {!canAfford ? (
              <AlertTriangle size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            <span>Costo: ~{estimatedCost} créditos</span>
            <span className={styles.creditDivider}>•</span>
            <span>Disponibles: {creditsStatus.remaining}/{creditsStatus.total}</span>
            {!canAfford && (
              <span className={styles.creditWarning}>Créditos insuficientes</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
