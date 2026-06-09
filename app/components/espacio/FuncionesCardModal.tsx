"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  X,
  BookOpen,
  User,
  Calendar,
  Hash,
  Eye,
  Trash2,
  Sparkles,
  Code,
  ArrowRight,
  Target,
  Layers,
  FileText,
} from "lucide-react";
import styles from "./FuncionesCardModal.module.css";
import { UnifiedCardData } from "@/types";

interface FuncionesCardModalProps {
  card: UnifiedCardData;
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

  const getContentType = () => {
    if (card.type) return card.type;
    if (card.totalQuestions !== undefined) return "exam";
    if (card.totalCards !== undefined) return "flashcard";
    if (card.contentsCount !== undefined) return "note";
    return "note";
  };

  const contentType = getContentType();

  const getTypeConfig = () => {
    switch (contentType) {
      case "flashcard": return { label: "Mazo de Flashcards", icon: <Layers size={18} />, emoji: "🃏", color: "blue" };
      case "quiz":
      case "icfes":
      case "exam": return { label: card.type === "icfes" ? "Examen ICFES" : "Quiz Interactivo", icon: <Target size={18} />, emoji: "❓", color: "purple" };
      case "note": return { label: "Nota de Estudio", icon: <FileText size={18} />, emoji: "📝", color: "green" };
      default: return { label: "Contenido", icon: <BookOpen size={18} />, emoji: "📚", color: "gray" };
    }
  };

  const typeConfig = getTypeConfig();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recientemente";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    const labels: Record<string, string> = {
      very_easy: "Muy Fácil",
      easy: "Fácil",
      medium: "Intermedio",
      hard: "Difícil",
      very_hard: "Experto",
      expert: "Maestro",
    };
    return difficulty ? labels[difficulty] || difficulty : "N/A";
  };

  const getLengthInfo = () => {
    if (card.totalQuestions !== undefined) return { value: card.totalQuestions, label: "Preguntas", icon: <Target size={16} /> };
    if (card.totalCards !== undefined) return { value: card.totalCards, label: "Tarjetas", icon: <Layers size={16} /> };
    if (card.contentsCount !== undefined) return { value: card.contentsCount, label: "Secciones", icon: <FileText size={16} /> };
    if (card.lenght !== undefined) return { value: card.lenght, label: "Elementos", icon: <Hash size={16} /> };
    return { value: 0, label: "Elementos", icon: <Hash size={16} /> };
  };

  const lengthInfo = getLengthInfo();

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
            <div className={`${styles.typeIcon} ${styles[typeConfig.color]}`}>
              {typeConfig.icon}
            </div>
            <div className={styles.headerInfo}>
              <span className={styles.typeLabel}>{typeConfig.label}</span>
              {card.code && (
                <div className={styles.codeBadge}>
                  <Code size={12} />
                  <span>CÓDIGO: {card.code}</span>
                </div>
              )}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} type="button" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className={styles.mainGrid}>
            <div className={styles.leftColumn}>
              <h2 className={styles.title}>{card.title}</h2>
              <p className={styles.description}>
                {card.description || "Este contenido no tiene una descripción detallada, pero está listo para ayudarte en tu aprendizaje."}
              </p>

              <div className={styles.academicSection}>
                <div className={styles.sectionHeader}>
                  <BookOpen size={16} />
                  <span>Contexto Académico</span>
                </div>
                <div className={styles.academicGrid}>
                  <div className={styles.academicItem}>
                    <span className={styles.academicLabel}>Área de conocimiento</span>
                    <span className={styles.academicValue}>{card.area || "General / Multidisciplinar"}</span>
                  </div>
                  <div className={styles.academicItem}>
                    <span className={styles.academicLabel}>Tema específico</span>
                    <span className={styles.academicValue}>{card.tema || "Varios temas relacionados"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.metadataCard}>
                <div className={styles.metaRow}>
                  <div className={styles.metaIcon}>{lengthInfo.icon}</div>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Extensión</span>
                    <span className={styles.metaValue}>{lengthInfo.value} {lengthInfo.label}</span>
                  </div>
                </div>

                {(card.difficulty || card.type === "exam" || card.totalQuestions !== undefined) && (
                  <div className={styles.metaRow}>
                    <div className={styles.metaIcon}><Sparkles size={16} /></div>
                    <div className={styles.metaContent}>
                      <span className={styles.metaLabel}>Dificultad</span>
                      <span className={`${styles.metaValue} ${styles[`diff_${card.difficulty || "medium"}`]}`}>
                        {getDifficultyLabel(card.difficulty || "medium")}
                      </span>
                    </div>
                  </div>
                )}

                <div className={styles.metaRow}>
                  <div className={styles.metaIcon}><User size={16} /></div>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Autoría</span>
                    <span className={styles.metaValue}>{card.creatorName || "Comunidad LearnYos"}</span>
                  </div>
                </div>

                <div className={styles.metaRow}>
                  <div className={styles.metaIcon}><Calendar size={16} /></div>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Fecha de creación</span>
                    <span className={styles.metaValue}>{formatDate(card.createdAt)}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.primaryBtn} onClick={handleViewContent} type="button">
            <Eye size={18} />
            <span>Comenzar a estudiar</span>
            <ArrowRight size={18} className={styles.arrowIcon} />
          </button>

          {isOwner && onDelete && (
            <button
              className={styles.dangerBtn}
              onClick={handleDelete}
              type="button"
              title="Eliminar permanentemente"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
