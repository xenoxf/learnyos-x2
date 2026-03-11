"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import type {
  FlashCard,
  Card,
  GenerateFlashCardData,
  GenerateFlashcardsResponse,
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import styles from "../../styles/flashcards.module.css";
import DashboardLayout from "../layaut";
import {
  Loader,
  Book,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  FolderOpen,
  Layers,
  Clock,
  BarChart,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ==================== COMPONENTE PARA MOSTRAR UN MAZO (CARD) ====================
function CardDeckItem({
  deck,
  onClick,
  onDelete,
}: {
  deck: Card;
  onClick: () => void;
  onDelete: (e: React.MouseEvent, deckId: number) => void;
}) {
  const progress =
    deck.reviewedCards && deck.totalCards
      ? (deck.reviewedCards / deck.totalCards) * 100
      : 0;

  return (
    <div className={styles.deckCard} onClick={onClick}>
      <button
        className={styles.deleteDeckButton}
        onClick={(e) => onDelete(e, deck.id)}
        aria-label="Eliminar mazo"
      >
        <Trash2 size={16} />
      </button>

      <div className={styles.deckCardHeader}>
        <div className={styles.deckIcon}>
          <Book size={24} />
        </div>
        <div className={styles.deckInfo}>
          <h3 className={styles.deckTitle}>{deck.title}</h3>
          {deck.description && (
            <p className={styles.deckDescription}>{deck.description}</p>
          )}
        </div>
      </div>

      <div className={styles.deckStats}>
        <div className={styles.stat}>
          <Layers size={14} />
          <span>{deck.totalCards} tarjetas</span>
        </div>
        {deck.lastReviewDate && (
          <div className={styles.stat}>
            <Clock size={14} />
            <span>
              Última revisión:{" "}
              {new Date(deck.lastReviewDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {deck.reviewedCards !== undefined && deck.totalCards > 0 && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Progreso</span>
            <span className={styles.progressValue}>
              {deck.reviewedCards}/{deck.totalCards}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className={styles.deckCardFooter}>
        <span
          className={`${styles.statusBadge} ${
            deck.reviewedCards === deck.totalCards && deck.totalCards > 0
              ? styles.statusCompleted
              : deck.reviewedCards && deck.reviewedCards > 0
                ? styles.statusProgress
                : styles.statusNew
          }`}
        >
          {deck.reviewedCards === deck.totalCards && deck.totalCards > 0
            ? "Completado"
            : deck.reviewedCards && deck.reviewedCards > 0
              ? "En progreso"
              : "Sin empezar"}
        </span>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PARA LA CUADRÍCULA DE MAZOS ====================
function CardGrid({
  decks,
  onDeckClick,
  onDeleteDeck,
  isLoading,
}: {
  decks: Card[];
  onDeckClick: (deck: Card) => void;
  onDeleteDeck: (e: React.MouseEvent, deckId: number) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.deckCard} ${styles.skeleton}`}>
            <div className={styles.deckCardHeader}>
              <div className={`${styles.deckIcon} ${styles.skeletonIcon}`} />
              <div className={styles.deckInfo}>
                <div
                  className={`${styles.skeletonText} ${styles.skeletonTitle}`}
                />
                <div
                  className={`${styles.skeletonText} ${styles.skeletonDescription}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FolderOpen size={48} className={styles.emptyIcon} />
        <h3>No hay mazos</h3>
        <p>Crea tu primer mazo de flashcards para empezar a estudiar</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {decks.map((deck) => (
        <CardDeckItem
          key={deck.id}
          deck={deck}
          onClick={() => onDeckClick(deck)}
          onDelete={onDeleteDeck}
        />
      ))}
    </div>
  );
}

// ==================== COMPONENTE PARA ESTUDIAR FLASHCARDS ====================
function FlashcardStudy({ deck, onBack }: { deck: Card; onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());

  const { toast } = useToast();

  const flashcards = deck.flashcards || [];
  const currentCard = flashcards[currentIndex];
  const progress =
    flashcards.length > 0 ? (reviewedCards.size / flashcards.length) * 100 : 0;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleReview = () => {
    if (!currentCard) return;

    setReviewedCards((prev) => new Set(prev).add(currentCard.id));

    toast({
      title: "¡Buen trabajo!",
      description: "Tarjeta marcada como revisada",
    });

    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        handleNext();
      }
    }, 300);
  };

  if (flashcards.length === 0) {
    return (
      <div className={styles.studyContainer}>
        <div className={styles.studyHeader}>
          <button className={styles.backButton} onClick={onBack}>
            <ChevronLeft size={20} />
            Volver a mazos
          </button>
        </div>
        <div className={styles.emptyStudy}>
          <Book size={48} />
          <h3>Este mazo está vacío</h3>
          <p>No hay flashcards para estudiar en este mazo</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.studyContainer}>
      <div className={styles.studyHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <ChevronLeft size={20} />
          Volver a mazos
        </button>

        <div className={styles.studyTitle}>
          <h2>{deck.title}</h2>
          {deck.description && <p>{deck.description}</p>}
        </div>

        <div className={styles.studyProgress}>
          <div className={styles.progressInfo}>
            <span>
              Tarjeta {currentIndex + 1} de {flashcards.length}
            </span>
            <span className={styles.reviewedCount}>
              Revisadas: {reviewedCards.size}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.studyContent}>
        <div className={styles.flashcardContainer}>
          <div
            className={`${styles.flashcard} ${isFlipped ? styles.flipped : ""}`}
            onClick={handleFlip}
          >
            <div className={styles.flashcardFront}>
              <div className={styles.flashcardContent}>
                <span className={styles.cardSide}>Frente</span>
                <div className={styles.markdown}>{currentCard?.front}</div>
              </div>
            </div>
            <div className={styles.flashcardBack}>
              <div className={styles.flashcardContent}>
                <span className={styles.cardSide}>Dorso</span>
                <div className={styles.markdown}>{currentCard?.back}</div>
                {currentCard?.hint && (
                  <div className={styles.hint}>
                    <span className={styles.hintLabel}>Pista:</span>
                    <div className={styles.markdown}>{currentCard.hint}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.flashcardControls}>
            <button
              className={styles.controlButton}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={20} />
              Anterior
            </button>

            <button
              className={`${styles.reviewButton} ${
                reviewedCards.has(currentCard?.id || 0) ? styles.reviewed : ""
              }`}
              onClick={handleReview}
              disabled={reviewedCards.has(currentCard?.id || 0)}
            >
              {reviewedCards.has(currentCard?.id || 0)
                ? "✓ Revisada"
                : "Marcar como revisada"}
            </button>

            <button className={styles.controlButton} onClick={handleFlip}>
              <RotateCcw size={20} />
              Voltear
            </button>

            <button
              className={styles.controlButton}
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
            >
              Siguiente
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.thumbnailList}>
            {flashcards.map((card, index) => (
              <button
                key={card.id}
                className={`${styles.thumbnail} ${index === currentIndex ? styles.thumbnailActive : ""}`}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsFlipped(false);
                }}
              >
                <span className={styles.thumbnailNumber}>{index + 1}</span>
                {reviewedCards.has(card.id) && (
                  <span className={styles.thumbnailReviewed}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.studyFooter}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <BarChart size={16} />
            <span>Revisadas: {reviewedCards.size}</span>
          </div>
          <div className={styles.stat}>
            <Layers size={16} />
            <span>Pendientes: {flashcards.length - reviewedCards.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL PARA GENERAR FLASHCARDS ====================
function GenerateFlashcardsDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [quantity, setQuantity] = useState("5");
  const [level, setLevel] = useState("medium");
  const [generationType, setGenerationType] = useState<"topic" | "reference">(
    "topic",
  );

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (data: GenerateFlashCardData) =>
      apiService.generateFlashcards(data),
    onSuccess: (response: GenerateFlashcardsResponse) => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "¡Flashcards generadas!",
        description: `Se crearon ${response.totalCreated} flashcards en "${response.card.title}"`,
      });
      onSuccess();
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron generar las flashcards",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTopic("");
    setReferenceText("");
    setQuantity("5");
    setLevel("medium");
    setGenerationType("topic");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: GenerateFlashCardData = {
      quantity: parseInt(quantity),
      level,
    };

    if (generationType === "topic") {
      if (!topic.trim()) {
        toast({
          title: "Campo requerido",
          description: "Por favor ingresa un tema",
          variant: "destructive",
        });
        return;
      }
      data.topic = topic;
    } else {
      if (!referenceText.trim()) {
        toast({
          title: "Campo requerido",
          description: "Por favor ingresa un texto de referencia",
          variant: "destructive",
        });
        return;
      }
      data.referenceText = referenceText;
    }

    generateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialog}>
        <DialogHeader>
          <DialogTitle>Generar Flashcards</DialogTitle>
          <DialogDescription>
            Crea nuevas flashcards usando IA basadas en un tema o texto de
            referencia
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs
            value={generationType}
            onValueChange={(v) => setGenerationType(v as "topic" | "reference")}
            className={styles.tabs}
          >
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="topic">Por Tema</TabsTrigger>
              <TabsTrigger value="reference">Por Referencia</TabsTrigger>
            </TabsList>

            <TabsContent value="topic" className={styles.tabContent}>
              <div className={styles.formGroup}>
                <label htmlFor="topic">Tema</label>
                <Input
                  id="topic"
                  placeholder="Ej: Programación en React, Historia Universal..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="reference" className={styles.tabContent}>
              <div className={styles.formGroup}>
                <label htmlFor="reference">Texto de referencia</label>
                <textarea
                  id="reference"
                  className={styles.textarea}
                  placeholder="Pega aquí el texto del cual quieres generar flashcards..."
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
                  rows={5}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">Cantidad</label>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger id="quantity">
                  <SelectValue placeholder="Selecciona cantidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 flashcards</SelectItem>
                  <SelectItem value="5">5 flashcards</SelectItem>
                  <SelectItem value="10">10 flashcards</SelectItem>
                  <SelectItem value="15">15 flashcards</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="level">Dificultad</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Selecciona dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.generateButton}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader className={styles.spin} size={16} />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generar con IA
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== PÁGINA PRINCIPAL ====================
export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<Card | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDeckDialog, setShowDeleteDeckDialog] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: decks, isLoading } = useQuery({
    queryKey: ["decks"],
    queryFn: () => apiService.getFlashcards(),
  });

  const deleteDeckMutation = useMutation({
    mutationFn: (deckId: number) => apiService.deleteCard(deckId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Mazo eliminado",
        description: "El mazo se eliminó correctamente",
      });
      setShowDeleteDeckDialog(false);
      setDeckToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el mazo",
        variant: "destructive",
      });
    },
  });

  const filteredDecks = useMemo(() => {
    if (!decks) return [];
    if (!searchTerm) return decks;

    return decks.filter(
      (deck) =>
        deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [decks, searchTerm]);

  const handleDeckClick = (deck: Card) => {
    setSelectedDeck(deck);
  };

  const handleBackToDecks = () => {
    setSelectedDeck(null);
  };

  const handleGenerateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["decks"] });
  };

  const handleDeleteDeckClick = (e: React.MouseEvent, deckId: number) => {
    e.stopPropagation();
    setDeckToDelete(deckId);
    setShowDeleteDeckDialog(true);
  };

  const confirmDeleteDeck = () => {
    if (deckToDelete) {
      deleteDeckMutation.mutate(deckToDelete);
    }
  };

  if (selectedDeck) {
    return (
      <DashboardLayout>
        <FlashcardStudy deck={selectedDeck} onBack={handleBackToDecks} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Flashcards</h1>
            <p className={styles.subtitle}>
              Crea y estudia con tarjetas de aprendizaje inteligentes
            </p>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.generateButton}
              onClick={() => setShowGenerateDialog(true)}
            >
              <Sparkles size={16} />
              Generar con IA
            </button>
          </div>
        </div>

        <div className={styles.searchBar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <Input
              placeholder="Buscar mazos por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <CardGrid
          decks={filteredDecks || []}
          onDeckClick={handleDeckClick}
          onDeleteDeck={handleDeleteDeckClick}
          isLoading={isLoading}
        />

        <GenerateFlashcardsDialog
          open={showGenerateDialog}
          onOpenChange={setShowGenerateDialog}
          onSuccess={handleGenerateSuccess}
        />

        <AlertDialog
          open={showDeleteDeckDialog}
          onOpenChange={setShowDeleteDeckDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar mazo completo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán todas las
                flashcards de este mazo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteDeck}>
                {deleteDeckMutation.isPending ? (
                  <Loader className={styles.spin} size={16} />
                ) : (
                  "Eliminar mazo"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
