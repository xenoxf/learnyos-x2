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
  Check,
  Sparkles,
  Code,
  Info,
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

  const getTypeConfig = () => {
    switch (card.type) {
      case "flashcard":
        return {
          label: "FLASHCARD",
          emoji: "🃏",
          gradient: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20",
        };
      case "quiz":
        return {
          label: "QUIZ",
          emoji: "❓",
          gradient: "from-purple-500 to-pink-500",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/20",
        };
      case "note":
        return {
          label: "NOTA",
          emoji: "📝",
          gradient: "from-green-500 to-emerald-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20",
        };
    }
  };

  const typeConfig = getTypeConfig();

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Animated Background Gradient */}
        <div className={styles.modalGradient} />

        {/* Header with Type Badge */}
        <div className={styles.header}>
          <div className={styles.typeBadge}>
            <span className={styles.typeEmoji}>{typeConfig.emoji}</span>
            <span className={styles.typeLabel}>{typeConfig.label}</span>
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

        {/* Scrollable Content */}
        <div className={styles.content}>
          {/* Title Section */}
          <div className={styles.titleSection}>
            <h2 className={styles.title}>{card.title}</h2>
            {card.description && (
              <p className={styles.description}>{card.description}</p>
            )}
          </div>

          {/* Quick Stats Bar */}
          <div className={styles.statsBar}>
            {card.type === "flashcard" && card.totalCards && (
              <div className={styles.statItem}>
                <Hash size={16} />
                <span className={styles.statValue}>{card.totalCards}</span>
                <span className={styles.statLabel}>Tarjetas</span>
              </div>
            )}
            {card.type === "quiz" && card.totalQuestions && (
              <div className={styles.statItem}>
                <Hash size={16} />
                <span className={styles.statValue}>{card.totalQuestions}</span>
                <span className={styles.statLabel}>Preguntas</span>
              </div>
            )}
            {card.type === "note" && card.contentsCount && (
              <div className={styles.statItem}>
                <Hash size={16} />
                <span className={styles.statValue}>{card.contentsCount}</span>
                <span className={styles.statLabel}>Secciones</span>
              </div>
            )}
            {card.likesCount !== undefined && (
              <div className={styles.statItem}>
                <Heart size={16} />
                <span className={styles.statValue}>{card.likesCount}</span>
                <span className={styles.statLabel}>Likes</span>
              </div>
            )}
          </div>

          {/* Metadata Grid - Redesigned */}
          <div className={styles.metadataGrid}>
            {card.area && (
              <div className={styles.metaCard}>
                <div className={styles.metaCardIcon}>
                  <Tag size={18} />
                </div>
                <div className={styles.metaCardContent}>
                  <span className={styles.metaLabel}>Área</span>
                  <span className={styles.metaValue}>{card.area}</span>
                </div>
              </div>
            )}
            {card.tema && (
              <div className={styles.metaCard}>
                <div className={styles.metaCardIcon}>
                  <BookOpen size={18} />
                </div>
                <div className={styles.metaCardContent}>
                  <span className={styles.metaLabel}>Tema</span>
                  <span className={styles.metaValue}>{card.tema}</span>
                </div>
              </div>
            )}
            {card.creatorName && (
              <div className={styles.metaCard}>
                <div className={styles.metaCardIcon}>
                  <User size={18} />
                </div>
                <div className={styles.metaCardContent}>
                  <span className={styles.metaLabel}>Creador</span>
                  <span className={styles.metaValue}>{card.creatorName}</span>
                </div>
              </div>
            )}
            {card.difficulty && (
              <div className={styles.metaCard}>
                <div className={styles.metaCardIcon}>
                  <Sparkles size={18} />
                </div>
                <div className={styles.metaCardContent}>
                  <span className={styles.metaLabel}>Dificultad</span>
                  <span className={styles.metaValue}>{card.difficulty}</span>
                </div>
              </div>
            )}
            {card.createdAt && (
              <div className={styles.metaCard}>
                <div className={styles.metaCardIcon}>
                  <Calendar size={18} />
                </div>
                <div className={styles.metaCardContent}>
                  <span className={styles.metaLabel}>Creado</span>
                  <span className={styles.metaValue}>
                    {formatDate(card.createdAt)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Code Section - Enhanced */}
          {card.code && (
            <div className={styles.codeSection}>
              <div className={styles.codeHeader}>
                <Code size={16} />
                <span className={styles.codeTitle}>Código de acceso</span>
              </div>
              <div className={styles.codeBox}>
                <code className={styles.code}>{card.code}</code>
                <button
                  className={styles.copyBtn}
                  onClick={handleCopyCode}
                  type="button"
                  aria-label="Copiar código"
                >
                  {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
                </button>
              </div>
              {copied && (
                <div className={styles.copiedMessage}>
                  ✓ Código copiado al portapapeles
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions - Redesigned */}
        <div className={styles.footer}>
          <button
            className={styles.primaryAction}
            onClick={() => {
              onViewContent(card.id);
              onClose();
            }}
            type="button"
          >
            <Eye size={20} />
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
              <Trash2 size={18} />
              <span>Eliminar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
