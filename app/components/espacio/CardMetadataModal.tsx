"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  X,
  Tag,
  BookOpen,
  User,
  Heart,
  Calendar,
  Hash,
  Eye,
  Trash2,
  ClipboardCopy,
} from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/espacio/cardMetadataModal.module.css";

export interface CardMetadata {
  id: number;
  title: string;
  description?: string;
  code?: string;
  area?: string;
  tema?: string;
  creatorName?: string;
  likesCount?: number;
  type: "flashcard" | "quiz" | "note";
  totalCards?: number;
  totalQuestions?: number;
  contentsCount?: number;
  difficulty?: string;
  createdAt?: string;
}

interface CardMetadataModalProps {
  card: CardMetadata;
  onClose: () => void;
  onViewContent: (id: number) => void;
  onDelete?: (id: number) => void;
  isOwner?: boolean;
}

export function CardMetadataModal({
  card,
  onClose,
  onViewContent,
  onDelete,
  isOwner = true,
}: CardMetadataModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(async () => {
    if (card.code) {
      await navigator.clipboard.writeText(card.code);
      setCopied(true);
      toast.success("Copiado", "Código copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [card.code]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "flashcard":
        return "FLASHCARD";
      case "quiz":
        return "QUIZ";
      case "note":
        return "NOTA";
      default:
        return type.toUpperCase();
    }
  };

  const getTypeIcon = () => {
    switch (card.type) {
      case "flashcard":
        return "🃏";
      case "quiz":
        return "❓";
      case "note":
        return "📝";
      default:
        return "📄";
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.typeIcon}>{getTypeIcon()}</span>
            <span className={styles.typeLabel}>{getTypeLabel(card.type)}</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Title & Description */}
          <div className={styles.titleSection}>
            <h2 className={styles.title}>{card.title}</h2>
            {card.description && (
              <p className={styles.description}>{card.description}</p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className={styles.metadataGrid}>
            {card.area && (
              <div className={styles.metaItem}>
                <Tag size={16} />
                <div>
                  <span className={styles.metaLabel}>Área</span>
                  <span className={styles.metaValue}>{card.area}</span>
                </div>
              </div>
            )}
            
            {card.tema && (
              <div className={styles.metaItem}>
                <BookOpen size={16} />
                <div>
                  <span className={styles.metaLabel}>Tema</span>
                  <span className={styles.metaValue}>{card.tema}</span>
                </div>
              </div>
            )}
            
            {card.creatorName && (
              <div className={styles.metaItem}>
                <User size={16} />
                <div>
                  <span className={styles.metaLabel}>Creado por</span>
                  <span className={styles.metaValue}>{card.creatorName}</span>
                </div>
              </div>
            )}
            
            {card.likesCount !== undefined && (
              <div className={styles.metaItem}>
                <Heart size={16} />
                <div>
                  <span className={styles.metaLabel}>Likes</span>
                  <span className={styles.metaValue}>{card.likesCount}</span>
                </div>
              </div>
            )}
            
            {card.type === "flashcard" && card.totalCards && (
              <div className={styles.metaItem}>
                <Hash size={16} />
                <div>
                  <span className={styles.metaLabel}>Tarjetas</span>
                  <span className={styles.metaValue}>{card.totalCards}</span>
                </div>
              </div>
            )}
            
            {card.type === "quiz" && card.totalQuestions && (
              <div className={styles.metaItem}>
                <Hash size={16} />
                <div>
                  <span className={styles.metaLabel}>Preguntas</span>
                  <span className={styles.metaValue}>{card.totalQuestions}</span>
                </div>
              </div>
            )}
            
            {card.type === "quiz" && card.difficulty && (
              <div className={styles.metaItem}>
                <Hash size={16} />
                <div>
                  <span className={styles.metaLabel}>Dificultad</span>
                  <span className={styles.metaValue}>{card.difficulty}</span>
                </div>
              </div>
            )}
            
            {card.type === "note" && card.contentsCount && (
              <div className={styles.metaItem}>
                <Hash size={16} />
                <div>
                  <span className={styles.metaLabel}>Secciones</span>
                  <span className={styles.metaValue}>{card.contentsCount}</span>
                </div>
              </div>
            )}
            
            {card.createdAt && (
              <div className={styles.metaItem}>
                <Calendar size={16} />
                <div>
                  <span className={styles.metaLabel}>Creado</span>
                  <span className={styles.metaValue}>
                    {new Date(card.createdAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Code Section - inline with metadata style */}
          {card.code && (
            <div className={styles.codeSection}>
              <div className={styles.codeItem}>
                <Hash size={16} />
                <div>
                  <span className={styles.metaLabel}>Código de acceso</span>
                  <div className={styles.codeContainer}>
                    <code className={styles.code}>{card.code}</code>
                    <button
                      className={styles.copyCodeBtn}
                      onClick={handleCopyCode}
                      type="button"
                      aria-label="Copiar código"
                    >
                      {copied ? (
                        <span className={styles.copiedText}>✓</span>
                      ) : (
                        <ClipboardCopy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <button
            className={styles.primaryAction}
            onClick={() => {
              onViewContent(card.id);
              onClose();
            }}
            type="button"
          >
            <Eye size={18} />
            <span>Ver contenido</span>
          </button>
          
          {isOwner && onDelete && (
            <button
              className={styles.dangerAction}
              onClick={() => {
                onDelete(card.id);
                onClose();
              }}
              type="button"
            >
              <Trash2 size={16} />
              <span>Eliminar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
