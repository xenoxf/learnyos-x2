"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import type {
  FlashCard,
  FlashCardDeck,
  GenerateFlashCardData,
  GenerateFlashcardsResponse,
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/flashcards.module.css";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import DashboardLayout from "../layaut";

const DEFAULT_DECK_TITLE = "Mis tarjetas";

function buildSingleDeck(cards: FlashCard[]): FlashCardDeck {
  return {
    id: 0,
    title: DEFAULT_DECK_TITLE,
    totalCards: cards.length,
    cards,
  };
}

export default function FlashcardsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedDeck, setSelectedDeck] = useState<FlashCardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [formData, setFormData] = useState<GenerateFlashCardData>({
    topic: "",
    quantity: 10,
  });

  const { data: cards = [], isLoading: isLoadingDecks } = useQuery<FlashCard[]>({
    queryKey: ["flashcards"],
    queryFn: () => apiService.getFlashcards(),
  });

  const decks: FlashCardDeck[] = useMemo(
    () => (cards.length > 0 ? [buildSingleDeck(cards)] : []),
    [cards]
  );

  const { mutate: generateFlashcards, isPending: isGenerating } = useMutation<
    GenerateFlashcardsResponse,
    Error,
    GenerateFlashCardData
  >({
    mutationFn: (data: GenerateFlashCardData) =>
      apiService.generateFlashcards({
        ...data,
        quantity: data.quantity ?? 10,
      }),
    onSuccess: (res: GenerateFlashcardsResponse) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      if (res.flashcards?.length && res.card) {
        const newDeck: FlashCardDeck = {
          id: res.card.id,
          title: res.card.title,
          totalCards: res.totalCreated,
          cards: res.flashcards,
        };
        setSelectedDeck(newDeck);
        setCurrentCardIndex(0);
        setShowGenerateForm(false);
        setFormData({ topic: "", quantity: 10 });
        toast({
          title: "Éxito",
          description: `Se generaron ${res.totalCreated} flashcards correctamente`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error?.message ?? "Error al generar flashcards",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteDeck } = useMutation({
    mutationFn: (deckId: number) => apiService.deleteFlashcard(deckId),
    onSuccess: () => {
      setSelectedDeck(null);
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });

  const handleGenerateFlashcards = () => {
    if (!formData.topic?.trim()) return;
    generateFlashcards(formData);
  };

  const currentCard = selectedDeck?.cards[currentCardIndex];
  const progress =
    selectedDeck && selectedDeck.cards.length > 0
      ? ((currentCardIndex + 1) / selectedDeck.cards.length) * 100
      : 0;

  return (
    <DashboardLayout>
    <div className={styles.flashcardsContainer}>
      <div className={styles.decksSidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Mis Mazos</h2>
          <button
            className={styles.createButton}
            onClick={() => setShowGenerateForm(!showGenerateForm)}
          >
            + Nuevo
          </button>
        </div>

        {showGenerateForm && (
          <div className={styles.generateForm}>
            <input
              type="text"
              placeholder="Tema..."
              value={formData.topic ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              className={styles.formInput}
            />
            <input
              type="number"
              placeholder="Cantidad..."
              value={formData.quantity ?? 10}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value, 10) || 10,
                })
              }
              className={styles.formInput}
              min={1}
              max={50}
            />
            <button
              onClick={handleGenerateFlashcards}
              disabled={isGenerating}
              className={styles.generateButton}
            >
              {isGenerating ? "Generando..." : "Generar"}
            </button>
            <button
              onClick={() => setShowGenerateForm(false)}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
          </div>
        )}

        {isLoadingDecks ? (
          <div className={styles.loadingState}>Cargando mazos...</div>
        ) : decks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Sin mazos aún</p>
            <p className={styles.hint}>Crea o genera uno</p>
          </div>
        ) : (
          <div className={styles.decksList}>
            {decks.map((deck) => (
              <div
                key={deck.id}
                className={`${styles.deckItem} ${
                  selectedDeck?.id === deck.id ? styles.deckItemActive : ""
                }`}
                onClick={() => {
                  setSelectedDeck(deck);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
              >
                <div className={styles.deckItemTitle}>{deck.title}</div>
                <span className={styles.deckCardCount}>{deck.cards.length}</span>
                {deck.id !== 0 && (
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDeck(deck.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.flashcardsMain}>
        {!selectedDeck ? (
          <div className={styles.noDeckSelected}>
            <h2>Selecciona un mazo</h2>
            <p>O genera uno nuevo</p>
          </div>
        ) : (
          <>
            <div className={styles.flashcardsHeader}>
              <h1 className={styles.deckTitle}>{selectedDeck.title}</h1>
              <div className={styles.progress}>
                <span className={styles.progressText}>
                  {currentCardIndex + 1} / {selectedDeck.cards.length}
                </span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.cardContainer}>
              {currentCard ? (
                <div
                  className={`${styles.flashcard} ${
                    isFlipped ? styles.flipped : ""
                  }`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className={styles.cardFace}>
                    <div className={styles.cardInner}>
                      <h2 className={styles.cardTitle}>
                        {isFlipped ? "Respuesta" : "Pregunta"}
                      </h2>
                      <div className={styles.cardContent}>
                        <MarkdownRenderer
                          content={
                            isFlipped ? currentCard.answer : currentCard.question
                          }
                        />
                      </div>
                      <span className={styles.cardHint}>
                        Haz clic para voltear
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.noCard}>Sin tarjetas</div>
              )}
            </div>

            <div className={styles.navigation}>
              <button
                onClick={() =>
                  setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                }
                disabled={currentCardIndex === 0}
                className={styles.navButton}
              >
                ← Anterior
              </button>
              <button
                onClick={() =>
                  setCurrentCardIndex(
                    Math.min(
                      selectedDeck.cards.length - 1,
                      currentCardIndex + 1
                    )
                  )
                }
                disabled={
                  currentCardIndex === selectedDeck.cards.length - 1
                }
                className={styles.navButton}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
