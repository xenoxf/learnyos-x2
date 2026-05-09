import React, { useState, useEffect } from "react";
import styles from "@/styles/flashCards/crearCard.module.css";
import { X, Loader, Sparkles } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import type { ApiErrorResponse } from "@/types";
import { useRouter } from "next/navigation";
import { cardsService } from "@/services/cardsService";
import { creditsService } from "@/services/creditsService";
import { httpClient } from "@/services/client";

interface CrearCardProps {
  onClose: () => void;
  onCardCreated: (acceso: string) => void;
}

export default function CrearCard({ onClose, onCardCreated }: CrearCardProps) {
  const [formData, setFormData] = useState({
    reference: '',
    quantity: 5,
    acceso: 'public'
  });
  const [loading, setLoading] = useState(false);
  const [creditsStatus, setCreditsStatus] = useState<{
    remaining: number;
    total: number;
  } | null>(null);
  const router = useRouter();

  // Load credits status on mount
  React.useEffect(() => {
    creditsService
      .getStatus()
      .then((status) => {
        setCreditsStatus({ remaining: status.remaining, total: status.total });
      })
      .catch(() => { });
  }, []);

  const estimatedCost = creditsService.estimateFlashcardCost(
    formData.quantity,
    formData.reference || "",
    formData.acceso
  );
  const canAfford = creditsStatus
    ? creditsStatus.remaining >= estimatedCost
    : true;

  const handleCreate = async () => {
    if (!formData.reference.trim()) {
      toast.error(
        "Validación",
        "Por favor, proporciona un texto de referencia",
      );
      return;
    }

    if (formData.quantity < 2 || formData.quantity > 25) {
      toast.error(
        "Cantidad inválida",
        "La cantidad debe estar entre 2 y 20 tarjetas",
      );
      return;
    }
    setLoading(true);
    toast.info("Enviado", "Junior está redactando tus flashCards... te avisaremos en segundos.");
    onClose();

    try {
      await cardsService.generateFlashcards({
        reference: formData.reference,
        quantity: formData.quantity,
        acceso: formData.acceso,
      });

      toast.success("Éxito", "Tus nuevas flashCards ya están disponibles.");

      httpClient.clearCache();
      onCardCreated(formData.acceso);
    } catch (err: any) {
      setLoading(false);
      toast.error("Fallo en la creación", err.message);
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
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}

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
                max="25"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Privacidad</label>
              <select
                value={formData.acceso}
                onChange={(e) => setFormData({ ...formData, acceso: e.target.value })}
                className={styles.select}
                disabled={loading}
              >
                <option title="Solo tu podras usarlas" value="private">
                  Privado
                </option>
                <option title="Todos podran usarlas" value="public">
                  Público
                </option>
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
            disabled={loading || !formData.reference.trim() || !canAfford}
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

        {creditsStatus && (
          <div className={styles.creditPreview}>
            <span>Costo: ~{estimatedCost} créditos</span>
            <span>•</span>
            <span>
              Tus créditos: {creditsStatus.remaining}/{creditsStatus.total}
            </span>
            {!canAfford && (
              <span className={styles.creditWarning}>Crédito insuficiente</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
