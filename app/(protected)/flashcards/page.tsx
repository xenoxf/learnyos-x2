"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Trash2, RotateCw, Loader } from "lucide-react";
import styles from "@/styles/flashcards.module.css";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFlashcards();
      const typedData = (Array.isArray(data) ? data : []).map((card: any) => ({
        id: card.id,
        question: card.question || card.front || "",
        answer: card.answer || card.back || "",
      }));
      setFlashcards(typedData);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error: any) {
      console.error("Error loading flashcards:", error);
      toast({
        title: "Error",
        description: error.message || "No pudimos cargar tus tarjetas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      toast({
        title: "Fin del mazo",
        description: "¡Has llegado a la última tarjeta!",
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await apiService.deleteFlashcard(id);
      const newFlashcards = flashcards.filter((f) => f.id !== id);
      setFlashcards(newFlashcards);
      setCurrentIndex(Math.max(0, Math.min(currentIndex, newFlashcards.length - 1)));
      toast({
        title: "Tarjeta eliminada",
        description: "La tarjeta ha sido removida correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la tarjeta",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando tus flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🃏 Flashcards</h1>
          <p className={styles.description}>Tarjetas de estudio con repetición espaciada</p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No tienes flashcards aún</p>
          <Button onClick={loadFlashcards} variant="outline">
            <RotateCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </Card>
      </div>
    );
  }

  const current = flashcards[currentIndex];
  const progress = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>🃏 Flashcards</h1>
        <p className={styles.description}>
          {currentIndex + 1} de {flashcards.length} • {progress}%
        </p>
      </section>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Flip Card */}
      <Card
        onClick={() => setIsFlipped(!isFlipped)}
        className={`${styles.flipCard} ${isFlipped ? styles.flipped : ""} cursor-pointer mb-8 h-64 flex items-center justify-center`}
      >
        <div className={styles.flipCardInner}>
          <div className={styles.flipCardFront}>
            <p className={styles.cardLabel}>Pregunta</p>
            <p className={styles.cardContent}>{current.question}</p>
          </div>
          <div className={styles.flipCardBack}>
            <p className={styles.cardLabel}>Respuesta</p>
            <p className={styles.cardContent}>{current.answer}</p>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
          {isFlipped ? "Ver pregunta" : "Ver respuesta"}
        </div>
      </Card>

      {/* Controls */}
      <div className={styles.controls}>
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center justify-center px-4 text-sm font-medium text-muted-foreground">
          {currentIndex + 1} / {flashcards.length}
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex-1"
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>

        <Button
          variant="destructive"
          onClick={() => handleDelete(current.id)}
          disabled={deleting === current.id}
          size="icon"
        >
          {deleting === current.id ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-center">
        <Button onClick={loadFlashcards} variant="secondary" size="sm">
          <RotateCw className="w-4 h-4 mr-2" />
          Recargar mazo
        </Button>
      </div>
    </div>
  );
}