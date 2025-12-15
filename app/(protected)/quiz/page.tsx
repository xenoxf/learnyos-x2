"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileQuestion, Trophy, ChevronLeft, ChevronRight, Sparkles, RotateCcw, Target, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exam, ExamQuestion } from '@/types';

const difficultyConfig = {
  easy: { label: 'Fácil', color: 'bg-emerald-600' },
  medium: { label: 'Medio', color: 'bg-amber-600' },
  hard: { label: 'Difícil', color: 'bg-red-600' },
};

const QuizPage = () => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [topic, setTopic] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMode, setGenerateMode] = useState<'topic' | 'reference'>('topic');
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    const content = generateMode === 'topic' ? topic : referenceText;
    if (!content.trim()) {
      toast({ title: 'Error', description: 'Ingresa contenido', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiService.generateExam(
        generateMode === 'topic' ? { topic, numberOfQuestions, difficulty } : { referenceText, numberOfQuestions, difficulty }
      );
      if (result?.exam) {
        setExam(result.exam);
        setSelectedAnswers({});
        setShowResults(false);
        setCurrentQuestionIndex(0);
        setTopic('');
        setReferenceText('');
        setSheetOpen(false);
        toast({ title: `Examen con ${result.exam.totalQuestions} preguntas listo` });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQuestion = exam?.questions?.[currentQuestionIndex];
  const progress = exam?.questions ? ((currentQuestionIndex + 1) / exam.questions.length) * 100 : 0;

  const calculateScore = () => {
    if (!exam?.questions) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    exam.questions.forEach((q: ExamQuestion, idx: number) => {
      const selectedOptionIndex = selectedAnswers[idx];
      if (selectedOptionIndex !== undefined && q.options[selectedOptionIndex]?.isCorrect) correct++;
    });
    return {
      correct,
      total: exam.questions.length,
      percentage: Math.round((correct / exam.questions.length) * 100)
    };
  };

  const handleReset = () => {
    setExam(null);
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
  };

  // Results View
  if (showResults && exam) {
    const score = calculateScore();
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="h-14 border-b border-border flex items-center px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-purple-600" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Resultados</h1>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg text-center space-y-8">
            <div className={cn(
              "w-24 h-24 rounded-full mx-auto flex items-center justify-center",
              score.percentage >= 70 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"
            )}>
              <Trophy className={cn(
                "w-12 h-12",
                score.percentage >= 70 ? "text-emerald-600" : "text-amber-600"
              )} />
            </div>
            
            <div>
              <div className={cn(
                "text-6xl font-bold",
                score.percentage >= 70 ? "text-emerald-600" : "text-amber-600"
              )}>
                {score.percentage}%
              </div>
              <p className="text-lg text-muted-foreground mt-2">
                {score.correct} de {score.total} correctas
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {score.percentage >= 90 ? "¡Excelente trabajo!" : 
                 score.percentage >= 70 ? "¡Buen resultado!" : 
                 "Sigue practicando"}
              </p>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 justify-center max-w-md mx-auto">
              {exam.questions?.map((q: ExamQuestion, idx: number) => {
                const selectedOptionIndex = selectedAnswers[idx];
                const isCorrect = selectedOptionIndex !== undefined && q.options[selectedOptionIndex]?.isCorrect;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isCorrect
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={handleReset} className="bg-purple-600 hover:bg-purple-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Nuevo Examen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz View
  if (exam && currentQuestion) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border flex-shrink-0">
          <div className="h-14 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Pregunta {currentQuestionIndex + 1} de {exam.questions?.length}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Salir
            </Button>
          </div>
          <Progress value={progress} className="h-1 rounded-none" />
        </div>

        {/* Question */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl font-medium text-foreground mb-8">
              {currentQuestion.question}
            </p>
            
            <RadioGroup
              value={selectedAnswers[currentQuestionIndex]?.toString() ?? ''}
              onValueChange={value => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: parseInt(value) })}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
                    selectedAnswers[currentQuestionIndex] === idx
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                      : 'bg-muted/30 border-transparent hover:border-border'
                  )}
                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: idx })}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 text-base cursor-pointer">
                    {option.option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </ScrollArea>

        {/* Footer Controls */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex-1 h-12"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Anterior
            </Button>
            
            {currentQuestionIndex === (exam.questions?.length ?? 0) - 1 ? (
              <Button
                onClick={() => setShowResults(true)}
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Finalizar
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700"
              >
                Siguiente
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Generator Empty State
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <FileQuestion className="w-4 h-4 text-purple-600" />
          </div>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">Exámenes</h1>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96 p-0">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Generar Examen</h2>
                  <p className="text-sm text-muted-foreground mt-1">Crea un examen con IA</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Número de preguntas</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map(num => (
                      <button
                        key={num}
                        onClick={() => setNumberOfQuestions(num)}
                        className={cn(
                          "py-3 rounded-lg text-sm font-medium transition-all",
                          numberOfQuestions === num
                            ? "bg-purple-600 text-white"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Dificultad</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(difficultyConfig) as Array<'easy' | 'medium' | 'hard'>).map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={cn(
                          "py-3 rounded-lg text-sm font-medium transition-all",
                          difficulty === d
                            ? `${difficultyConfig[d].color} text-white`
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        )}
                      >
                        {difficultyConfig[d].label}
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
                      placeholder="Ej: Historia, Matemáticas..."
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
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generar Examen
                    </>
                  )}
                </Button>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Genera un Examen</h2>
          <p className="text-muted-foreground mb-8">Practica con preguntas generadas por inteligencia artificial</p>
          <Button onClick={() => setSheetOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Empezar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;