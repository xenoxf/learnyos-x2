"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "@/styles/flashCards/crearCard.module.css";
import {
  X, Loader, Sparkles, FileText, Paperclip, Image,
} from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { creditsService } from "@/services/creditsService";
import {
  ACCEPTED_FILE_TYPES, ACCEPTED_FILE_EXTENSIONS, ACCEPTED_IMAGE_EXTENSIONS, MAX_FILE_SIZE,
} from "@/lib/file-constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FileChip from "@/components/common/FileChip";

const MAX_FILES = 5;

interface CrearCardProps {
  onClose: () => void;
  onCardCreated: (data: { reference: string; quantity: number; acceso: string; files?: File[] }) => Promise<void>;
}

export default function CrearCard({ onClose, onCardCreated }: CrearCardProps) {
  const [formData, setFormData] = useState({
    reference: '',
    quantity: 5,
    acceso: 'public'
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creditsStatus, setCreditsStatus] = useState<{
    remaining: number;
    total: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

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
  const isValid = formData.reference.trim().length >= 3 || selectedFiles.length > 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    for (const f of Array.from(fileList)) {
      if (selectedFiles.length + newFiles.length >= MAX_FILES) {
        toast.error("Límite alcanzado", `Máximo ${MAX_FILES} archivos`);
        break;
      }
      if (!ACCEPTED_FILE_TYPES.includes(f.type as any)) {
        toast.error("Formato no soportado", "Solo imágenes (PNG, JPG, WEBP, GIF) y PDF");
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error("Archivo muy grande", `${f.name}: máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        continue;
      }
      newFiles.push(f);
      if (f.type.startsWith("image/")) {
        const url = URL.createObjectURL(f);
        objectUrlsRef.current.push(url);
        newPreviews.push(url);
      } else {
        newPreviews.push("");
      }
    }
    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setFilePreviews(prev => [...prev, ...newPreviews]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

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
    await onCardCreated({ ...formData, files: selectedFiles.length > 0 ? selectedFiles : undefined });
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
          <div className={styles.dashboardGrid}>
            <div className={styles.dashboardMain}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Texto de Referencia</label>
                <div className={styles.inputFileWrapper}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILE_EXTENSIONS}
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <div className={styles.refInputBody}>
                    {selectedFiles.length > 0 && (
                      <div className={styles.refFileRow}>
                        {selectedFiles.map((f, i) => (
                          <FileChip
                            key={i}
                            file={f}
                            index={i}
                            onRemove={handleRemoveFile}
                            disabled={loading}
                            variant="input"
                            previewUrl={filePreviews[i]}
                          />
                        ))}
                      </div>
                    )}
                    <textarea
                      placeholder="Sobre que quieres las FlashCards, expresate..."
                      value={formData.reference}
                      onChange={(e) => {
                        setFormData({ ...formData, reference: e.target.value });
                      }}
                      className={styles.textarea}
                      disabled={loading}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`${styles.refUploadBtn} ${selectedFiles.length > 0 ? styles.refUploadBtnHasFile : ''}`}
                          disabled={loading}
                          type="button"
                          title={selectedFiles.length > 0 ? `${selectedFiles.length} archivo(s) adjunto(s)` : "Adjuntar archivo"}
                        >
                          <Paperclip size={14} />
                          {selectedFiles.length > 0 && <span className={styles.refBadge}>{selectedFiles.length}</span>}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={6} className={styles.dropdownContent}>
                        <DropdownMenuItem
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.accept = ACCEPTED_FILE_EXTENSIONS;
                              fileInputRef.current.click();
                            }
                          }}
                          className={styles.dropdownItem}
                        >
                          <Paperclip size={14} />
                          <span>Subir archivos</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.accept = ACCEPTED_IMAGE_EXTENSIONS;
                              fileInputRef.current.click();
                            }
                          }}
                          className={styles.dropdownItem}
                        >
                          <Image size={14} />
                          <span>Subir imágenes</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.dashboardSide}>
              <div className={styles.sidePanel}>
                <span className={styles.sidePanelLabel}>Cantidad</span>
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
              <div className={styles.sidePanel}>
                <span className={styles.sidePanelLabel}>Visibilidad</span>
                <select
                  value={formData.acceso}
                  onChange={(e) => setFormData({ ...formData, acceso: e.target.value })}
                  className={styles.select}
                  disabled={loading}
                >
                  <option title="Solo tu podras usarlas" value="private">Privado</option>
                  <option title="Todos podran usarlas" value="public">Público</option>
                </select>
              </div>
              {creditsStatus && (
                <div className={styles.creditBar}>
                  <span>~{estimatedCost} créditos</span>
                  <span>{creditsStatus.remaining}/{creditsStatus.total}</span>
                  {!canAfford && <span className={styles.creditWarning}>Insuficiente</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelBtn} disabled={loading}>
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
                Generar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
