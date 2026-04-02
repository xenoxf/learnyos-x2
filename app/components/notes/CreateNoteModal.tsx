"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import styles from "@/styles/notes/createNoteModal.module.css";
import { X, Loader, Sparkles } from "lucide-react";
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

  const handleCreate = async () => {
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
