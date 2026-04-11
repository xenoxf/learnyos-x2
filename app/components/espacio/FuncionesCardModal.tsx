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
  type: "flashcard" | "quiz" | "note";
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

          {/* Stats Row */}
          <div className={styles.statsRow}>
            {card.type === "flashcard" && card.totalCards && (
              <div className={styles.statChip}>
                <Hash size={14} />
                <span>{card.totalCards} tarjetas</span>
              </div>
            )}
            {card.type === "quiz" && card.totalQuestions && (
              <div className={styles.statChip}>
                <Hash size={14} />
                <span>{card.totalQuestions} preguntas</span>
              </div>
            )}
            {card.type === "note" && card.contentsCount && (
              <div className={styles.statChip}>
                <Hash size={14} />
                <span>{card.contentsCount} secciones</span>
              </div>
            )}
            {card.likesCount !== undefined && card.likesCount > 0 && (
              <div className={styles.statChip}>
                <Heart size={14} />
                <span>{card.likesCount}</span>
              </div>
            )}
            {card.difficulty && (
              <div className={styles.statChip}>
                <Sparkles size={14} />
                <span>{card.difficulty}</span>
              </div>
            )}
          </div>

          {/* Metadata Cards */}
          <div className={styles.metadataList}>
            {card.area && (
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>
                  <Tag size={18} />
                </div>
                <div className={styles.metaContent}>
                  <span className={styles.metaLabel}>Área</span>
                  <span className={styles.metaValue}>{card.area}</span>
                </div>
              </div>
            )}
            {card.tema && (
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>
                  <BookOpen size={18} />
                </div>
                <div className={styles.metaContent}>
                  <span className={styles.metaLabel}>Tema</span>
                  <span className={styles.metaValue}>{card.tema}</span>
                </div>
              </div>
            )}
            {card.creatorName && (
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>
                  <User size={18} />
                </div>
                <div className={styles.metaContent}>
                  <span className={styles.metaLabel}>Creador</span>
                  <span className={styles.metaValue}>{card.creatorName}</span>
                </div>
              </div>
            )}
            {card.createdAt && (
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>
                  <Calendar size={18} />
                </div>
                <div className={styles.metaContent}>
                  <span className={styles.metaLabel}>Creado el</span>
                  <span className={styles.metaValue}>
                    {formatDate(card.createdAt)}
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
