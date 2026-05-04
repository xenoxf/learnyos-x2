"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/notes/createNoteModal.module.css";
import { X, Loader, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { GenerateNoteData, ApiErrorResponse } from "@/types";
import { useRouter } from "next/navigation";
import { notesService } from "@/services/notesService";
import { creditsService } from "@/services/creditsService";

interface CreateNoteModalProps {
  onClose: () => void;
  onNoteCreated: () => void;
}

export default function CreateNoteModal({
  onClose,
  onNoteCreated,
}: CreateNoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [creditsStatus, setCreditsStatus] = useState<{
    remaining: number;
    total: number;
  } | null>(null);
  const [formData, setFormData] = useState<GenerateNoteData>({
    reference: "",
    numberOfNotes: 3,
    levelOfDetail: "medio",
    acceso: "public",
  });
  const [touched, setTouched] = useState({ reference: false });
  const router = useRouter();

  useEffect(() => {
    creditsService
      .getStatus()
      .then((status) => {
        setCreditsStatus({ remaining: status.remaining, total: status.total });
      })
      .catch(() => { });
  }, []);

  const estimatedCost = creditsService.estimateNoteCost(
    formData.levelOfDetail,
    formData.reference || "",
    formData.acceso || 'public'
  );
  const canAfford = creditsStatus
    ? creditsStatus.remaining >= estimatedCost
    : true;
  const isValid = (formData.reference ?? "").trim().length > 0;

  const handleCreate = async () => {
    setTouched({ reference: true });

    if (!isValid) {
      toast.error("Error", "Debes proporcionar un tema o una referencia");
      return;
    }

    try {
      setLoading(true);
      await notesService.generateNote(formData);
      toast.success("Éxito", "Notas creadas correctamente");
      onNoteCreated();
      router.refresh();
      onClose();
    } catch (err: any) {


      toast.error("Error al crear notas", err.message, 8000);
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
            <h2 className={styles.title}>Generar Notas con IA</h2>
          </div>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tema o Referencia
              {touched.reference && !isValid && (
                <span className={styles.errorLabel}>Campo requerido</span>
              )}
            </label>
            <textarea
              placeholder="¿Sobre qué quieres tus notas? Expresa tus ideas libremente..."
              value={formData.reference}
              onChange={(e) => {
                setFormData({ ...formData, reference: e.target.value });
                if (!touched.reference) setTouched({ reference: true });
              }}
              onBlur={() => setTouched({ reference: true })}
              className={`${styles.textarea} ${touched.reference && !isValid ? styles.textareaError : ""}`}
              rows={5}
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Cantidad</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.numberOfNotes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfNotes: parseInt(e.target.value) || 3,
                  })
                }
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nivel de detalle</label>
              <select
                value={formData.levelOfDetail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    levelOfDetail: e.target.value as
                      | "breve"
                      | "medio"
                      | "detallado",
                  })
                }
                className={styles.select}
                disabled={loading}
              >
                <option value="breve">Breve - Conceptos clave</option>
                <option value="medio">Medio - Balanceado</option>
                <option value="detallado">Detallado - Profundo</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Privacidad</label>
            <select
              value={formData.acceso}
              onChange={(e) =>
                setFormData({ ...formData, acceso: e.target.value })
              }
              className={styles.select}
              disabled={loading}
            >
              <option value="private">Privado - Solo tú puedes usarlo</option>
              <option value="public">Público - La comunidad también puede usarlo</option>
            </select>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            onClick={onClose}
            className={styles.cancelBtn}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !isValid || !canAfford}
            className={styles.confirmBtn}
          >
            {loading ? (
              <>
                <Loader size={16} className={styles.spinner} />
                Generando...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generar Notas
              </>
            )}
          </button>
        </div>

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
