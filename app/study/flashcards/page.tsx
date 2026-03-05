"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import type {
  FlashCard,
  Card,
  FlashCardDeck,
  GenerateFlashCardData,
  GenerateFlashcardsResponse,
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/flashCards/flashcards.module.css";
import DashboardLayout from "../layaut";
import {
  Loader,
  Book,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Separator } from "@radix-ui/react-dropdown-menu";
import CardContent from "@/components/card/Card";
import CardGrid from "@/components/card/CardGrid";

export default function FlashcardsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Estado
  const [selectedDeck, setSelectedDeck] = useState<FlashCardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [formData, setFormData] = useState<GenerateFlashCardData>({
    topic: "",
    quantity: 10,
  });

  // Queries
  const { data: cards = [], isLoading: isLoadingCards } = useQuery<Card[]>({
    queryKey: ["flashcards"],
    queryFn: () => apiService.getFlashcards(),
  });

  // Extraer flashcards
  const allFlashcards: FlashCard[] = useMemo(
    () => cards.flatMap((card: Card) => card.flashcards || []),
    [cards],
  );

  // Crear deck único
  const currentDeck: FlashCardDeck | null = useMemo(() => {
    if (selectedDeck) return selectedDeck;
    if (allFlashcards.length > 0) {
      return {
        id: 0,
        title: "Todas tus flashcards",
        description: `${allFlashcards.length} tarjetas`,
        totalCards: allFlashcards.length,
        flashcards: allFlashcards,
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  }, [selectedDeck, allFlashcards]);

  const currentCard = currentDeck?.flashcards?.[currentCardIndex];
  const progress = currentDeck?.flashcards
    ? ((currentCardIndex + 1) / currentDeck.flashcards.length) * 100
    : 0;

  // Mutations
  const { mutate: generateFlashcards, isPending: isGenerating } = useMutation<
    GenerateFlashcardsResponse,
    Error,
    GenerateFlashCardData
  >({
    mutationFn: (data) =>
      apiService.generateFlashcards({
        ...data,
        quantity: data.quantity ?? 10,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      if (res.flashcards?.length && res.card) {
        const newDeck: FlashCardDeck = {
          id: res.card.id,
          title: res.card.title,
          description: res.card.description ?? "",
          totalCards: res.totalCreated,
          flashcards: res.flashcards,
          createdAt: new Date().toISOString(),
        };
        setSelectedDeck(newDeck);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowGenerateForm(false);
        toast({
          title: "✨ Éxito",
          description: `Se generaron ${res.totalCreated} flashcards`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleGenerate = useCallback(() => {
    if (!formData.topic?.trim()) {
      toast({
        title: "⚠️ Campos requeridos",
        description: "Por favor ingresa un tema",
        variant: "destructive",
      });
      return;
    }
    generateFlashcards(formData);
  }, [formData, generateFlashcards, toast]);

  const handleNextCard = useCallback(() => {
    if (
      currentDeck?.flashcards &&
      currentCardIndex < currentDeck.flashcards.length - 1
    ) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentDeck, currentCardIndex]);

  const handlePrevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const handleReset = useCallback(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSelectedDeck(null);
  }, []);

  // Render
  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>📚 Flashcards</h1>
            <p className={styles.subtitle}>
              {currentDeck?.totalCards ?? 0} tarjetas disponibles
            </p>
          </div>
          <div className={styles.headerActions}>
            {currentDeck && (
              <button onClick={handleReset} className={styles.formButton}>
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </button>
            )}
          </div>
        </div>

        {isLoadingCards ? (
          <div className={styles.loading}>
            <Loader className={styles.spinner} />
            <p>Cargando flashcards...</p>
          </div>
        ) : !currentDeck ? (
          <div className={styles.mainContent}>
            {/* Sidebar con formulario */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarSection}>
                <div className={styles.sectionHeader}>
                  <Sparkles className="w-4 h-4" />
                  Generar Tarjetas
                </div>
                <div className={styles.sectionContent}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGenerate();
                    }}
                    className={styles.generateForm}
                  >
                    <input
                      type="text"
                      placeholder="Tema o referencia..."
                      value={formData.topic ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                      className={styles.formInput}
                    />
                    <input
                      type="number"
                      placeholder="Cantidad (2-20)"
                      min="2"
                      max="20"
                      value={formData.quantity ?? 10}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: Math.max(
                            2,
                            Math.min(20, parseInt(e.target.value, 10) || 10),
                          ),
                        })
                      }
                      className={styles.formInput}
                    />
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className={styles.formButton}
                    >
                      {isGenerating ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generar
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {allFlashcards.length > 0 && (
                <div className={styles.sidebarSection}>
                  <div className={styles.sectionHeader}>📊 Estadísticas</div>
                  <div className={styles.sectionContent}>
                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <div className={styles.statNumber}>
                          {allFlashcards.length}
                        </div>
                        <div className={styles.statName}>Total</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statNumber}>{cards.length}</div>
                        <div className={styles.statName}>Mazos</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Empty state */}
            <div className={styles.cardViewer}>
              <div className={styles.emptyState}>
                <Book className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>Sin flashcards</h3>
                <p className={styles.emptyDescription}>
                  Genera tu primera tarjeta completando el formulario
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Card Viewer */
          <div className={styles.mainContent}>
            {/* Sidebar de control */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarSection}>
                <div className={styles.sectionHeader}>📈 Progreso</div>
                <div className={styles.sectionContent}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className={styles.progressInfo}>
                    <span>
                      {currentCardIndex + 1} de{" "}
                      {currentDeck?.flashcards?.length ?? 0}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>

              <div className={styles.sidebarSection}>
                <div className={styles.sectionHeader}>⚙️ Opciones</div>
                <div className={styles.sectionContent}>
                  <button onClick={handleReset} className={styles.formButton}>
                    <RotateCcw className="w-4 h-4" />
                    Reiniciar
                  </button>
                  <button
                    onClick={() => setShowGenerateForm(!showGenerateForm)}
                    className={styles.formButton}
                  >
                    <Sparkles className="w-4 h-4" />
                    {showGenerateForm ? "Cerrar" : "Generar"}
                  </button>
                </div>
              </div>

              {showGenerateForm && (
                <div className={styles.sidebarSection}>
                  <div className={styles.sectionContent}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleGenerate();
                      }}
                      className={styles.generateForm}
                    >
                      <input
                        type="text"
                        placeholder="Nuevo tema..."
                        value={formData.topic ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            topic: e.target.value,
                          })
                        }
                        className={styles.formInput}
                      />
                      <input
                        type="number"
                        placeholder="Cantidad"
                        min="2"
                        max="20"
                        value={formData.quantity ?? 10}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: parseInt(e.target.value, 10) || 10,
                          })
                        }
                        className={styles.formInput}
                      />
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className={styles.formButton}
                      >
                        {isGenerating ? "..." : "Generar"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Card viewer */}
            <div className={styles.cardViewer}>
              {currentCard && (
                <>
                  {/* Tarjeta */}
                  <div
                    className={styles.card}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div className={styles.cardInner}>
                      <div className={styles.cardLabel}>
                        {isFlipped ? "Respuesta" : "Pregunta"}
                      </div>
                      <div className={styles.cardContent}>
                        <MarkdownRenderer
                          content={
                            isFlipped ? currentCard.back : currentCard.front
                          }
                        />
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <span>Click para girar</span>
                      <span>
                        {currentCard.difficulty &&
                          `Dificultad: ${currentCard.difficulty}`}
                      </span>
                    </div>
                  </div>

                  {/* Navegación */}
                  <div className={styles.navigation}>
                    <button
                      onClick={handlePrevCard}
                      disabled={currentCardIndex === 0}
                      className={styles.navButton}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>
                        {currentCardIndex + 1} /{" "}
                        {currentDeck?.flashcards?.length}
                      </span>
                    </div>
                    <button
                      onClick={handleNextCard}
                      disabled={
                        currentCardIndex ===
                        (currentDeck?.flashcards?.length ?? 0) - 1
                      }
                      className={styles.navButton}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <Separator className="my-4" />
      {cards ? <CardGrid cards={cards} /> : <p>No hay cards</p>}
    </DashboardLayout>
  );
}
