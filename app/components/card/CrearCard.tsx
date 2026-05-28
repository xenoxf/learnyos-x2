"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "@/styles/flashCards/crearCard.module.css";
import { X, Loader, Sparkles, Upload, FileText, XCircle } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import type { ApiErrorResponse } from "@/types";
import { useRouter } from "next/navigation";
import { cardsService } from "@/services/cardsService";
import { creditsService } from "@/services/creditsService";
import { httpClient } from "@/services/client";

interface CrearCardProps {
  onClose: () => void;
  onCardCreated: (data: { reference: string; quantity: number; acceso: string; file?: File }) => Promise<void>;
}

export default function CrearCard({ onClose, onCardCreated }: CrearCardProps) {
  const [formData, setFormData] = useState({
    reference: '',
    quantity: 5,
    acceso: 'public'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [creditsStatus, setCreditsStatus] = useState<{
    remaining: number;
    total: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_FILE_TYPES = [
    "image/png", "image/jpeg", "image/webp", "image/gif",
    "application/pdf",
  ];

  // Load credits status on mount
  useEffect(() => {
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
  const isValid = formData.reference.trim().length >= 3 || !!selectedFile;

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

  const handleCreate = async () => {
    if (!isValid) {
      toast.error(
        "Validación",
        "Por favor, proporciona un texto de referencia o sube un archivo",
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
    
    toast.info("Enviado", "Junior está analizando y redactando tus flashCards... te avisaremos en segundos.");
    onClose();
    await onCardCreated({ ...formData, file: selectedFile || undefined });
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
            Genera tarjetas basándote en un texto de referencia o un archivo
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

          {/* File upload */}
          <div className={styles.formGroup} style={{ marginBottom: "1rem" }}>
            <label className={styles.label}>O sube un archivo (imagen o PDF)</label>
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
                border: "1px solid hsl(var(--border))", borderRadius: "0.75rem"
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
                  padding: "0.75rem", border: "2px dashed hsl(var(--border))", borderRadius: "0.75rem",
                  background: "transparent", color: "hsl(var(--muted-foreground))", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s ease", width: "100%"
                }}
                disabled={loading}
              >
                <Upload size={18} />
                <span>Subir archivo (imagen o PDF)</span>
              </button>
            )}
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
            disabled={loading || !isValid || !canAfford}
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
