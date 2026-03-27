import React, { useState } from "react";
import { apiService } from "@/services/apiService";
import styles from "@/styles/flashCards/crearCard.module.css";
import { X, Loader, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CrearCardProps {
  onClose: () => void;
  onCardCreated: () => void;
}

export default function CrearCard({ onClose, onCardCreated }: CrearCardProps) {
  const [reference, setReference] = useState("");
  const [quantity, setQuantity] = useState(3);
  const [acceso, setAcceso] = useState("private");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!reference.trim()) {
      toast({
        title: "Validación",
        description: "Por favor, proporciona un texto de referencia",
      });
      return;
    }

    if (quantity < 2 || quantity > 20) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe estar entre 2 y 20 tarjetas",
      });
      return;
    }

    try {
      setLoading(true);
      await apiService.generateFlashcards({
        reference,
        quantity,
        acceso,
      });

      toast({
        title: "¡Éxito!",
        description: `Tarjetas generadas correctamente`,
      });

      setReference("");
      setQuantity(10);
      setAcceso("private");
      onCardCreated();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al generar tarjetas";
      toast({
        title: "Error al generar tarjetas",
        description: errorMessage,
      });
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
            Genera tarjetas usando IA basándote en un texto de referencia
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>Texto de Referencia</label>
            <textarea
              placeholder="Pega el contenido para extraer tarjetas..."
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
                <option value="private">Privado</option>
                <option value="public">Público</option>
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
