"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/quiz/createQuizModal.module.css";
import type { GenerateExamData } from "@/types";
import { useRouter } from "next/navigation";
import { creditsService } from "@/services/creditsService";
import { useExams } from "@/hooks/useExams";
import {
  Sparkles, AlertTriangle, RefreshCw, Zap, X, Target, Shield,
  FileText, Paperclip, Image,
} from "lucide-react";
import { httpClient } from "@/services/client";
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

interface CreateQuizModalProps {
  onClose: () => void;
  onQuizCreated: (data: GenerateExamData) => Promise<void>;
}

export default function CreateQuizModal({
  onClose,
  onQuizCreated,
}: CreateQuizModalProps) {
  const { isGenerating } = useExams();
  const [creditsStatus, setCreditsStatus] = useState<{
    remaining: number;
    total: number;
  } | null>(null);
  const [formData, setFormData] = useState<GenerateExamData>({
    reference: "",
    numberOfQuestions: 10,
    difficulty: "medium",
    type: "quiz",
    acceso: "public",
  });
  const [touched, setTouched] = useState({ reference: false });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const isMounted = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

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

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    creditsService
      .getStatus()
      .then((status) => {
        if (isMounted.current) {
          setCreditsStatus({ remaining: status.remaining, total: status.total });
        }
      })
      .catch(() => { });
  }, []);

  const estimatedCost = creditsService.estimateExamCost(
    formData.numberOfQuestions,
    formData.difficulty,
    formData.reference || "",
    formData.acceso || 'public'
  );
  const canAfford = creditsStatus
    ? creditsStatus.remaining >= estimatedCost
    : true;
  const isValid = formData.reference.trim().length >= 3 || selectedFiles.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ reference: true });

    if (!isValid) {
      toast.warning("Instrucciones", "Proporciona un texto de referencia o sube un archivo");
      return;
    }
    if (formData.numberOfQuestions < 2 || formData.numberOfQuestions > 25) {
      toast.warning("Instrucciones", "El numero de preguntas debe ser minimo 2 y maximo 25 preguntas");
      return;
    }

    toast.info("Enviado", "Junior está analizando y redactando tu examen... te avisaremos en segundos.");
    onClose();
    await onQuizCreated({ ...formData, files: selectedFiles.length > 0 ? selectedFiles : undefined });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Sparkles className={styles.headerIcon} size={20} />
            <h2 className={styles.title}>Diseñador de Exámenes IA</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.dashboardLayout}>
            <div className={styles.mainColumn}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <div className={styles.labelWithIcon}>
                    <Target size={14} />
                    <span>Tema o Referencia</span>
                  </div>
                  <span className={`${styles.charCount} ${isValid ? styles.charCountValid : ""}`}>
                    {formData.reference.length}
                  </span>
                </label>
                <div className={styles.textareaWrapper}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILE_EXTENSIONS}
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <div className={styles.examInputBody}>
                    {selectedFiles.length > 0 && (
                      <div className={styles.examFileRow}>
                        {selectedFiles.map((f, i) => (
                          <FileChip
                            key={i}
                            file={f}
                            index={i}
                            onRemove={handleRemoveFile}
                            disabled={isGenerating}
                            variant="input"
                            previewUrl={filePreviews[i]}
                          />
                        ))}
                      </div>
                    )}
                    <textarea
                      className={`${styles.textarea} ${touched.reference && !isValid ? styles.textareaError : ""}`}
                      placeholder="Ej: 'Segunda Guerra Mundial' o pega un texto académico..."
                      value={formData.reference}
                      onChange={(e) => {
                        setFormData({ ...formData, reference: e.target.value });
                        if (!touched.reference) setTouched({ reference: true });
                      }}
                      disabled={isGenerating}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`${styles.examUploadBtn} ${selectedFiles.length > 0 ? styles.examUploadBtnHasFile : ''}`}
                          disabled={isGenerating}
                          type="button"
                          title={selectedFiles.length > 0 ? `${selectedFiles.length} archivo(s) adjunto(s)` : "Adjuntar archivo"}
                        >
                          <Paperclip size={14} />
                          {selectedFiles.length > 0 && <span className={styles.examBadge}>{selectedFiles.length}</span>}
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

              {!canAfford && (
                <div className={styles.warningBox}>
                  <AlertTriangle size={14} />
                  <span>Créditos insuficientes ({creditsStatus?.remaining || 0} disponibles)</span>
                </div>
              )}
            </div>

            <div className={styles.sideColumn}>
              <div className={styles.sidePanel}>
                <span className={styles.sidePanelLabel}>Configuración</span>
                <div className={styles.configGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Preguntas</label>
                    <input
                      type="number"
                      className={styles.input}
                      min="2"
                      max="25"
                      value={formData.numberOfQuestions}
                      onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) || 1 })}
                      disabled={isGenerating}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Dificultad</label>
                    <select
                      className={styles.select}
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      disabled={isGenerating}
                    >
                      <option value="very_easy">Muy Fácil</option>
                      <option value="easy">Fácil</option>
                      <option value="medium">Medio</option>
                      <option value="hard">Difícil</option>
                      <option value="very_hard">Muy Difícil</option>
                      <option value="expert">Experto</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Formato</label>
                    <select
                      className={styles.select}
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      disabled={isGenerating}
                    >
                      <option value="quiz">Quiz Dinámico</option>
                      <option value="icfes">Simulacro ICFES</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Visibilidad</label>
                    <select
                      className={styles.select}
                      value={formData.acceso}
                      onChange={(e) => setFormData({ ...formData, acceso: e.target.value as any })}
                      disabled={isGenerating}
                    >
                      <option value="private">Privado</option>
                      <option value="public">Público</option>
                    </select>
                  </div>
                </div>
              </div>

              {creditsStatus && (
                <div className={styles.creditBar}>
                  <span>~{estimatedCost} créditos</span>
                  <span>{creditsStatus.remaining}/{creditsStatus.total}</span>
                </div>
              )}

              <div className={styles.securityNote}>
                <Shield size={12} />
                <span>Generación segura</span>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose} disabled={isGenerating}>
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isGenerating || !isValid || !canAfford}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className={styles.spinner} />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Generar Examen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
