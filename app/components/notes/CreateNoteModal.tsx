"use client";

import React, { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { Sparkles, FileText, Settings, Eye } from "lucide-react";
import styles from "@/styles/notes/createNoteModal.module.css";
import type { GenerateNoteData } from "@/types";
import { useRouter } from "next/navigation";

interface CreateNoteModalProps {
  onClose: () => void;
  onNoteCreated: () => void;
}

export default function CreateNoteModal({
  onClose,
  onNoteCreated,
}: CreateNoteModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GenerateNoteData>({
    reference: "",
    numberOfNotes: 3,
    levelOfDetail: "medio",
    acceso: "public",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.reference?.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes proporcionar un tema o una referencia",
      });
      return;
    }

    try {
      setLoading(true);
      await apiService.generateNote(formData);
      toast({
        title: "Éxito",
        description: "Notas creadas correctamente",
      });
      onNoteCreated();
      router.refresh();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear notas";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback(
    (field: keyof GenerateNoteData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Sparkles size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-title" className={styles.title}>Crear Notas con IA</h2>
              <p className={styles.subtitle}>Genera notas estructuradas automáticamente</p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FileText size={18} className={styles.sectionIcon} aria-hidden="true" />
                <h3 className={styles.sectionTitle}>Contenido</h3>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="reference">
                  Tema o texto de referencia
                </label>
                <textarea
                  id="reference"
                  className={styles.textarea}
                  placeholder="Ej: La Revolución Francesa, Mecánica cuántica, o pega tu texto aquí..."
                  value={formData.reference || ""}
                  onChange={(e) => handleInputChange("reference", e.target.value)}
                  rows={5}
                  required
                  disabled={loading}
                />
                <p className={styles.helperText}>
                  La IA generará notas basadas en este contenido
                </p>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Settings size={18} className={styles.sectionIcon} aria-hidden="true" />
                <h3 className={styles.sectionTitle}>Configuración</h3>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="numberOfNotes">
                    <Eye size={16} className={styles.labelIcon} aria-hidden="true" />
                    Número de notas
                  </label>
                  <input
                    id="numberOfNotes"
                    type="number"
                    className={styles.input}
                    min="1"
                    max="10"
                    value={formData.numberOfNotes}
                    onChange={(e) =>
                      handleInputChange("numberOfNotes", parseInt(e.target.value) || 1)
                    }
                    disabled={loading}
                  />
                  <p className={styles.helperText}>1-10 notas por generación</p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="levelOfDetail">
                    Nivel de detalle
                  </label>
                  <select
                    id="levelOfDetail"
                    className={styles.select}
                    value={formData.levelOfDetail}
                    onChange={(e) =>
                      handleInputChange("levelOfDetail", e.target.value)
                    }
                    disabled={loading}
                  >
                    <option value="breve">Breve - Conceptos clave</option>
                    <option value="medio">Medio - Balanceado</option>
                    <option value="detallado">Detallado - Profundo</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="acceso">
                  Privacidad
                </label>
                <div className={styles.accessOptions}>
                  <label className={styles.accessOption}>
                    <input
                      type="radio"
                      name="acceso"
                      value="private"
                      checked={formData.acceso === "private"}
                      onChange={(e) => handleInputChange("acceso", e.target.value)}
                      disabled={loading}
                    />
                    <span className={styles.accessLabel}>
                      <span className={styles.accessIcon}>🔒</span>
                      Privada - Solo tú puedes verla
                    </span>
                  </label>
                  <label className={styles.accessOption}>
                    <input
                      type="radio"
                      name="acceso"
                      value="public"
                      checked={formData.acceso === "public"}
                      onChange={(e) => handleInputChange("acceso", e.target.value)}
                      disabled={loading}
                    />
                    <span className={styles.accessLabel}>
                      <span className={styles.accessIcon}>🌍</span>
                      Pública - Visible para todos
                    </span>
                  </label>
                </div>
              </div>
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
              {loading ? (
                <>
                  <span className={styles.loadingSpinner} aria-hidden="true" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles size={18} aria-hidden="true" />
                  Generar Notas
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
