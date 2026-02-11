"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCw,
  Loader,
  Plus,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import styles from "@/styles/flashcards.module.css";
import DashboardLayout from "../layaut";
import type { FlashCard } from "@/types";
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [showGeneratorForm, setShowGeneratorForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getFlashcards();
      const typedData = Array.isArray(data) ? data : [];
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
  }, [toast]);

  const handleGenerateFlashcards = async () => {
    if (!topic.trim() || quantity <= 0) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa un tema y cantidad válida",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const newFlashcards = await apiService.generateFlashcards({
        topic: topic.trim(),
        quantity,
      });

      if (newFlashcards?.cards && Array.isArray(newFlashcards.cards)) {
        setFlashcards((prev) => [...newFlashcards.cards, ...prev]);
        setTopic("");
        setQuantity(5);
        setShowGeneratorForm(false);
        toast({
          title: "¡Éxito!",
          description: `Se generaron ${newFlashcards.cards.length} flashcards correctamente`,
        });
      }
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar las flashcards",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
      setCurrentIndex(
        Math.max(0, Math.min(currentIndex, newFlashcards.length - 1)),
      );
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

  const filteredFlashcards = flashcards.filter(
    (card) =>
      (card.question || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.answer || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader className="w-8 h-8 animate-spin" />
            <p>Cargando tus flashcards...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (flashcards.length === 0) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <section className={styles.header}>
            <h1 className={styles.title}>🃏 Flashcards</h1>
            <p className={styles.description}>
              Tarjetas de estudio con repetición espaciada
            </p>
          </section>

          <Card className="p-12 text-center">
            <p className="mb-4">No tienes flashcards aún</p>
            <div className="flex gap-2">
              <Button onClick={loadFlashcards} variant="outline">
                <RotateCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button onClick={() => setShowGeneratorForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generar Flashcards
              </Button>
            </div>
          </Card>

          {showGeneratorForm && (
            <Card className="mt-6 p-6">
              <h2 className="mb-4 font-semibold">Generar Flashcards con IA</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tema</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Historia de España"
                    disabled={isGenerating}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cantidad de tarjetas</label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 5))}
                    min="1"
                    max="50"
                    disabled={isGenerating}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleGenerateFlashcards} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generar
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowGeneratorForm(false)}
                    variant="outline"
                    disabled={isGenerating}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  const current = flashcards[currentIndex];
  const progress = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  return (
    <DashboardLayout>
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
          <div className="absolute bottom-4 right-4 text-xs">
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

          <div className="flex items-center justify-center px-4 text-sm font-medium">
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
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={loadFlashcards} variant="secondary" size="sm">
            <RotateCw className="w-4 h-4 mr-2" />
            Recargar mazo
          </Button>
          <Button onClick={() => setShowGeneratorForm(!showGeneratorForm)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Generar
          </Button>
        </div>

        {showGeneratorForm && (
          <Card className="mt-6 p-6">
            <h3 className="mb-4 font-semibold">Generar Nuevas Flashcards</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tema</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej: Biología Celular"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cantidad</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 5))}
                  min="1"
                  max="50"
                  disabled={isGenerating}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerateFlashcards} disabled={isGenerating} className="flex-1">
                  {isGenerating ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generar
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowGeneratorForm(false)}
                  variant="outline"
                  disabled={isGenerating}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
