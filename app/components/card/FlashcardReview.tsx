"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronRight, RotateCcw, Sparkles, Brain, TrendingUp, Clock } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { cardsService } from "@/services/cardsService";
import type { DueReviewDeck, ReviewStats } from "@/types";
import MarkdownRenderer from "../MarkdownRenderer";

const QUALITY_LABELS: Record<number, { label: string; color: string; icon: string }> = {
  0: { label: "Bloqueo total", color: "bg-red-500", icon: "❌" },
  1: { label: "Incorrecta, recordé al ver respuesta", color: "bg-red-400", icon: "⚠️" },
  2: { label: "Incorrecta, pero familiar", color: "bg-orange-400", icon: "🤔" },
  3: { label: "Correcta con dificultad", color: "bg-yellow-400", icon: "💪" },
  4: { label: "Correcta tras dudar", color: "bg-lime-400", icon: "👍" },
  5: { label: "Perfecta", color: "bg-green-500", icon: "⭐" },
};

export default function FlashcardReview() {
  const [decks, setDecks] = useState<DueReviewDeck[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rated, setRated] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dueData, statsData] = await Promise.all([
        cardsService.getDueReviews(),
        cardsService.getReviewStats(),
      ]);
      setDecks(dueData || []);
      setStats(statsData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar repaso";
      setError(msg);
      toast.error("Error", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalDueCards = useMemo(() => {
    return decks.reduce((sum, d) => sum + d.flashcards.length, 0);
  }, [decks]);

  const currentDeck = decks[currentDeckIndex];
  const currentCard = currentDeck?.flashcards[currentCardIndex];

  const progressPercent = totalDueCards > 0
    ? Math.round((reviewedCount / totalDueCards) * 100)
    : 0;

  const handleFlip = useCallback(() => {
    if (!rated) {
      setIsFlipped((prev) => !prev);
    }
  }, [rated]);

  const handleRate = useCallback(async (quality: number) => {
    if (!currentCard || !currentDeck || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await cardsService.reviewFlashcard(currentCard.id, quality);
      setRated(true);
      setReviewedCount((prev) => prev + 1);
      toast.success("", quality >= 3 ? "¡Bien hecho!" : "Sigue practicando");
    } catch (err) {
      toast.error("Error", "No se pudo guardar la calificación");
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCard, currentDeck, isSubmitting]);

  const handleNext = useCallback(() => {
    // Find next unrated card
    let found = false;
    for (let d = currentDeckIndex; d < decks.length; d++) {
      const deck = decks[d];
      for (let c = (d === currentDeckIndex ? currentCardIndex + 1 : 0); c < deck.flashcards.length; c++) {
        setCurrentDeckIndex(d);
        setCurrentCardIndex(c);
        setIsFlipped(false);
        setRated(false);
        found = true;
        return;
      }
    }
    if (!found) {
      setCompleted(true);
    }
  }, [decks, currentDeckIndex, currentCardIndex]);

  const handleRestart = useCallback(async () => {
    setCurrentDeckIndex(0);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setRated(false);
    setReviewedCount(0);
    setCompleted(false);
    await loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
        <p className="text-destructive text-lg font-medium">{error}</p>
        <button
          onClick={loadData}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          type="button"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (completed || totalDueCards === 0) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Sparkles size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold">
            {totalDueCards === 0 ? "¡Sin tarjetas pendientes!" : "¡Repaso completado!"}
          </h2>
          <p className="text-muted-foreground">
            {totalDueCards === 0
              ? "No hay tarjetas para repasar hoy. Vuelve más tarde."
              : `Has repasado ${reviewedCount} tarjetas hoy.`}
          </p>
          {totalDueCards > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border rounded-xl p-4 text-center">
                <Brain size={24} className="mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{reviewedCount}</div>
                <div className="text-xs text-muted-foreground">Repasadas hoy</div>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <TrendingUp size={24} className="mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats?.averageEaseFactor?.toFixed(1) || "N/A"}</div>
                <div className="text-xs text-muted-foreground">Factor de facilidad</div>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            {totalDueCards > 0 && (
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                type="button"
              >
                <RotateCcw size={16} />
                Repasar de nuevo
              </button>
            )}
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
              type="button"
            >
              <Clock size={16} />
              Verificar pendientes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard || !currentDeck) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No hay tarjetas disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Repaso del día</h1>
          <p className="text-sm text-muted-foreground">
            {totalDueCards} tarjetas pendientes · {reviewedCount} repasadas
          </p>
        </div>
        {stats && (
          <div className="text-right text-xs text-muted-foreground">
            <div>FE: {stats.averageEaseFactor?.toFixed(1)}</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Card */}
      <div className="perspective-[2000px]">
        <div
          className={`relative w-full min-h-[320px] cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          onClick={handleFlip}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFlip(); } }}
          role="button"
          tabIndex={0}
          aria-label={isFlipped ? "Ver pregunta" : "Ver respuesta"}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] bg-card border rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded mb-4">
              Pregunta
            </span>
            <div className="text-lg text-center font-medium max-w-full overflow-y-auto">
              <MarkdownRenderer content={currentCard.front} />
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-card to-muted/10 border rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded mb-4">
              Respuesta
            </span>
            <div className="text-lg text-center font-medium max-w-full overflow-y-auto">
              <MarkdownRenderer content={currentCard.back} />
            </div>
          </div>
        </div>
      </div>

      {/* Flip hint */}
      {!isFlipped && (
        <p className="text-center text-sm text-muted-foreground">
          Haz clic para ver la respuesta
        </p>
      )}

      {/* Quality rating */}
      {isFlipped && !rated && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-center">¿Cómo fue tu recuerdo?</p>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((quality) => {
              const q = QUALITY_LABELS[quality];
              return (
                <button
                  key={quality}
                  onClick={() => handleRate(quality)}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${quality >= 3 ? "border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950" : "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950"}`}
                  type="button"
                  title={q.label}
                >
                  <span className="text-lg">{q.icon}</span>
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">
                    {q.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Next button */}
      {rated && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
          type="button"
        >
          Siguiente
          <ChevronRight size={20} />
        </button>
      )}

      {/* Deck info */}
      <div className="text-center text-xs text-muted-foreground">
        Mazo: {currentDeck.cardTitle} · Tarjeta {reviewedCount + 1}/{totalDueCards}
      </div>
    </div>
  );
}
