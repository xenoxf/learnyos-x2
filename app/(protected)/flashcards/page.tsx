"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft, ChevronRight, RotateCcw, Sparkles, Layers, Settings2, Lightbulb, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Card as CardType, FlashCard } from '@/types';

const FlashcardsPage = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [topic, setTopic] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [numberOfCards, setNumberOfCards] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generateMode, setGenerateMode] = useState<'topic' | 'reference'>('topic');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getCards();
        setCards(data || []);
        if (data && data.length > 0) setSelectedCardId(data[0].id);
      } catch (error: any) {
        console.error('Error loading cards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCards();
  }, []);

  const handleGenerate = async () => {
    const content = generateMode === 'topic' ? topic : referenceText;
    if (!content.trim()) {
      toast({ title: 'Error', description: 'Ingresa contenido', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      let cardId = selectedCardId;
      if (!cardId && cards.length === 0) {
        const newCard = await apiService.createCard({ title: generateMode === 'topic' ? topic : 'Flashcards' });
        setCards([newCard]);
        cardId = newCard.id;
        setSelectedCardId(cardId);
      }

      const result = await apiService.generateFlashcards(
        generateMode === 'topic' ? { topic, numberOfCards } : { referenceText, numberOfCards }
      );
      if (result?.flashcards) {
        setFlashcards(result.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setMasteredCards(new Set());
        setTopic('');
        setReferenceText('');
        setSheetOpen(false);
        toast({ title: `${result.flashcards.length} flashcards generadas` });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  const toggleMastered = () => {
    setMasteredCards(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-orange-600" />
          </div>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">Flashcards</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {flashcards.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFlashcards([]);
                setCurrentIndex(0);
                setMasteredCards(new Set());
              }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reiniciar</span>
            </Button>
          )}
          
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gap-2 bg-orange-600 hover:bg-orange-700">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Generar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 p-0">
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Generar Flashcards</h2>
                  <p className="text-sm text-muted-foreground mt-1">Crea tarjetas de estudio con IA</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Cantidad de tarjetas</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map(num => (
                      <button
                        key={num}
                        onClick={() => setNumberOfCards(num)}
                        className={cn(
                          "py-3 rounded-lg text-sm font-medium transition-all",
                          numberOfCards === num
                            ? "bg-orange-600 text-white"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex rounded-lg bg-muted/50 p-1">
                  <button
                    onClick={() => setGenerateMode('topic')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                      generateMode === 'topic' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Por Tema
                  </button>
                  <button
                    onClick={() => setGenerateMode('reference')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                      generateMode === 'reference' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Por Texto
                  </button>
                </div>

                {generateMode === 'topic' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tema</label>
                    <Input
                      placeholder="Ej: Biología celular, Historia..."
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Texto de referencia</label>
                    <Textarea
                      placeholder="Pega el texto..."
                      value={referenceText}
                      onChange={e => setReferenceText(e.target.value)}
                      className="min-h-[150px] resize-none"
                      disabled={isGenerating}
                    />
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !(generateMode === 'topic' ? topic : referenceText).trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generar Flashcards
                    </>
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 min-h-0">
        {flashcards.length > 0 && currentCard ? (
          <div className="w-full max-w-2xl space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {currentIndex + 1} de {flashcards.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({masteredCards.size} dominadas)
                </span>
              </div>
              <Progress value={progress} className="w-32 h-2" />
            </div>

            {/* Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer perspective-1000"
            >
              <div className={cn(
                "relative w-full aspect-[16/10] md:aspect-[16/9] transition-all duration-500 transform-style-3d",
                isFlipped && "rotate-y-180"
              )}>
                {/* Front */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl backface-hidden flex flex-col items-center justify-center p-6 md:p-10 text-center",
                  "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800/50",
                  !isFlipped ? "visible" : "invisible"
                )}>
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-4">Pregunta</span>
                  <p className="text-xl md:text-2xl font-medium text-foreground">{currentCard.question}</p>
                  {currentCard.hint && (
                    <div className="flex items-center gap-2 mt-6 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <Lightbulb className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-700 dark:text-orange-400">{currentCard.hint}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-6">Toca para ver la respuesta</p>
                </div>

                {/* Back */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 md:p-10 text-center",
                  "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800/50",
                  isFlipped ? "visible" : "invisible"
                )}>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-4">Respuesta</span>
                  <p className="text-xl md:text-2xl font-medium text-foreground">{currentCard.answer}</p>
                  <p className="text-xs text-muted-foreground mt-6">Toca para ver la pregunta</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => { setCurrentIndex(currentIndex - 1); setIsFlipped(false); }}
                disabled={currentIndex === 0}
                variant="outline"
                className="flex-1 h-12"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Anterior
              </Button>
              
              <Button
                onClick={toggleMastered}
                variant={masteredCards.has(currentIndex) ? "default" : "outline"}
                className={cn(
                  "h-12 px-4",
                  masteredCards.has(currentIndex) && "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                <CheckCircle className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => { setCurrentIndex(currentIndex + 1); setIsFlipped(false); }}
                disabled={currentIndex === flashcards.length - 1}
                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700"
              >
                Siguiente
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Card Navigator */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {flashcards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrentIndex(idx); setIsFlipped(false); }}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                    idx === currentIndex
                      ? "bg-orange-600 text-white"
                      : masteredCards.has(idx)
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6">
              <Layers className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Genera Flashcards</h2>
            <p className="text-muted-foreground mb-8">Crea tarjetas de estudio personalizadas con inteligencia artificial</p>
            <Button onClick={() => setSheetOpen(true)} className="bg-orange-600 hover:bg-orange-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Empezar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;