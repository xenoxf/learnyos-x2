import type { CardKlek } from "@/types";
import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import styles from "@/styles/flashCards/CardKlek.module.css";
import { toast } from "@/hooks/useLocalToast";
import { apiService } from "@/services/apiService";
import MarkdownRenderer from "../MarkdownRenderer";

interface CardKlekProps {
  cardId: number;
  onClose: () => void;
}

const CardKlekComponent: React.FC<CardKlekProps> = ({ cardId, onClose }) => {
  ;
  const [card, setCard] = useState<CardKlek | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCardKlek(cardId);
      setCard(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar mazo";
      setError(message);
      toast.info("", );
    } finally {
      setLoading(false);
    }
  }, [cardId, toast]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  }, []);

  const handlePrevious = useCallback(() => {
    if (!card?.flashcards) return;
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : card.flashcards.length - 1,
    );
    setIsFlipped(false);
  }, [card]);

  const handleNext = useCallback(() => {
    if (!card?.flashcards) return;
    setCurrentIndex((prev) =>
      prev < card.flashcards.length - 1 ? prev + 1 : 0,
    );
    setIsFlipped(false);
  }, [card]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.emptyContent}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>Error</h2>
            <button className={styles.closeBtn} onClick={onClose} type="button">
              ✕
            </button>
          </div>
          <div className={styles.emptyContent}>
            <p>{error || "No se pudo cargar el mazo"}</p>
            <button className={styles.retryBtn} onClick={loadCard} type="button">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const flashcards = card.flashcards || [];
  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;

  if (!currentCard && totalCards === 0) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>{card.title}</h2>
            <button className={styles.closeBtn} onClick={onClose} type="button">
              ✕
            </button>
          </div>
          <div className={styles.emptyContent}>
            <p>No hay tarjetas en este mazo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>{card.title}</h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Flashcard Container */}
        <div className={styles.cardContainer}>
          <div
            className={`${styles.flashCard} ${isFlipped ? styles.flipped : ""}`}
            onClick={handleFlip}
            onKeyPress={handleKeyPress}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? "Ver pregunta" : "Ver respuesta"}
          >
            {/* Front */}
            <div className={styles.flashCardFace}>
              <div className={styles.faceContent}>
                <span className={styles.faceLabel}>Pregunta</span>
                <p className={styles.faceText}> <MarkdownRenderer content={currentCard.front} /></p>
              </div>
            </div>

            {/* Back */}
            <div className={styles.flashCardFace}>
              <div className={styles.faceContent}>
                <span className={styles.faceLabel}>Respuesta</span>
                <p className={styles.faceText}><MarkdownRenderer content={currentCard.back} /></p>
              </div>
            </div>
          </div>

          <div className={styles.flipHint}>
            {isFlipped
              ? "Clic para ver la pregunta"
              : "Clic para ver la respuesta"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${((currentIndex + 1) / totalCards) * 100}%`,
            }}
          />
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.navBtn}
            onClick={handlePrevious}
            disabled={totalCards <= 1}
            title="Anterior"
            aria-label="Anterior"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            className={styles.resetBtn}
            onClick={handleReset}
            title="Reiniciar"
            aria-label="Reiniciar"
            type="button"
          >
            <RotateCcw size={20} />
          </button>

          <div className={styles.counter}>
            <span>{currentIndex + 1}</span>
            <span>/</span>
            <span>{totalCards}</span>
          </div>

          <button
            className={styles.navBtn}
            onClick={handleNext}
            disabled={totalCards <= 1}
            title="Siguiente"
            aria-label="Siguiente"
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardKlekComponent;
