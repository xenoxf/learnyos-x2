"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import type { Card, GenerateFlashCardData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import styles from "../../styles/flashcards.module.css";
import DashboardLayout from "../layaut";
import {
  Loader,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  Layers,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

function FlashCardPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);
  const [generatingLoading, setGeneratingLoading] = useState(false);
  const [generateFormData, setGenerateFormData] = useState<GenerateFlashCardData>({
    quantity: 10,
    level: "medium",
  });
  const { toast } = useToast();

  // Cargar tarjetas
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const data = await apiService.getFlashcards();
        setCards(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar tarjetas";
        setError(message);
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [toast]);

  // Filtrar tarjetas por búsqueda
  const filteredCards = cards.filter((card) =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar generación de tarjetas
  const handleGenerateFlashcards = async () => {
    try {
      setGeneratingLoading(true);
      const newCard = await apiService.generateFlashcards(generateFormData);
      setCards([...cards, newCard]);
      setShowGenerateDialog(false);
      setGenerateFormData({ quantity: 10, level: "medium" });
      toast({
        title: "Éxito",
        description: `${newCard.flashcards?.length || 0} tarjetas generadas`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al generar tarjetas";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setGeneratingLoading(false);
    }
  };

  // Manejar eliminación
  const handleDeleteCard = async () => {
    if (!cardToDelete) return;

    try {
      await apiService.deleteCard(cardToDelete);
      setCards(cards.filter((c) => c.id !== cardToDelete));
      setShowDeleteAlert(false);
      setCardToDelete(null);
      if (selectedCard?.id === cardToDelete) {
        setSelectedCard(null);
        setCurrentCardIndex(0);
      }
      toast({
        title: "Éxito",
        description: "Mazo eliminado correctamente",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar mazo";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  // Navegación de tarjetas individuales
  const currentFlashcards = selectedCard?.flashcards || [];
  const canGoNext = currentCardIndex < currentFlashcards.length - 1;
  const canGoPrev = currentCardIndex > 0;

  const goToNextCard = () => {
    if (canGoNext) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const goToPreviousCard = () => {
    if (canGoPrev) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const resetCards = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const currentFlashcard = currentFlashcards[currentCardIndex];

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.iconWrapper}>
              <Layers className={styles.icon} />
            </div>
            <div>
              <h1 className={styles.title}>Tarjetas Didácticas</h1>
              <p className={styles.subtitle}>
                Crea, estudia y domina tus temas con tarjetas interactivas
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar mazos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button
            onClick={() => setShowGenerateDialog(true)}
            className={styles.generateBtn}
          >
            <Sparkles size={18} />
            Generar Tarjetas
          </button>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Left Side - Decks List */}
          <div className={styles.decksList}>
            <h2 className={styles.decksTitle}>Tus Mazos</h2>

            {loading ? (
              <div className={styles.loadingState}>
                <Loader className={styles.spinner} />
                <p>Cargando mazos...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <p>{error}</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className={styles.emptyState}>
                <BookOpen size={40} />
                <p>No hay mazos disponibles</p>
                <p className={styles.emptySubtext}>
                  Genera tu primer mazo para comenzar
                </p>
              </div>
            ) : (
              <div className={styles.deckGrid}>
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className={`${styles.deckItem} ${
                      selectedCard?.id === card.id ? styles.deckItemActive : ""
                    }`}
                    onClick={() => {
                      setSelectedCard(card);
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                    }}
                  >
                    <div className={styles.deckItemHeader}>
                      <h3 className={styles.deckItemTitle}>{card.title}</h3>
                      <button
                        className={styles.deckDeleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardToDelete(card.id);
                          setShowDeleteAlert(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className={styles.deckItemDesc}>{card.description}</p>
                    <div className={styles.deckItemStats}>
                      <span className={styles.cardCount}>
                        {card.totalCards} tarjetas
                      </span>
                      {card.reviewedCards !== undefined && (
                        <span className={styles.reviewedCount}>
                          {card.reviewedCards} revisadas
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Card Viewer */}
          <div className={styles.cardViewer}>
            {selectedCard ? (
              <>
                <div className={styles.cardViewerHeader}>
                  <h2 className={styles.cardViewerTitle}>{selectedCard.title}</h2>
                  <div className={styles.cardCounter}>
                    {currentCardIndex + 1} / {currentFlashcards.length}
                  </div>
                </div>

                <div className={styles.flipCardContainer}>
                  <div
                    className={`${styles.flipCard} ${
                      isFlipped ? styles.flipCardFlipped : ""
                    }`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div className={styles.flipCardFront}>
                      <div className={styles.flipCardContent}>
                        {currentFlashcard?.front}
                      </div>
                      <p className={styles.flipCardHint}>Toca para voltear</p>
                    </div>
                    <div className={styles.flipCardBack}>
                      <div className={styles.flipCardContent}>
                        {currentFlashcard?.back}
                      </div>
                      {currentFlashcard?.hint && (
                        <div className={styles.flipCardHintBox}>
                          💡 {currentFlashcard.hint}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Difficulty Badge */}
                {currentFlashcard?.difficulty && (
                  <div className={styles.difficultyBadge}>
                    <span className={styles[`difficulty${currentFlashcard.difficulty}`]}>
                      {currentFlashcard.difficulty.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Navigation Controls */}
                <div className={styles.navigationControls}>
                  <button
                    onClick={goToPreviousCard}
                    disabled={!canGoPrev}
                    className={styles.navBtn}
                    title="Tarjeta anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={resetCards}
                    className={styles.resetBtn}
                    title="Reiniciar"
                  >
                    <RotateCcw size={20} />
                  </button>

                  <button
                    onClick={goToNextCard}
                    disabled={!canGoNext}
                    className={styles.navBtn}
                    title="Siguiente tarjeta"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${((currentCardIndex + 1) / currentFlashcards.length) * 100}%`,
                    }}
                  />
                </div>
              </>
            ) : (
              <div className={styles.emptyCardViewer}>
                <CheckCircle2 size={64} className={styles.emptyCardIcon} />
                <p>Selecciona un mazo para comenzar</p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Dialog */}
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent className={styles.dialog}>
            <DialogHeader>
              <DialogTitle>Generar Tarjetas</DialogTitle>
              <DialogDescription>
                Genera tarjetas usando IA basándote en un tema o texto
              </DialogDescription>
            </DialogHeader>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tema</label>
              <input
                type="text"
                placeholder="Ej: Biología celular"
                value={generateFormData.topic || ""}
                onChange={(e) =>
                  setGenerateFormData({ ...generateFormData, topic: e.target.value })
                }
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>O Texto de Referencia</label>
              <textarea
                placeholder="Pega el contenido para extraer tarjetas..."
                value={generateFormData.referenceText || ""}
                onChange={(e) =>
                  setGenerateFormData({
                    ...generateFormData,
                    referenceText: e.target.value,
                  })
                }
                className={styles.textarea}
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Cantidad de Tarjetas</label>
              <input
                type="number"
                min="5"
                max="50"
                value={generateFormData.quantity}
                onChange={(e) =>
                  setGenerateFormData({
                    ...generateFormData,
                    quantity: parseInt(e.target.value),
                  })
                }
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nivel de Dificultad</label>
              <Select
                value={generateFormData.level || "medium"}
                onValueChange={(value) =>
                  setGenerateFormData({ ...generateFormData, level: value })
                }
              >
                <SelectTrigger className={styles.selectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.dialogActions}>
              <button
                onClick={() => setShowGenerateDialog(false)}
                className={styles.cancelBtn}
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateFlashcards}
                disabled={generatingLoading || (!generateFormData.topic && !generateFormData.referenceText)}
                className={styles.confirmBtn}
              >
                {generatingLoading ? (
                  <>
                    <Loader size={18} className={styles.spinner} />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generar
                  </>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Alert */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar mazo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán todas las tarjetas del mazo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCard}
                className={styles.deleteAction}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

export default FlashCardPage;
