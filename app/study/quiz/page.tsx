"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCw,
  Loader,
  Brain,
  Clock,
  Trophy,
  AlertCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Sparkles,
  Calendar,
  FileText,
  Search,
  BookOpen,
  FileQuestion,
  X,
} from "lucide-react";
import type { Exam, ExamQuestion, ExamOption, GenerateExamData } from "@/types";
import styles from "@/styles/quiz.module.css";
import DashboardLayout from "../layaut";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import type { Metadata } from 'next';

interface ExamSession {
  exam: Exam;
  currentQuestion: number;
  answers: Record<number, string>;
  showResults: boolean;
  startTime: Date;
  elapsedTime: number;
}

interface ExamStats {
  examId: number;
  attempts: number;
  bestScore: number;
  averageTime: number;
  lastAttempt: Date | null;
}

export const dynamic = 'force-dynamic';

export default function QuizPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [examStats, setExamStats] = useState<Record<number, ExamStats>>({});
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Filtros de exámenes (alineado con backend: easy | medium | hard)
  const difficultyOptions = [
    { value: "all", label: "Todas" },
    { value: "easy", label: "Fácil" },
    { value: "medium", label: "Medio" },
    { value: "hard", label: "Difícil" },
  ];

  // Efecto para cargar exámenes
  useEffect(() => {
    loadExams();
    loadExamStats();
  }, []);

  // Efecto para filtrar exámenes
  useEffect(() => {
    let result = exams;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (exam) =>
          exam.title.toLowerCase().includes(term) ||
          exam.description?.toLowerCase().includes(term) ||
          exam.difficulty?.toLowerCase().includes(term),
      );
    }

    if (difficultyFilter !== "all") {
      result = result.filter((exam) => exam.difficulty === difficultyFilter);
    }

    setFilteredExams(result);
  }, [exams, searchTerm, difficultyFilter]);

  // Efecto para el timer del examen
  useEffect(() => {
    if (session && !session.showResults) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [session]);

  const normalizeExam = (exam: Exam): Exam => {
    if (!exam.questions?.length) return exam;
    return {
      ...exam,
      questions: exam.questions.map((q) => {
        const opts = Array.isArray(q.options) ? q.options : [];
        const correctOpt = opts.find(
          (o) => typeof o === "object" && (o as ExamOption).isCorrect
        ) as ExamOption | undefined;
        const correctAnswer =
          correctOpt?.text ?? (q as ExamQuestion & { correctAnswer?: string }).correctAnswer;
        return { ...q, correctAnswer, options: opts };
      }),
    };
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await apiService.getExams();
      const raw = Array.isArray(data) ? data : (data as { data?: Exam[] })?.data ?? [];
      const typedData = (raw as Exam[]).map(normalizeExam);
      setExams(typedData);
      setFilteredExams(typedData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No pudimos cargar los exámenes";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExamStats = async () => {
    try {
      // Simular carga de estadísticas (en un caso real, vendría del backend)
      const mockStats: Record<number, ExamStats> = {};
      for (let i = 1; i <= 10; i++) {
        mockStats[i] = {
          examId: i,
          attempts: Math.floor(Math.random() * 5) + 1,
          bestScore: Math.floor(Math.random() * 40) + 60,
          averageTime: Math.floor(Math.random() * 20) + 10,
          lastAttempt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          ),
        };
      }
      setExamStats(mockStats);
    } catch (error) {
      console.error("Error loading exam stats:", error);
    }
  };

  const startExam = (exam: Exam) => {
    setTimer(0);
    setSession({
      exam,
      currentQuestion: 0,
      answers: {},
      showResults: false,
      startTime: new Date(),
      elapsedTime: 0,
    });
  };

  const handleAnswer = (answer: string) => {
    if (!session) return;
    setSession({
      ...session,
      answers: {
        ...session.answers,
        [session.currentQuestion]: answer,
      },
    });
  };

  const handleNext = () => {
    if (!session) return;
    if (session.currentQuestion < session.exam.questions!.length - 1) {
      setSession({
        ...session,
        currentQuestion: session.currentQuestion + 1,
      });
    }
  };

  const handlePrevious = () => {
    if (!session || session.currentQuestion === 0) return;
    setSession({
      ...session,
      currentQuestion: session.currentQuestion - 1,
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!session) return;

      // Calcular tiempo transcurrido
      const elapsedTime = timer;

      // Calcular resultados
      const correctCount = (session.exam.questions || []).filter((q, idx) => {
        const userAnswer = session.answers[idx];
        const correctAnswer = q.correctAnswer;
        return userAnswer === correctAnswer;
      }).length;

      const total = session.exam.questions?.length || 0;
      const percentage = total > 0 ? (correctCount / total) * 100 : 0;

      // Actualizar estadísticas locales
      if (examStats[session.exam.id]) {
        const stats = examStats[session.exam.id];
        const newStats = {
          ...stats,
          attempts: stats.attempts + 1,
          bestScore: Math.max(stats.bestScore, percentage),
          averageTime: Math.round(
            (stats.averageTime * stats.attempts + elapsedTime) /
              (stats.attempts + 1),
          ),
          lastAttempt: new Date(),
        };
        setExamStats((prev) => ({
          ...prev,
          [session.exam.id]: newStats,
        }));
      }

      setSession({
        ...session,
        showResults: true,
        elapsedTime,
      });

      toast({
        title:
          percentage >= 70 ? "¡Excelente trabajo! 🎉" : "¡Buen esfuerzo! 💪",
        description: `Obtuviste ${correctCount} de ${total} correctas (${Math.round(percentage)}%)`,
        variant: percentage >= 70 ? "default" : "default",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar el examen";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    setSession(null);
    setTimer(0);
  };

  const handleGenerateExam = async (data: Partial<GenerateExamData>) => {
    try {
      setGenerating(true);
      const response = await apiService.generateExam(data as GenerateExamData);

      if (response) {
        toast({
          title: "¡Examen generado!",
          description: "Tu examen personalizado está listo",
        });
        await loadExams();
        setShowGenerateModal(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al generar el examen";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "default";
      case "medium":
        return "outline";
      case "hard":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Función para compartir resultados
  const handleShareResults = async () => {
    if (!session || !session.showResults) return;

    const correctCount = (session.exam.questions || []).filter((q, idx) => {
      return session.answers[idx] === q.correctAnswer;
    }).length;
    const total = session.exam.questions?.length || 0;
    const percentage = Math.round((correctCount / total) * 100);

    const text = `🎯 Acabo de completar el examen "${session.exam.title}" con un ${percentage}% de aciertos (${correctCount}/${total}) en ${formatTime(session.elapsedTime)} minutos. ¡Pruébalo tú también!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Resultados de examen",
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback para copiar al portapapeles
      navigator.clipboard.writeText(text);
      toast({
        title: "¡Copiado!",
        description: "Los resultados se copiaron al portapapeles",
      });
    }
  };

  // Renderizado de carga
  if (loading && !session) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.centerContent}>
            <div className={styles.loadingAnimation}>
              <Brain className={styles.spinner} />
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <p className={styles.loadingText}>Cargando exámenes...</p>
            <p className={styles.loadingSubtext}>
              Preparando tu experiencia de estudio
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mostrar examen en progreso
  if (session && !session.showResults) {
    const question = session.exam.questions?.[session.currentQuestion];
    const progress =
      ((session.currentQuestion + 1) / (session.exam.questions?.length || 1)) *
      100;
    const hasAnswered = session.answers[session.currentQuestion] !== undefined;

    if (!question) {
      return (
        <DashboardLayout>
          <div className={styles.container}>
            <Card className={styles.errorCard}>
              <AlertCircle className={styles.errorIcon} />
              <h3 className={styles.errorTitle}>
                Error: Pregunta no encontrada
              </h3>
              <p className={styles.errorDescription}>
                La pregunta que intentas acceder no está disponible.
              </p>
              <Button
                onClick={handleExit}
                variant="outline"
                className={styles.errorButton}
              >
                Volver a exámenes
              </Button>
            </Card>
          </div>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        <div className={styles.examContainer}>
          {/* Header del examen */}
          <div className={styles.examHeader}>
            <div className={styles.examHeaderTop}>
              <div>
                <h1 className={styles.examTitle}>
                  <Target className={styles.examTitleIcon} />
                  {session.exam.title}
                </h1>
                <div className={styles.examMeta}>
                  <Badge variant={getDifficultyColor(session.exam.difficulty)}>
                    {session.exam.difficulty || "Sin definir"}
                  </Badge>
                  <span className={styles.examStat}>
                    <Clock size={14} />
                    {formatTime(timer)}
                  </span>
                  <span className={styles.examStat}>
                    <Brain size={14} />
                    {session.currentQuestion + 1}/
                    {session.exam.questions?.length}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExit}
                className={styles.exitButton}
              >
                Salir
              </Button>
            </div>

            <Progress value={progress} className={styles.progressBar} />
            <div className={styles.progressLabels}>
              <span>Progreso: {Math.round(progress)}%</span>
              <span>
                {session.currentQuestion + 1} de{" "}
                {session.exam.questions?.length}
              </span>
            </div>
          </div>

          {/* Tarjeta de pregunta */}
          <Card className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <div className={styles.questionNumber}>
                <span className={styles.numberBadge}>
                  Pregunta {session.currentQuestion + 1}
                </span>
                {session.exam.difficulty && (
                  <Badge variant="outline" className={styles.difficultyBadge}>
                    {session.exam.difficulty}
                  </Badge>
                )}
              </div>
              <div className={styles.questionPoints}>
                <Zap size={16} />
                <span>Valor: {question.correctAnswer || 1} punto(s)</span>
              </div>
            </div>
            {question.question && (
              <div className={styles.questionBody}>
                <MarkdownRenderer content={question.question} />
              </div>
            )}

            {/* Opciones de respuesta */}
            <div className={styles.optionsContainer}>
              {question.options && question.options.length > 0 ? (
                question.options.map(
                  (option: ExamOption | string, idx: number) => {
                    const optionText =
                      typeof option === "string" ? option : option.text;
                    const isSelected =
                      session.answers[session.currentQuestion] === optionText;
                    const optionId = `${session.currentQuestion}_${idx}`;

                    return (
                      <div
                        key={optionId}
                        className={`${styles.optionWrapper} ${isSelected ? styles.optionSelected : ""}`}
                        onClick={() => handleAnswer(optionText)}
                      >
                        <input
                          type="radio"
                          id={optionId}
                          name={`question_${session.currentQuestion}`}
                          checked={isSelected}
                          onChange={() => {}}
                          className={styles.optionInput}
                        />
                        <label
                          htmlFor={optionId}
                          className={styles.optionLabel}
                        >
                          <div className={styles.optionMarker}>
                            <span className={styles.optionLetter}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                          </div>
                          <div className={styles.optionContent}>
                            <span className={styles.optionText}>
                              <MarkdownRenderer content={optionText} />
                            </span>
                          </div>
                        </label>
                      </div>
                    );
                  },
                )
              ) : (
                <div className={styles.noOptions}>
                  <AlertCircle size={20} />
                  <span>No hay opciones disponibles para esta pregunta</span>
                </div>
              )}
            </div>
          </Card>

          {/* Navegación */}
          <div className={styles.navigation}>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={session.currentQuestion === 0}
              className={styles.navButton}
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>

            <div className={styles.navCenter}>
              {hasAnswered && (
                <div className={styles.answerStatus}>
                  <CheckCircle2 size={16} />
                  <span>Respondida</span>
                </div>
              )}
            </div>

            {session.currentQuestion <
            (session.exam.questions?.length || 0) - 1 ? (
              <Button
                onClick={handleNext}
                className={styles.navButton}
                disabled={!hasAnswered}
              >
                Siguiente
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !hasAnswered}
                className={styles.submitButton}
              >
                {submitting ? (
                  <>
                    <Loader className={styles.buttonSpinner} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Trophy size={16} />
                    Finalizar Examen
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Indicadores de preguntas */}
          <div className={styles.questionIndicators}>
            {(session.exam.questions || []).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSession({ ...session, currentQuestion: idx })}
                className={`${styles.questionIndicator} ${
                  idx === session.currentQuestion ? styles.indicatorActive : ""
                } ${session.answers[idx] ? styles.indicatorAnswered : styles.indicatorUnanswered}`}
                aria-label={`Ir a pregunta ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mostrar resultados
  if (session && session.showResults) {
    const correctCount = (session.exam.questions || []).filter((q, idx) => {
      const userAnswer = session.answers[idx];
      const correctAnswer = q.correctAnswer;
      return userAnswer === correctAnswer;
    }).length;

    const total = session.exam.questions?.length || 0;
    const percentage = total > 0 ? (correctCount / total) * 100 : 0;
    const stats = examStats[session.exam.id];
    const passed = percentage >= 70;

    return (
      <DashboardLayout>
        <div className={styles.resultsContainer}>
          {/* Encabezado de resultados */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsTitleSection}>
              <div className={styles.resultsIcon}>
                {passed ? <Trophy size={24} /> : <Brain size={24} />}
              </div>
              <div>
                <h1 className={styles.resultsTitle}>Resultados del Examen</h1>
                <p className={styles.resultsSubtitle}>{session.exam.title}</p>
              </div>
            </div>

            <div className={styles.resultsMeta}>
              <div className={styles.metaItem}>
                <Clock size={16} />
                <span>Tiempo: {formatTime(session.elapsedTime)}</span>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={16} />
                <span>Fecha: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Resumen principal */}
          <Card
            className={`${styles.resultsSummary} ${passed ? styles.resultsPassed : styles.resultsFailed}`}
          >
            <div className={styles.scoreCircle}>
              <div className={styles.scorePercentage}>
                {Math.round(percentage)}%
              </div>
              <svg className={styles.scoreRing} viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={styles.scoreRingBackground}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={styles.scoreRingFill}
                  style={{
                    strokeDasharray: `${percentage * 2.83} 283`,
                  }}
                />
              </svg>
            </div>

            <div className={styles.scoreDetails}>
              <h3 className={styles.scoreTitle}>
                {passed ? "¡Felicidades! 🎉" : "¡Buen esfuerzo! 💪"}
              </h3>
              <div className={styles.scoreStats}>
                <div className={styles.scoreStat}>
                  <span className={styles.statLabel}>Correctas</span>
                  <span className={styles.statValue}>{correctCount}</span>
                </div>
                <div className={styles.scoreStat}>
                  <span className={styles.statLabel}>Total</span>
                  <span className={styles.statValue}>{total}</span>
                </div>
                <div className={styles.scoreStat}>
                  <span className={styles.statLabel}>Tiempo</span>
                  <span className={styles.statValue}>
                    {formatTime(session.elapsedTime)}
                  </span>
                </div>
              </div>

              <div className={styles.recommendation}>
                {passed ? (
                  <p>
                    Has demostrado un excelente dominio del tema. ¡Sigue así!
                  </p>
                ) : (
                  <p>
                    Te recomendamos repasar los conceptos antes de intentarlo
                    nuevamente.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Estadísticas comparativas */}
          {stats && (
            <Card className={styles.comparisonCard}>
              <div className={styles.comparisonHeader}>
                <BarChart3 size={20} />
                <h3 className={styles.comparisonTitle}>Tus Estadísticas</h3>
              </div>
              <div className={styles.comparisonStats}>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonLabel}>
                    Mejor puntuación
                  </span>
                  <div className={styles.comparisonBar}>
                    <div
                      className={styles.comparisonFill}
                      style={{ width: `${stats.bestScore}%` }}
                    >
                      {stats.bestScore}%
                    </div>
                  </div>
                </div>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonLabel}>
                    Promedio tiempo
                  </span>
                  <div className={styles.comparisonValue}>
                    {stats.averageTime} min
                  </div>
                </div>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonLabel}>Intentos</span>
                  <div className={styles.comparisonValue}>{stats.attempts}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Detalles pregunta por pregunta */}
          <div className={styles.detailsSection}>
            <h3 className={styles.detailsTitle}>Revisión de respuestas</h3>
            <div className={styles.detailsContainer}>
              {(session.exam.questions || []).map(
                (q: ExamQuestion, idx: number) => {
                  const userAnswer = session.answers[idx];
                  const isCorrect = userAnswer === q.correctAnswer;

                  return (
                    <Card
                      key={idx}
                      className={`${styles.resultCard} ${isCorrect ? styles.resultCorrect : styles.resultIncorrect}`}
                    >
                      <div className={styles.resultHeader}>
                        <div className={styles.resultStatus}>
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className={styles.resultIcon} />
                              <span className={styles.statusText}>
                                Correcta
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className={styles.resultIcon} />
                              <span className={styles.statusText}>
                                Incorrecta
                              </span>
                            </>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={styles.questionNumberBadge}
                        >
                          Pregunta {idx + 1}
                        </Badge>
                      </div>

                      <div className={styles.resultContent}>
                        <p className={styles.resultQuestion}>{q.question}</p>

                        <div className={styles.answerComparison}>
                          <div className={styles.answerItem}>
                            <span className={styles.answerLabel}>
                              Tu respuesta:
                            </span>
                            <span
                              className={`${styles.answerValue} ${!isCorrect ? styles.answerWrong : ""}`}
                            >
                              {userAnswer || "No respondiste"}
                            </span>
                          </div>

                          {!isCorrect && (
                            <div className={styles.answerItem}>
                              <span className={styles.answerLabel}>
                                Respuesta correcta:
                              </span>
                              <span
                                className={`${styles.answerValue} ${styles.answerCorrect}`}
                              >
                                {q.correctAnswer}
                              </span>
                            </div>
                          )}
                        </div>

                        {q.explanation && (
                          <div className={styles.explanationBox}>
                            <span className={styles.explanationTitle}>
                              Explicación:
                            </span>
                            <div className={styles.explanationText}>
                              <MarkdownRenderer content={q.explanation} />
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                },
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className={styles.resultsActions}>
            <Button
              onClick={handleExit}
              variant="outline"
              className={styles.actionButton}
            >
              <RotateCw size={16} />
              Volver a Exámenes
            </Button>

            <Button
              onClick={() => startExam(session.exam)}
              className={styles.actionButton}
            >
              <Brain size={16} />
              Reintentar Examen
            </Button>

            <Button
              onClick={handleShareResults}
              variant="ghost"
              className={styles.actionButton}
            >
              <Sparkles size={16} />
              Compartir Resultados
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mostrar lista de exámenes (pantalla principal)
  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>
                <Brain className={styles.titleIcon} />
                Exámenes de Práctica
              </h1>
              <p className={styles.description}>
                Mejora tus habilidades con exámenes interactivos y
                personalizados
              </p>
            </div>
            <Button
              onClick={() => setShowGenerateModal(true)}
              className={styles.generateButton}
            >
              <Zap size={16} />
              Generar Examen
            </Button>
          </div>

          {/* Filtros y búsqueda */}
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Buscar exámenes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <div className={styles.searchIcon}>
                <Search size={18} />
              </div>
            </div>

            <div className={styles.difficultyFilter}>
              <span className={styles.filterLabel}>Dificultad:</span>
              <div className={styles.filterOptions}>
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDifficultyFilter(option.value)}
                    className={`${styles.filterOption} ${difficultyFilter === option.value ? styles.filterActive : ""}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className={styles.statsSummary}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{exams.length}</span>
              <span className={styles.statLabel}>Exámenes</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {Object.values(examStats).reduce(
                  (sum, stat) => sum + stat.attempts,
                  0,
                )}
              </span>
              <span className={styles.statLabel}>Intentos totales</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {Math.round(
                  Object.values(examStats).reduce(
                    (sum, stat) => sum + stat.bestScore,
                    0,
                  ) / Object.keys(examStats).length || 0,
                )}
                %
              </span>
              <span className={styles.statLabel}>Puntuación promedio</span>
            </div>
          </div>
        </div>

        {/* Grid de exámenes */}
        {filteredExams.length === 0 ? (
          <Card className={styles.emptyState}>
            <div className={styles.emptyIllustration}>
              <FileText size={48} />
            </div>
            <h3 className={styles.emptyTitle}>
              {searchTerm || difficultyFilter !== "all"
                ? "No se encontraron exámenes"
                : "No hay exámenes disponibles"}
            </h3>
            <p className={styles.emptyDescription}>
              {searchTerm || difficultyFilter !== "all"
                ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                : "¡Crea tu primer examen personalizado para comenzar!"}
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setDifficultyFilter("all");
                if (exams.length === 0) setShowGenerateModal(true);
              }}
              className={styles.emptyButton}
            >
              {exams.length === 0 ? "Crear Examen" : "Ver todos"}
            </Button>
          </Card>
        ) : (
          <div className={styles.grid}>
            {filteredExams.map((exam) => {
              const stats = examStats[exam.id];
              const questionCount =
                exam.totalQuestions || exam.questions?.length || 0;

              return (
                <Card
                  key={exam.id}
                  className={styles.examCard}
                  onClick={() => startExam(exam)}
                >
                  <div className={styles.examCardHeader}>
                    <div className={styles.examCardIcon}>
                      <Target size={20} />
                    </div>
                    <Badge
                      variant={getDifficultyColor(exam.difficulty)}
                      className={styles.examDifficulty}
                    >
                      {exam.difficulty || "General"}
                    </Badge>
                  </div>

                  <h3 className={styles.examCardTitle}>{exam.title}</h3>

                  {exam.description && (
                    <p className={styles.examCardDescription}>
                      {exam.description}
                    </p>
                  )}

                  <div className={styles.examCardMeta}>
                    <div className={styles.metaItem}>
                      <FileQuestion size={14} />
                      <span>{questionCount} preguntas</span>
                    </div>
                    {exam.difficulty && (
                      <div className={styles.metaItem}>
                        <BookOpen size={14} />
                        <span>{exam.difficulty}</span>
                      </div>
                    )}
                    {stats && (
                      <div className={styles.metaItem}>
                        <Trophy size={14} />
                        <span>Mejor: {stats.bestScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.examCardFooter}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        startExam(exam);
                      }}
                      className={styles.examCardButton}
                    >
                      <ArrowRight size={16} />
                      Comenzar
                    </Button>

                    {stats && stats.attempts > 0 && (
                      <div className={styles.examStats}>
                        <span className={styles.statsText}>
                          {stats.attempts} intento
                          {stats.attempts !== 1 ? "s" : ""}
                        </span>
                        <span className={styles.statsDot}>•</span>
                        <span className={styles.statsText}>
                          Último:{" "}
                          {stats.lastAttempt
                            ? new Date(stats.lastAttempt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal para generar examen */}
        {showGenerateModal && (
          <div className={styles.modalOverlay}>
            <Card className={styles.generateModal}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  <Zap size={20} />
                  Generar Examen Personalizado
                </h3>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className={styles.modalClose}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tema del examen</label>
                  <input
                    type="text"
                    placeholder="Ej: Matemáticas, Historia, Programación..."
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Referencia o texto</label>
                  <textarea
                    placeholder="Pega aquí el texto sobre el que quieres que se base el examen..."
                    className={styles.formTextarea}
                    rows={4}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Número de preguntas
                    </label>
                    <select className={styles.formSelect}>
                      <option value="5">5 preguntas</option>
                      <option value="10">10 preguntas</option>
                      <option value="15">15 preguntas</option>
                      <option value="20">20 preguntas</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Dificultad</label>
                    <select className={styles.formSelect}>
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <Button
                    variant="outline"
                    onClick={() => setShowGenerateModal(false)}
                    className={styles.formButton}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleGenerateExam({})}
                    disabled={generating}
                    className={styles.formButton}
                  >
                    {generating ? (
                      <>
                        <Loader className={styles.buttonSpinner} />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generar Examen
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
