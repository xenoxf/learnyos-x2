"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/quiz/createQuizModal.module.css";
import type { GenerateExamData } from "@/types";
import { useRouter } from "next/navigation";
import { creditsService } from "@/services/creditsService";
import { useExams } from "@/hooks/useExams";
import { Sparkles, AlertTriangle, RefreshCw, Zap, X, Target, Info, Shield, Upload, FileText, XCircle } from "lucide-react";
import { httpClient } from "@/services/client";

interface CreateQuizModalProps {
  onClose: () => void;
  onQuizCreated: (data: GenerateExamData) => Promise<void>;
}

export default function CreateQuizModal({
  onClose,
  onQuizCreated,
}: CreateQuizModalProps) {
  const { isGenerating } = useExams();
  const [creditsStatus, setCreditsStatus] = useState<{
    remaining: number;
    total: number;
  } | null>(null);
  const [formData, setFormData] = useState<GenerateExamData>({
    reference: "",
    numberOfQuestions: 10,
    difficulty: "medium",
    type: "quiz",
    acceso: "public",
  });
  const [touched, setTouched] = useState({ reference: false });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isMounted = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_FILE_TYPES = [
    "image/png", "image/jpeg", "image/webp", "image/gif",
    "application/pdf",
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error("Formato no soportado", "Solo imágenes (PNG, JPG, WEBP, GIF) y PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Archivo muy grande", "El tamaño máximo es 10MB");
      return;
    }
    setSelectedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = () => setSelectedFile(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    creditsService
      .getStatus()
      .then((status) => {
        if (isMounted.current) {
          setCreditsStatus({ remaining: status.remaining, total: status.total });
        }
      })
      .catch(() => { });
  }, []);

  const estimatedCost = creditsService.estimateExamCost(
    formData.numberOfQuestions,
    formData.difficulty,
    formData.reference || "",
    formData.acceso || 'public'
  );
  const canAfford = creditsStatus
    ? creditsStatus.remaining >= estimatedCost
    : true;
  const isValid = formData.reference.trim().length >= 3 || !!selectedFile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ reference: true });

    if (!isValid) {
      toast.warning("Instrucciones", "Proporciona un texto de referencia o sube un archivo");
      return;
    }
    if (formData.numberOfQuestions < 2 || formData.numberOfQuestions > 25) {
      toast.warning("Instrucciones", "El numero de preguntas debe ser minimo 2 y maximo 25 preguntas");
      return;
    }

    toast.info("Enviado", "Junior está analizando y redactando tu examen... te avisaremos en segundos.");
    onClose();
    await onQuizCreated({ ...formData, file: selectedFile || undefined });
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
                  disabled={isGenerating}
                />
              </div>

              {/* File upload */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <div className={styles.labelWithIcon}>
                    <Upload size={16} />
                    <span>O sube un archivo (imagen o PDF)</span>
                  </div>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                {selectedFile ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.75rem 1rem", background: "hsl(var(--accent) / 0.2)",
                    border: "1px solid hsl(var(--border))", borderRadius: "1rem"
                  }}>
                    <FileText size={20} style={{ color: "hsl(var(--primary))", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "hsl(var(--foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      style={{
                        width: 24, height: 24, borderRadius: "50%", border: "none",
                        background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                      padding: "1rem", border: "2px dashed hsl(var(--border))", borderRadius: "1rem",
                      background: "transparent", color: "hsl(var(--muted-foreground))", cursor: "pointer",
                      fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s ease"
                    }}
                    disabled={isGenerating}
                  >
                    <Upload size={18} />
                    <span>Subir archivo (imagen o PDF)</span>
                  </button>
                )}
              </div>

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
                    min="2"
                    max="25"
                    value={formData.numberOfQuestions}
                    onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) || 1 })}
                    disabled={isGenerating}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nivel de Dificultad</label>
                  <select
                    className={styles.select}
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    disabled={isGenerating}
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
                  <label className={styles.label}>Tipo de Formato</label>
                  <select
                    className={styles.select}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    disabled={isGenerating}
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
                    disabled={isGenerating}
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
            <button type="button" className={styles.secondaryBtn} onClick={onClose} disabled={isGenerating}>
              Descartar
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isGenerating || !isValid || !canAfford || (!formData.reference.trim() && !selectedFile)}
            >
              {isGenerating ? (
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
