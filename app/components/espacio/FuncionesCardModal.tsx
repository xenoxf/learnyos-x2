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

        {/* Main Content Area - 2 Columns on Desktop */}
        <div className={styles.modalBody}>
          <div className={styles.mainGrid}>
            {/* Left Column: Title, Description, Academic Info */}
            <div className={styles.leftColumn}>
              <div className={styles.titleSection}>
                <h2 className={styles.title}>{card.title}</h2>
                {card.description && (
                  <p className={styles.description}>{card.description}</p>
                )}
              </div>

              {(card.area || card.tema || card.code) && (
                <div className={styles.academicSection}>
                  <div className={styles.sectionHeader}>
                    <BookOpen size={16} />
                    <span>Información del Contenido</span>
                  </div>
                  <div className={styles.academicGrid}>
                    {card.area && (
                      <div className={styles.academicItem}>
                        <span className={styles.academicLabel}>Área</span>
                        <span className={styles.academicValue}>{card.area}</span>
                      </div>
                    )}
                    {card.tema && (
                      <div className={styles.academicItem}>
                        <span className={styles.academicLabel}>Tema</span>
                        <span className={styles.academicValue}>{card.tema}</span>
                      </div>
                    )}
                    {(isOwner || card.code) && card.code && (
                      <div className={styles.academicItem}>
                        <span className={styles.academicLabel}>Código de Acceso</span>
                        <span className={styles.codeBadge}>
                          <Code size={12} />
                          {card.code}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Metadata Cards & Quick Stats */}
            <div className={styles.rightColumn}>
              <div className={styles.metadataCard}>
                <div className={styles.metaRow}>
                  <div className={styles.metaIcon}>
                    <Hash size={16} />
                  </div>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Contenido</span>
                    <span className={styles.metaValue}>
                      {card.type === "flashcard" && `${card.totalCards || 0} tarjetas`}
                      {(card.type === "quiz" || card.type === "icfes") && `${card.totalQuestions || 0} preguntas`}
                      {card.type === "note" && `${card.contentsCount || 0} secciones`}
                    </span>
                  </div>
                </div>

                {card.difficulty && (
                  <div className={styles.metaRow}>
                    <div className={styles.metaIcon}>
                      <Sparkles size={16} />
                    </div>
                    <div className={styles.metaContent}>
                      <span className={styles.metaLabel}>Dificultad</span>
                      <span className={`${styles.metaValue} ${styles[`diff_${card.difficulty}`]}`}>
                        {difficultyConfig?.label || card.difficulty}
                      </span>
                    </div>
                  </div>
                )}

                <div className={styles.metaRow}>
                  <div className={styles.metaIcon}>
                    <User size={16} />
                  </div>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Creador</span>
                    <span className={styles.metaValue}>{card.creatorName || "Anónimo"}</span>
                  </div>
                </div>

                <div className={styles.metaRow}>
                  <div className={styles.metaIcon}>
                    <Calendar size={16} />
                  </div>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Fecha</span>
                    <span className={styles.metaValue}>{formatDate(card.createdAt)}</span>
                  </div>
                </div>

                {card.likesCount !== undefined && card.likesCount > 0 && (
                  <div className={styles.metaRow}>
                    <div className={styles.metaIcon}>
                      <Heart size={16} />
                    </div>
                    <div className={styles.metaContent}>
                      <span className={styles.metaLabel}>Valoración</span>
                      <span className={styles.metaValue}>{card.likesCount} me gusta</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
