"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/quiz/createQuizModal.module.css";
import type { GenerateExamData, ApiErrorResponse } from "@/types";
import { useRouter } from "next/navigation";
import { creditsService } from "@/services/creditsService";
import { quizzesService } from "@/services/quizzesService";
import { Sparkles, AlertTriangle, RefreshCw, Zap, X, Target, Info, Shield } from "lucide-react";

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
    type: "quiz",
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
      toast.error("Error", "Debes proporcionar un texto con más de 3 caracteres");
      return;
    }

    // Cerramos el modal inmediatamente y notificamos que Junior esta trabajando
    toast.info("Enviado", "Junior está redactando tu examen... te avisaremos en segundos.");
    onClose();

    // El proceso sigue en segundo plano
    try {
      await quizzesService.generateExam(formData);
      toast.success("Éxito", "Tu nuevo examen ya está disponible en tu biblioteca.");
      onQuizCreated();
      router.refresh();
    } catch (err: any) {
      let message = "No pudimos crear el examen";
      let details = "";
      if (err?.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        message = errorData.message || message;
        details = errorData.details || "";
      }
      toast.error("Fallo en la creación", details || message);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Sparkles className={styles.headerIcon} size={20} />
            <h2 className={styles.title}>Diseñador de Exámenes IA</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formLayout}>
            {/* Left Column: Context & Credits */}
            <div className={styles.mainColumn}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <div className={styles.labelWithIcon}>
                    <Target size={16} />
                    <span>Tema o Referencia Académica</span>
                  </div>
                  <span className={`${styles.charCount} ${isValid ? styles.charCountValid : ""}`}>
                    {formData.reference.length} carac.
                  </span>
                </label>
                <textarea
                  className={`${styles.textarea} ${touched.reference && !isValid ? styles.textareaError : ""}`}
                  placeholder="Ej: 'Segunda Guerra Mundial' o pega un texto académico para generar preguntas basadas en él..."
                  value={formData.reference}
                  onChange={(e) => {
                    setFormData({ ...formData, reference: e.target.value });
                    if (!touched.reference) setTouched({ reference: true });
                  }}
                  disabled={loading}
                />
              </div>

              {/* Integrated Credit Card - Optimized Flow */}
              <div className={`${styles.creditsCard} ${!canAfford ? styles.creditsWarning : ""}`}>
                <div className={styles.creditsInfo}>
                  <Zap size={18} className={canAfford ? styles.zapActive : styles.zapInactive} />
                  <div className={styles.creditsText}>
                    <span className={styles.creditsLabel}>Inversión de Créditos</span>
                    <span className={styles.creditsValue}>{estimatedCost} créditos</span>
                  </div>
                </div>
                {!canAfford && (
                  <div className={styles.warningBox}>
                    <AlertTriangle size={14} />
                    <span>Créditos insuficientes ({creditsStatus?.remaining || 0} disp.)</span>
                  </div>
                )}
                {canAfford && creditsStatus && (
                  <span className={styles.balanceInfo}>Balance tras generar: {creditsStatus.remaining - estimatedCost}</span>
                )}
              </div>
            </div>

            {/* Right Column: Precise Configuration */}
            <div className={styles.sideColumn}>
              <div className={styles.configHeader}>
                <Info size={14} />
                <span>Configuración</span>
              </div>

              <div className={styles.configGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nº Preguntas</label>
                  <input
                    type="number"
                    className={styles.input}
                    min="1"
                    max="50"
                    value={formData.numberOfQuestions}
                    onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) || 1 })}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nivel de Dificultad</label>
                  <select
                    className={styles.select}
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    disabled={loading}
                  >
                    <option value="very_easy">Muy Fácil</option>
                    <option value="easy">Fácil</option>
                    <option value="medium">Medio</option>
                    <option value="hard">Difícil</option>
                    <option value="very_hard">Muy Difícil</option>
                    <option value="expert">Experto (Nivel ICFES)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo de Formato</label>
                  <select
                    className={styles.select}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    disabled={loading}
                  >
                    <option value="quiz">Quiz Dinámico</option>
                    <option value="icfes">Simulacro ICFES</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Visibilidad</label>
                  <select
                    className={styles.select}
                    value={formData.acceso}
                    onChange={(e) => setFormData({ ...formData, acceso: e.target.value as any })}
                    disabled={loading}
                  >
                    <option value="private">Privado (Solo yo)</option>
                    <option value="public">Público (Comunidad)</option>
                  </select>
                </div>
              </div>

              <div className={styles.securityNote}>
                <Shield size={12} />
                <span>Generación segura y validada</span>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose} disabled={loading}>
              Descartar
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={loading || !isValid || !canAfford}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className={styles.spinner} />
                  <span>Construyendo examen...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Generar Examen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
