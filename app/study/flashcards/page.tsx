"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  FolderOpen,
  Layers,
  Clock,
  CheckCircle2,
  Trash2,
  Brain,
  Zap,
  Target,
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

// ─── helpers ──────────────────────────────────────────────────────────────────

function statusOf(deck: Card) {
  const { reviewedCards, totalCards } = deck;
  if (!totalCards)
    return { label: "Sin empezar", color: "hsl(var(--primary))" };
  if (reviewedCards === totalCards)
    return { label: "Completado", color: "#22c55e" };
  if (reviewedCards && reviewedCards > 0)
    return { label: "En progreso", color: "#f59e0b" };
  return { label: "Sin empezar", color: "hsl(var(--primary))" };
}

// ─── DeckCard ─────────────────────────────────────────────────────────────────

function DeckCard({
  deck,
  onClick,
  onDelete,
}: {
  deck: Card;
  onClick: () => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}) {
  const pct =
    deck.reviewedCards && deck.totalCards
      ? Math.round((deck.reviewedCards / deck.totalCards) * 100)
      : 0;
  const { label, color } = statusOf(deck);

  return (
    <div className={styles.card} onClick={onClick}>
      {/* delete */}
      <button
        className={styles.cardDelete}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(deck.id, e);
        }}
        aria-label="Eliminar mazo"
      >
        <Trash2 size={14} />
      </button>

      {/* icon + title */}
      <div className={styles.cardTop}>
        <div className={styles.cardIcon}>
          <BookOpen size={20} />
        </div>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{deck.title}</h3>
          {deck.description && (
            <p className={styles.cardDesc}>{deck.description}</p>
          )}
        </div>
      </div>

      {/* meta */}
      <div className={styles.cardMeta}>
        <span className={styles.cardMetaItem}>
          <Layers size={13} />
          {deck.totalCards} tarjetas
        </span>
        {deck.lastReviewDate && (
          <span className={styles.cardMetaItem}>
            <Clock size={13} />
            {new Date(deck.lastReviewDate).toLocaleDateString("es", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>

      {/* progress */}
      {deck.totalCards > 0 && (
        <div className={styles.cardProgress}>
          <div className={styles.cardTrack}>
            <div
              className={styles.cardFill}
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
          <div className={styles.cardProgressRow}>
            <span className={styles.cardStatus} style={{ color }}>
              {label}
            </span>
            <span className={styles.cardPct}>{pct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CardGrid ─────────────────────────────────────────────────────────────────

function CardGrid({
  decks,
  onDeckClick,
  onDeleteDeck,
  isLoading,
  onNew,
}: {
  decks: Card[];
  onDeckClick: (deck: Card) => void;
  onDeleteDeck: (id: number, e: React.MouseEvent) => void;
  isLoading: boolean;
  onNew: () => void;
}) {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`${styles.card} ${styles.skelCard}`}>
            <div className={styles.cardTop}>
              <div className={`${styles.skel} ${styles.skelIcon}`} />
              <div style={{ flex: 1 }}>
                <div className={`${styles.skel} ${styles.skelH}`} />
                <div className={`${styles.skel} ${styles.skelP}`} />
              </div>
            </div>
            <div className={`${styles.skel} ${styles.skelBar}`} />
          </div>
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className={styles.grid}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <FolderOpen size={28} />
          </div>
          <h3>Ningún mazo todavía</h3>
          <p>Genera tu primer mazo con IA para comenzar a estudiar</p>
          <button className={styles.emptyBtn} onClick={onNew}>
            <Sparkles size={15} /> Generar con IA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          onClick={() => onDeckClick(deck)}
          onDelete={onDeleteDeck}
        />
      ))}
    </div>
  );
}

// ─── FlashcardStudy ───────────────────────────────────────────────────────────

function FlashcardStudy({ deck, onBack }: { deck: Card; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const cards = deck.flashcards ?? [];
  const current = cards[idx];
  const progress = cards.length ? (reviewed.size / cards.length) * 100 : 0;

  const goNext = () => {
    if (idx < cards.length - 1) {
      setIdx((p) => p + 1);
      setFlipped(false);
    }
  };

  const goPrev = () => {
    if (idx > 0) {
      setIdx((p) => p - 1);
      setFlipped(false);
    }
  };

  const markReviewed = () => {
    if (!current) return;
    setReviewed((prev) => new Set(prev).add(current.id));
    toast({
      title: "¡Bien hecho!",
      description: "Tarjeta marcada como revisada",
    });
    setTimeout(() => {
      if (idx < cards.length - 1) goNext();
    }, 300);
  };

  const isReviewed = current ? reviewed.has(current.id) : false;

  return (
    <div className={styles.study}>
      {/* Nav */}
      <div className={styles.studyNav}>
        <button className={styles.studyBack} onClick={onBack}>
          <ChevronLeft size={16} /> Mazos
        </button>
        <div className={styles.studyNavMid}>
          <span className={styles.studyNavTitle}>{deck.title}</span>
          {deck.description && (
            <span className={styles.studyNavDesc}>{deck.description}</span>
          )}
        </div>
        <div className={styles.studyCounter}>
          {idx + 1} / {cards.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.studyBar}>
        <div
          className={styles.studyBarFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main */}
      <div className={styles.studyMain}>
        {/* Flip card */}
        <div className={styles.flipWrap}>
          <div
            className={`${styles.flipCard} ${flipped ? styles.isFlipped : ""}`}
            onClick={() => setFlipped((p) => !p)}
          >
            {/* Front */}
            <div className={styles.flipFace + " " + styles.flipFront}>
              <span className={styles.faceTag}>Pregunta</span>
              <p className={styles.faceText}>{current?.front}</p>
              <span className={styles.faceHint}>Clic para ver respuesta</span>
            </div>
            {/* Back */}
            <div className={`${styles.flipFace} ${styles.flipBack}`}>
              <span className={`${styles.faceTag} ${styles.faceTagBack}`}>
                Respuesta
              </span>
              <p className={styles.faceText}>{current?.back}</p>
              {current?.hint && (
                <div className={styles.faceExtra}>
                  <Zap size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{current.hint}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button
            className={styles.btnNav}
            onClick={goPrev}
            disabled={idx === 0}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            className={styles.btnFlip}
            onClick={() => setFlipped((p) => !p)}
          >
            <RotateCcw size={15} /> Voltear
          </button>

          <button
            className={`${styles.btnCheck} ${isReviewed ? styles.btnCheckDone : ""}`}
            onClick={markReviewed}
            disabled={isReviewed}
          >
            <CheckCircle2 size={15} />
            {isReviewed ? "Revisada ✓" : "Marcar revisada"}
          </button>

          <button
            className={styles.btnNav}
            onClick={goNext}
            disabled={idx === cards.length - 1}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Thumbnails */}
        <div className={styles.thumbs}>
          {cards.map((card, i) => (
            <button
              key={card.id}
              className={`${styles.thumb} ${i === idx ? styles.thumbActive : ""} ${reviewed.has(card.id) ? styles.thumbDone : ""}`}
              onClick={() => {
                setIdx(i);
                setFlipped(false);
              }}
            >
              {reviewed.has(card.id) ? "✓" : i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GenerateDialog ───────────────────────────────────────────────────────────

function GenerateDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [refText, setRefText] = useState("");
  const [quantity, setQuantity] = useState("5");
  const [level, setLevel] = useState("medium");
  const [mode, setMode] = useState<"topic" | "reference">("topic");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: GenerateFlashCardData) =>
      apiService.generateFlashcards(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "¡Mazo creado!",
        description: "Tus flashcards están listas",
      });
      onSuccess();
      onOpenChange(false);
      setTopic("");
      setRefText("");
      setQuantity("5");
      setLevel("medium");
      setMode("topic");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo generar el mazo",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: GenerateFlashCardData = { quantity: parseInt(quantity), level };
    if (mode === "topic") {
      if (!topic.trim()) {
        toast({ title: "Escribe un tema", variant: "destructive" });
        return;
      }
      data.topic = topic;
    } else {
      if (!refText.trim()) {
        toast({
          title: "Escribe el texto de referencia",
          variant: "destructive",
        });
        return;
      }
      data.referenceText = refText;
    }
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={styles.dlgTitle}>
            <Brain size={20} /> Generar Flashcards con IA
          </DialogTitle>
          <DialogDescription>
            Crea un mazo completo desde un tema o texto de referencia
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={styles.dlgForm}>
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "topic" | "reference")}
          >
            <TabsList style={{ width: "100%" }}>
              <TabsTrigger value="topic" style={{ flex: 1 }}>
                <Target size={14} style={{ marginRight: 6 }} /> Por Tema
              </TabsTrigger>
              <TabsTrigger value="reference" style={{ flex: 1 }}>
                <BookOpen size={14} style={{ marginRight: 6 }} /> Por Texto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="topic" className={styles.dlgTabBody}>
              <label className={styles.dlgLabel}>Tema</label>
              <input
                className={styles.dlgInput}
                placeholder="Ej: Biología celular, Revolución Francesa..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="reference" className={styles.dlgTabBody}>
              <label className={styles.dlgLabel}>Texto de referencia</label>
              <textarea
                className={styles.dlgTextarea}
                placeholder="Pega aquí el texto del que quieres generar flashcards..."
                value={refText}
                onChange={(e) => setRefText(e.target.value)}
              />
            </TabsContent>
          </Tabs>

          <div className={styles.dlgRow}>
            <div className={styles.dlgField}>
              <label className={styles.dlgLabel}>Cantidad</label>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 tarjetas</SelectItem>
                  <SelectItem value="5">5 tarjetas</SelectItem>
                  <SelectItem value="10">10 tarjetas</SelectItem>
                  <SelectItem value="15">15 tarjetas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={styles.dlgField}>
              <label className={styles.dlgLabel}>Dificultad</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={styles.dlgFooter}>
            <button
              type="button"
              className={styles.dlgCancel}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.dlgSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader className={styles.spin} size={15} /> Generando...
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Generar con IA
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── FlashcardsPage ───────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<Card | null>(null);
  const [showGen, setShowGen] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: decks, isLoading } = useQuery<Card[]>({
    queryKey: ["decks"],
    queryFn: () => apiService.getFlashcards(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Mazo eliminado",
        description: "El mazo se ha eliminado correctamente",
      });
      setDeletingId(null);
    },
    onError: (error) => {
      console.error("Error deleting deck:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el mazo",
        variant: "destructive",
      });
    },
  });

  const filtered = useMemo(() => {
    if (!decks) return [];
    if (!search.trim()) return decks;
    const q = search.toLowerCase();
    return decks.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q),
    );
  }, [decks, search]);

  const totalCards = decks?.reduce((s, d) => s + d.totalCards, 0) ?? 0;
  const totalReviewed =
    decks?.reduce((s, d) => s + (d.reviewedCards ?? 0), 0) ?? 0;

  // Manejar clic en eliminar
  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  // ── Study view
  if (selectedDeck) {
    return (
      <DashboardLayout>
        <FlashcardStudy
          deck={selectedDeck}
          onBack={() => setSelectedDeck(null)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* ── Banner hero ── */}
        <div className={styles.banner}>
          <div className={styles.bannerBg} />
          <div className={styles.bannerInner}>
            <div className={styles.bannerText}>
              <h1 className={styles.bannerTitle}>Flashcards</h1>
              <p className={styles.bannerSub}>
                Estudia inteligentemente con IA
              </p>
            </div>
            {decks && decks.length > 0 && (
              <div className={styles.bannerKpis}>
                <div className={styles.kpi}>
                  <span className={styles.kpiNum}>{decks.length}</span>
                  <span className={styles.kpiLabel}>Mazos</span>
                </div>
                <div className={styles.kpi}>
                  <span className={styles.kpiNum}>{totalCards}</span>
                  <span className={styles.kpiLabel}>Tarjetas</span>
                </div>
                <div className={styles.kpi}>
                  <span className={styles.kpiNum}>{totalReviewed}</span>
                  <span className={styles.kpiLabel}>Revisadas</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>
                <Search size={16} />
              </span>
              <input
                className={styles.searchInput}
                placeholder="Buscar mazos por título o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className={styles.newBtn}
              onClick={() => setShowGen(true)}
              type="button"
            >
              <Sparkles size={16} /> Generar con IA
            </button>
          </div>

          {/* Grid */}
          <CardGrid
            decks={filtered}
            onDeckClick={(deck) => setSelectedDeck(deck)}
            onDeleteDeck={handleDeleteClick}
            isLoading={isLoading}
            onNew={() => setShowGen(true)}
          />
        </div>

        {/* ── Diálogo generar ── */}
        <GenerateDialog
          open={showGen}
          onOpenChange={setShowGen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["decks"] });
          }}
        />

        {/* ── Confirmar eliminación ── */}
        <AlertDialog
          open={deletingId !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este mazo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán permanentemente
                todas las tarjetas de este mazo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingId(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader className={styles.spin} size={14} />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
