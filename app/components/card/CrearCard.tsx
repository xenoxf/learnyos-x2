import React, { useState } from "react";
import { apiService } from "@/services/apiService";
import styles from "@/styles/flashCards/crearCard.module.css";
import { X, Loader, Sparkles } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import type { ApiErrorResponse } from "@/types";
import { useRouter } from "next/navigation";

interface CrearCardProps {
  onClose: () => void;
  onCardCreated: () => void;
}

export default function CrearCard({ onClose, onCardCreated }: CrearCardProps) {
  const [reference, setReference] = useState("");
  const [quantity, setQuantity] = useState(3);
  const [acceso, setAcceso] = useState("public");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!reference.trim()) {
      toast.error("Validación", "Por favor, proporciona un texto de referencia");
      return;
    }

    if (quantity < 2 || quantity > 20) {
      toast.error("Cantidad inválida", "La cantidad debe estar entre 2 y 20 tarjetas");
      return;
    }

    try {
      setLoading(true);
      await apiService.generateFlashcards({
        reference,
        quantity,
        acceso,
      });

      toast.success("¡Éxito!", `Tarjetas generadas correctamente`);

      setReference("");
      setQuantity(10);
      setAcceso("private");
      onCardCreated();
      router.refresh();
      onClose();
    } catch (err: any) {
      let message = "Error al generar tarjetas";
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
        } else if (errorCode === 'NO_CARDS_GENERATED') {
          errorDescription = `${details} Intenta con un tema más específico o detallado.`;
        } else if (errorCode === 'MISSING_METADATA') {
          errorDescription = `${details} La IA generó tarjetas pero sin título para el mazo.`;
        } else if (errorCode === 'INVALID_CARD_FORMAT') {
          errorDescription = `${details} Las tarjetas generadas no tienen frente o reverso.`;
        }
      }

      // Fallback para errores antiguos
      if (message.includes('Invalid AI response') && !details) {
        errorDescription = "La IA no pudo generar las tarjetas correctamente. Intenta con otro tema.";
      }

      toast.error("Error al generar tarjetas", errorDescription, 8000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Generar Tarjetas</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Genera tarjetas basándote en un texto de referencia
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>Texto de Referencia</label>
            <textarea
              placeholder="Sobre que quieres las FlashCards, expresate..."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={styles.textarea}
              rows={5}
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Cantidad de Tarjetas</label>
              <input
                type="number"
                min="2"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Privacidad</label>
              <select
                value={acceso}
                onChange={(e) => setAcceso(e.target.value)}
                className={styles.select}
                disabled={loading}
              >
                <option title="Solo tu podras usarlas" value="private">Privado</option>
                <option title="Todos podran usarlas" value="public">Público</option>
              </select>
            </div>
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
            disabled={loading || !reference.trim()}
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
                Generar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
