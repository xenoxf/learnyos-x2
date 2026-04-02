"use client";

import React, { useState } from "react";
import { toast } from "@/hooks/useLocalToast";
import { apiService } from "@/services/apiService";
import styles from "@/styles/notes/createNoteModal.module.css";
import { X, Loader, Sparkles } from "lucide-react";
import type { GenerateNoteData, ApiErrorResponse } from "@/types";
import { useRouter } from "next/navigation";

interface CreateNoteModalProps {
  onClose: () => void;
  onNoteCreated: () => void;
}

export default function CreateNoteModal({
  onClose,
  onNoteCreated,
}: CreateNoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GenerateNoteData>({
    reference: "",
    numberOfNotes: 3,
    levelOfDetail: "medio",
    acceso: "public",
  });
  const router = useRouter();

  const handleCreate = async () => {
    if (!formData.reference?.trim()) {
      toast.error("Error", "Debes proporcionar un tema o una referencia");
      return;
    }

    try {
      setLoading(true);
      await apiService.generateNote(formData);
      toast.success("Éxito", "Notas creadas correctamente");
      onNoteCreated();
      router.refresh();
      onClose();
    } catch (err: any) {
      let message = "Error al crear notas";
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
      } else if (typeof err === 'string') {
        message = err;
      }

      // Construir descripción detallada del error
      let errorDescription = details || message;

      // Agregar información según el código de error
      if (rawResponse) {
        console.error('Raw response from AI:', rawResponse);
        
        if (errorCode === 'INVALID_AI_RESPONSE') {
          errorDescription = `${details} La IA devolvió una respuesta con formato inesperado.`;
        } else if (errorCode === 'MISSING_METADATA') {
          errorDescription = `${details} La IA generó contenido pero sin título.`;
        } else if (errorCode === 'NO_CONTENT_GENERATED') {
          errorDescription = `${details} Intenta con un tema más específico o detallado.`;
        }
      }

      // Fallback para errores antiguos
      if (message.includes('metadata') && !details) {
        errorDescription = "La IA no pudo generar las notas correctamente. Intenta con otro tema.";
      }

      toast.error("Error al crear notas", errorDescription, 8000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Generar Notas</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>


          <div className={styles.formGroup}>
            <label className={styles.label}>Referencia</label>
            <textarea
              placeholder="Sobre que quieres tu quiz? expresate."
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className={styles.textarea}
              rows={5}
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Número de notas</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.numberOfNotes}
                onChange={(e) => setFormData({ ...formData, numberOfNotes: parseInt(e.target.value) })}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nivel de detalle</label>
              <select
                value={formData.levelOfDetail}
                onChange={(e) => setFormData({ ...formData, levelOfDetail: e.target.value as "breve" | "medio" | "detallado" })}
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
              onChange={(e) => setFormData({ ...formData, acceso: e.target.value })}
              className={styles.select}
              disabled={loading}
            >
              <option title="Solo tu podras usarlos" value="private">Privado</option>
              <option title="La comunidad tambien podra usarlos" value="public">Público</option>
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
            disabled={loading || !formData.reference?.trim()}
            className={styles.confirmBtn}
          >
            {loading ? (
              <>
                <Loader size={18} className={styles.spinner} />
                Generando...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generar Notas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
