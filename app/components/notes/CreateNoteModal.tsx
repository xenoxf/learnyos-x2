"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import styles from "@/styles/notes/createNoteModal.module.css";
import type { GenerateNoteData } from "@/types";

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
    reference: '',
    numberOfNotes: 3,
    levelOfDetail: "medio",
    acceso: "public",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.reference) {
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Crear Notas</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="reference">
              Referencia
            </label>
            <textarea
              id="reference"
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
              <label className={styles.label} htmlFor="numberOfNotes">
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
                  setFormData({
                    ...formData,
                    numberOfNotes: parseInt(e.target.value),
                  })
                }
              />
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
                  setFormData({
                    ...formData,
                    levelOfDetail: e.target.value as "breve" | "medio" | "detallado",
                  })
                }
              >
                <option value="breve">Breve</option>
                <option value="medio">Medio</option>
                <option value="detallado">Detallado</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="acceso">
                Privacidad
              </label>
              <select
                id="acceso"
                className={styles.select}
                value={formData.acceso || "private"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    acceso: e.target.value,
                  })
                }
              >
                <option value="private">Privada</option>
                <option value="public">Publica</option>
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
              {loading ? "Creando..." : "Crear Notas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
