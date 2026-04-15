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
  Sparkles,
  Code,
  ArrowRight,
  Clock,
  BarChart3,
} from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/espacio/funcionesCardModal.module.css";

export interface FuncionesCardData {
  id: number;
  title: string;
  description?: string;
  code?: string;
  area?: string;
  tema?: string;
  creatorName?: string;
  likesCount?: number;
  type: "flashcard" | "quiz" | "icfes" | "note";
  totalCards?: number;
  totalQuestions?: number;
  contentsCount?: number;
  difficulty?: string;
  createdAt?: string;
}

interface FuncionesCardModalProps {
  card: FuncionesCardData;
  onClose: () => void;
  onViewContent: (id: number) => void;
  onDelete?: (id: number) => void;
  isOwner?: boolean;
}

export function FuncionesCardModal({
  card,
  onClose,
  onViewContent,
  onDelete,
  isOwner = true,
}: FuncionesCardModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  const handleViewContent = useCallback(() => {
    onViewContent(card.id);
    onClose();
  }, [card.id, onViewContent, onClose]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(card.id);
      onClose();
    }
  }, [card.id, onDelete, onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [handleClose]);

  const getTypeConfig = () => {
    switch (card.type) {
      case "flashcard":
        return {
          label: "Flashcard",
          icon: "🃏",
          color: "blue",
        };
      case "quiz":
        return {
          label: "Quiz",
          icon: "❓",
          color: "purple",
        };
      case "icfes":
        return {
          label: "ICFES",
          icon: "📋",
          color: "indigo",
        };
      case "note":
        return {
          label: "Nota",
          icon: "📝",
          color: "green",
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

  const getDifficultyConfig = (difficulty?: string) => {
    if (!difficulty) return null;
    const config = {
      easy: { label: "Fácil", color: "success", icon: "✓" },
      medium: { label: "Medio", color: "warning", icon: "◆" },
      hard: { label: "Difícil", color: "destructive", icon: "✦" },
    };
    return config[difficulty as keyof typeof config] || null;
  };

  const difficultyConfig = getDifficultyConfig(card.difficulty);

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ""}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modal} ${isClosing ? styles.modalClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.typeIcon}>{typeConfig.icon}</span>
            <div className={styles.headerInfo}>
              <span className={styles.typeLabel}>{typeConfig.label}</span>
              {card.code && (
                <span className={styles.codeBadge}>
                  <Code size={12} />
                  {card.code}
                </span>
              )}
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            type="button"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={styles.content}>
          {/* Title & Description */}
          <div className={styles.titleSection}>
            <h2 className={styles.title}>{card.title}</h2>
            {card.description && (
              <p className={styles.description}>{card.description}</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className={styles.statsRow}>
            {card.type === "flashcard" && card.totalCards && (
              <div className={styles.statChip}>
                <Hash size={14} />
                <span>{card.totalCards} tarjetas</span>
              </div>
            )}
            {(card.type === "quiz" || card.type === "icfes") && card.totalQuestions && (
              <div className={styles.statChip}>
                <BarChart3 size={14} />
                <span>{card.totalQuestions} preguntas</span>
              </div>
            )}
            {card.type === "note" && card.contentsCount && (
              <div className={styles.statChip}>
                <BookOpen size={14} />
                <span>{card.contentsCount} secciones</span>
              </div>
            )}
            {card.likesCount !== undefined && card.likesCount > 0 && (
              <div className={styles.statChip}>
                <Heart size={14} />
                <span>{card.likesCount}</span>
              </div>
            )}
            {difficultyConfig && (
              <div className={`${styles.statChip} ${styles[`difficulty_${difficultyConfig.color}`]}`}>
                <Sparkles size={14} />
                <span>{difficultyConfig.label}</span>
              </div>
            )}
          </div>

          {/* Primary Metadata Card - Topics */}
          {(card.area || card.tema) && (
            <div className={styles.metadataCard}>
              <div className={styles.metadataHeader}>
                <Tag size={16} />
                <span className={styles.metadataTitle}>Información Académica</span>
              </div>
              <div className={styles.metadataBadges}>
                {card.area && (
                  <div className={styles.badge}>
                    <span className={styles.badgeLabel}>Área:</span>
                    <span className={styles.badgeValue}>{card.area}</span>
                  </div>
                )}
                {card.tema && (
                  <div className={styles.badge}>
                    <span className={styles.badgeLabel}>Tema:</span>
                    <span className={styles.badgeValue}>{card.tema}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Secondary Metadata Grid - Quick Info */}
          <div className={styles.metadataGrid}>
            {card.code && (
              <div className={styles.metadataItem}>
                <div className={styles.metadataIcon}>
                  <Code size={18} />
                </div>
                <div className={styles.metadataText}>
                  <span className={styles.metadataLabel}>Código</span>
                  <span className={styles.metadataCode}>{card.code}</span>
                </div>
              </div>
            )}
            {card.creatorName && (
              <div className={styles.metadataItem}>
                <div className={styles.metadataIcon}>
                  <User size={18} />
                </div>
                <div className={styles.metadataText}>
                  <span className={styles.metadataLabel}>Creador</span>
                  <span className={styles.metadataValue}>{card.creatorName}</span>
                </div>
              </div>
            )}
            {card.createdAt && (
              <div className={styles.metadataItem}>
                <div className={styles.metadataIcon}>
                  <Calendar size={18} />
                </div>
                <div className={styles.metadataText}>
                  <span className={styles.metadataLabel}>Creado el</span>
                  <span className={styles.metadataValue}>
                    {formatDate(card.createdAt)}
                  </span>
                </div>
              </div>
            )}
            {card.type === "quiz" && card.difficulty && (
              <div className={styles.metadataItem}>
                <div className={styles.metadataIcon}>
                  <Sparkles size={18} />
                </div>
                <div className={styles.metadataText}>
                  <span className={styles.metadataLabel}>Dificultad</span>
                  <span className={`${styles.metadataValue} ${styles.difficultyText}`}>
                    {difficultyConfig?.label || card.difficulty}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <button
            className={styles.primaryBtn}
            onClick={handleViewContent}
            type="button"
          >
            <Eye size={18} />
            <span>Ver contenido</span>
            <ArrowRight size={16} />
          </button>
          {isOwner && onDelete && (
            <button
              className={styles.dangerBtn}
              onClick={handleDelete}
              type="button"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
