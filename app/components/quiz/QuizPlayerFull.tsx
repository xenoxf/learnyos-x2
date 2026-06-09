"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  BookOpen,
  TrendingUp,
  ArrowLeft,
  Hash,
  User,
  Calendar,
  Sparkles,
  Tag,
} from "lucide-react";
import styles from "@/styles/quiz/quizPlayerFull.module.css";
import QuizSkeleton from "./QuizSkeleton";
import { toast } from "@/hooks/useLocalToast";
import { errorHandler } from "@/services/errorHandler";
import type { ExamKlek, ExamQuestion } from "@/types";
import MarkdownRenderer from "../MarkdownRenderer";
import { useRouter } from "next/navigation";
import { quizzesService } from "@/services/quizzesService";
import { attemptsService } from "@/services/attemptsService";

interface QuizPlayerFullProps {
  quizId: number;
}

interface QuestionResult {
  question: ExamQuestion;
  selectedOptionId: number | null;
  isCorrect: boolean;
}

export default function QuizPlayerFull({ quizId }: QuizPlayerFullProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<ExamKlek | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isIcfesMode = quiz?.type === 'icfes';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setError(null);
        const data = await quizzesService.getExamForPlay(quizId);

        if (!data) {
          throw new Error("El quiz no existe o no está disponible");
        }

        if (!data.questions || data.questions.length === 0) {
          throw new Error(
            `El quiz "${data.title}" no tiene preguntas. Total: ${data.totalQuestions || 0}`,
          );
        }

        setQuiz(data);
      } catch (err: any) {
        const message =
          err instanceof Error ? err.message : "Error al cargar quiz";
        toast.error("Error", "No se pudo cargar el quiz");
        errorHandler(err, "Quiz loading error");
        setError(message);
        toast.info("");
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  // Group questions by context for ICFES mode
  const groupedQuestions = useMemo(() => {
    if (!quiz || !isIcfesMode) return null;

    const groups: Array<{
      contextId: string | null;
      contextContent: string | null;
      questions: ExamQuestion[];
    }> = [];
    let currentGroup: typeof groups[0] | null = null;

    quiz.questions.forEach((q) => {
      if (q.contextId && q.contextContent) {
        // New context group
        currentGroup = {
          contextId: q.contextId,
          contextContent: q.contextContent,
          questions: [q],
        };
        groups.push(currentGroup);
      } else if (q.contextId && currentGroup && currentGroup.contextId === q.contextId) {
        // Add to existing context group
        currentGroup.questions.push(q);
      } else {
        // Standalone question (no context)
        currentGroup = null;
        groups.push({
          contextId: null,
          contextContent: null,
          questions: [q],
        });
      }
    });

    return groups;
  }, [quiz, isIcfesMode]);

  const handleSelectAnswer = useCallback(
    (optionId: number, questionId: number) => {
      if (!showImmediateFeedback) {
        setSelectedAnswers((prev) => ({
          ...prev,
          [questionId]: optionId,
        }));
      }
    },
    [showImmediateFeedback],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < quiz!.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowImmediateFeedback(false);
    }
  }, [currentIndex, quiz]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowImmediateFeedback(false);
    }
  }, [currentIndex]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setShowImmediateFeedback(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    // Record attempt
    if (quiz) {
      const correctCount = quiz.questions.filter((q) => {
        const selectedId = selectedAnswers[q.id || 0];
        const correctOption = q.options.find((o) => o.isCorrect);
        return selectedId === correctOption?.id;
      }).length;
      try {
        await attemptsService.recordAttempt({
          examId: quiz.id,
          correctAnswers: correctCount,
          totalQuestions: quiz.questions.length,
          examTitle: quiz.title,
        });
      } catch {
        // Silent fail - don't block results
      }
    }
    setShowResults(true);
  }, [quiz, selectedAnswers]);

  const handleConfirmAnswer = useCallback(() => {
    setShowImmediateFeedback(true);
  }, []);

  const handleBack = useCallback(() => {
    router.push("/study/quiz");
  }, [router]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };



  // Calculate results for summary
  const results = useMemo(() => {
    if (!quiz)
      return { questionResults: [], failedQuestions: [], failedTopics: [] };

    const questionResults: QuestionResult[] = [];
    const failedQuestions: QuestionResult[] = [];
    const failedTopics: Set<string> = new Set();

    quiz.questions.forEach((q) => {
      const selectedId = selectedAnswers[q.id || 0];
      const correctOption = q.options.find((o) => o.isCorrect);
      // Consider unanswered questions as incorrect
      const isCorrect =
        selectedId !== undefined && selectedId === correctOption?.id;

      const result: QuestionResult = {
        question: q,
        selectedOptionId: selectedId !== undefined ? selectedId : null,
        isCorrect,
      };

      questionResults.push(result);

      if (!isCorrect) {
        failedQuestions.push(result);
        if (quiz.area) failedTopics.add(quiz.area);
        if (quiz.tema) failedTopics.add(quiz.tema);
      }
    });

    return {
      questionResults,
      failedQuestions,
      failedTopics: Array.from(failedTopics),
    };
  }, [quiz, selectedAnswers]);

  // Generate recommendations based on failed topics
  const getRecommendations = useCallback(() => {
    if (!quiz) return [];

    if (results.failedTopics.length === 0) {
      return [
        "¡Excelente trabajo! Has dominado todos los temas de este quiz.",
        "Continúa practicando con quizzes de mayor dificultad para reforzar tu conocimiento.",
      ];
    }

    const recommendations: string[] = [];

    results.failedTopics.forEach((topic) => {
      recommendations.push(`Repasa el tema: ${topic}`);
    });

    recommendations.push(
      "Revisa las explicaciones de las preguntas falladas para entender tus errores.",
      "Practica con ejercicios similares para fortalecer las áreas débiles.",
    );

    return recommendations;
  }, [quiz, results.failedTopics]);

  if (loading) {
    return <QuizSkeleton />;
  }

  if (error || !quiz) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>Error al cargar el quiz</h2>
          <p className={styles.errorMessage}>
            {error || "No se encontró el quiz"}
          </p>
          <button onClick={handleBack} className={styles.backButton}>
            <ArrowLeft size={18} />
            Volver a quizzes
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  if (!currentQuestion) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>Error: Pregunta no encontrada</h2>
          <button onClick={handleBack} className={styles.backButton}>
            <ArrowLeft size={18} />
            Volver a quizzes
          </button>
        </div>
      </div>
    );
  }

  const selectedOptionId = selectedAnswers[currentQuestion.id || 0];
  const selectedOption = currentQuestion.options.find(
    (o) => o.id === selectedOptionId,
  );
  const correctOption = currentQuestion.options.find((o) => o.isCorrect);

  if (showResults) {
    const correctCount = results.questionResults.filter(
      (r) => r.isCorrect,
    ).length;

    return (
      <div className={styles.fullPageContainerFed}>
        <div className={styles.resultsPage}>
          <div className={styles.resultsHeader}>
            <button
              onClick={handleBack}
              className={styles.backButtonSmall}
              type="button"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            <h1 className={styles.resultsTitle}>Resultados</h1>
          </div>

          <div className={styles.resultsContent}>
            {/* Exam Metadata Header */}
            <div className={styles.examMetadataHeader}>
              <h2 className={styles.examTitleResults}>{quiz.title}</h2>
              <div className={styles.metadataGrid}>
                {quiz.code && (
                  <div className={styles.metadataItem}>
                    <Hash size={16} />
                    <span className={styles.metadataLabel}>Código:</span>
                    <span className={styles.metadataValue}>{quiz.code}</span>
                  </div>
                )}
                {quiz.difficulty && (
                  <div className={styles.metadataItem}>
                    <Sparkles size={16} />
                    <span className={styles.metadataLabel}>Dificultad:</span>
                    <span className={`${styles.metadataValue} ${styles[`difficulty_${quiz.difficulty}`]}`}>
                      {{
                        very_easy: "Muy Fácil",
                        easy: "Fácil",
                        medium: "Medio",
                        hard: "Difícil",
                        very_hard: "Muy Difícil",
                        expert: "Experto",
                      }[quiz.difficulty] || quiz.difficulty}
                    </span>
                  </div>
                )}
                {quiz.area && (
                  <div className={styles.metadataItem}>
                    <Tag size={16} />
                    <span className={styles.metadataLabel}>Área:</span>
                    <span className={styles.metadataValue}>{quiz.area}</span>
                  </div>
                )}
                {quiz.tema && (
                  <div className={styles.metadataItem}>
                    <BookOpen size={16} />
                    <span className={styles.metadataLabel}>Tema:</span>
                    <span className={styles.metadataValue}>{quiz.tema}</span>
                  </div>
                )}
                {quiz.creatorName && (
                  <div className={styles.metadataItem}>
                    <User size={16} />
                    <span className={styles.metadataLabel}>Creador:</span>
                    <span className={styles.metadataValue}>{quiz.creatorName}</span>
                  </div>
                )}
                {quiz.createdAt && (
                  <div className={styles.metadataItem}>
                    <Calendar size={16} />
                    <span className={styles.metadataLabel}>Fecha:</span>
                    <span className={styles.metadataValue}>{formatDate(quiz.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.scoreSection}>
              <div className={styles.scoreCircle}>
                <div className={styles.scoreValue}>
                  {correctCount}/{totalQuestions}
                </div>
                <div className={styles.scoreLabel}>Buenas</div>
              </div>

              <p className={styles.scoreDetail}>
                Has acertado <strong>{correctCount}</strong> de{" "}
                <strong>{totalQuestions}</strong> preguntas
              </p>
            </div>

            {/* Failed Questions Summary */}
            {results.failedQuestions.length > 0 && (
              <div className={styles.failedQuestionsSection}>
                <h2 className={styles.sectionTitle}>
                  <X size={24} className={styles.errorIcon} />
                  Preguntas para Repasar ({results.failedQuestions.length})
                </h2>

                <div className={styles.failedQuestionsList}>
                  {results.failedQuestions.map((result, idx) => {
                    const selectedOpt = result.question.options.find(
                      (o) => o.id === result.selectedOptionId,
                    );
                    const correctOpt = result.question.options.find(
                      (o) => o.isCorrect,
                    );

                    return (
                      <div
                        key={result.question.id}
                        className={styles.failedQuestionCard}
                      >
                        <div className={styles.failedQuestionHeader}>
                          <span className={styles.questionNumber}>
                            Pregunta {idx + 1}
                          </span>
                        </div>

                        <p className={styles.failedQuestionText}>
                          <MarkdownRenderer
                            content={result.question.question}
                          />
                        </p>

                        <div className={styles.answerComparison}>
                          <div className={styles.userAnswer}>
                            <span className={styles.answerLabel}>
                              Tu respuesta:
                            </span>
                            <span className={styles.incorrectText}>
                              <X size={16} />
                              <MarkdownRenderer
                                content={selectedOpt?.text || "No respondida"}
                              />
                            </span>
                          </div>

                          <div className={styles.correctAnswer}>
                            <span className={styles.answerLabel}>
                              Respuesta correcta:
                            </span>
                            <span className={styles.correctText}>
                              <Check size={16} />
                              <MarkdownRenderer
                                content={correctOpt?.text || "N/A"}
                              />
                            </span>
                          </div>
                        </div>

                        {result.question.explanation && (
                          <div className={styles.explanationBox}>
                            <BookOpen
                              size={18}
                              className={styles.explanationIcon}
                            />
                            <div>
                              <strong>Explicación:</strong>
                              <MarkdownRenderer
                                content={result.question.explanation}
                              />
                            </div>
                          </div>
                        )}

                        {selectedOpt?.feedback && (
                          <div className={styles.feedbackBox}>
                            <strong>Por qué tu respuesta es incorrecta:</strong>
                            <MarkdownRenderer content={selectedOpt.feedback} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            <div className={styles.recommendationsSection}>
              <h2 className={styles.sectionTitle}>
                <TrendingUp size={20} />
                Recomendaciones de Estudio
              </h2>

              <div className={styles.recommendationsGrid}>
                {getRecommendations().map((rec, idx) => (
                  <div key={idx} className={styles.recommendationItem}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.resultActions}>
              <button
                className={styles.actionBtn}
                onClick={handleReset}
                type="button"
              >
                <RotateCcw size={18} />
                Intentar de nuevo
              </button>
              <button
                className={styles.actionBtnSecondary}
                onClick={handleBack}
                type="button"
              >
                Volver a Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ICFES Mode - Scroll-based with context groups
  if (isIcfesMode && groupedQuestions) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.icfesContainer}>
          {/* Header */}
          <div className={styles.pageHeader}>
            <button
              onClick={handleBack}
              className={styles.backButtonSmall}
              type="button"
            >
              <ArrowLeft size={18} />
              <span className={styles.backButtonText}>Volver</span>
            </button>
            <div className={styles.headerInfo}>
              <h1 className={styles.pageTitle}>{quiz.title}</h1>
              <p className={styles.pageMeta}>
                {totalQuestions} preguntas - Modo ICFES
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((Object.keys(selectedAnswers).length) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Scrollable Questions */}
          <div
            ref={scrollContainerRef}
            className={styles.icfesQuestionsContainer}
          >
            {groupedQuestions.map((group, groupIdx) => (
              <div key={groupIdx} className={styles.icfesGroup}>
                {/* Context Content */}
                {group.contextContent && group.contextContent !== "null" && group.contextContent.trim() !== "" && (
                  <div className={styles.icfesContext}>
                    <div className={styles.contextHeader}>
                      <BookOpen size={18} />
                      <span>Contexto / Lectura</span>
                    </div>
                    <div className={styles.contextContent}>
                      <MarkdownRenderer content={group.contextContent} />
                    </div>
                  </div>
                )}

                {/* Questions in this group */}
                {group.questions.map((question, _qIdx) => {
                  const questionIdx = quiz.questions.findIndex(q => q.id === question.id);
                  const selectedOptionId = selectedAnswers[question.id || 0];
                  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
                  const correctOption = question.options.find((o) => o.isCorrect);
                  const hasAnswered = selectedOptionId !== undefined;

                  return (
                    <div
                      key={question.id}
                      ref={(el) => { if (question.id !== undefined) questionRefs.current[question.id] = el; }}
                      className={styles.icfesQuestionCard}
                    >
                      <div className={styles.questionHeader}>
                        <span className={styles.questionNumber}>
                          Pregunta {questionIdx + 1}
                        </span>
                      </div>

                      <h2 className={styles.questionText}>
                        <MarkdownRenderer content={question.question} />
                      </h2>

                      <div className={styles.optionsContainer}>
                        {question.options.map((option) => {
                          const isSelected = selectedOptionId === option.id;
                          const showFeedback = hasAnswered && showImmediateFeedback;
                          const isCorrect = option.isCorrect;
                          const showCorrectState = showFeedback && isCorrect;
                          const showWrongState = showFeedback && isSelected && !isCorrect;

                          return (
                            <button
                              key={option.id}
                              className={`${styles.optionBtn} ${isSelected && !showFeedback ? styles.selected : ""
                                } ${showCorrectState ? styles.correct : ""} ${showWrongState ? styles.incorrect : ""
                                }`}
                              onClick={() =>
                                handleSelectAnswer(option.id, question.id || 0)
                              }
                              disabled={showFeedback}
                              type="button"
                            >
                              <span className={styles.optionText}>
                                <MarkdownRenderer content={option.text} />
                              </span>
                              {showCorrectState && (
                                <Check size={18} className={styles.iconCorrect} />
                              )}
                              {showWrongState && (
                                <X size={18} className={styles.iconIncorrect} />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Immediate Feedback */}
                      {showImmediateFeedback && hasAnswered && (
                        <div className={styles.immediateFeedback}>
                          <div
                            className={`${styles.feedbackHeader} ${selectedOption?.isCorrect
                              ? styles.feedbackCorrect
                              : styles.feedbackIncorrect
                              }`}
                          >
                            {selectedOption?.isCorrect ? (
                              <>
                                <Check size={18} />
                                <span>¡Correcto!</span>
                              </>
                            ) : (
                              <>
                                <X size={18} />
                                <span>Incorrecto</span>
                              </>
                            )}
                          </div>

                          {question.explanation && (
                            <div className={styles.feedbackContent}>
                              <BookOpen size={16} className={styles.infoIcon} />
                              <div>
                                <strong>Explicación:</strong>
                                <MarkdownRenderer content={question.explanation} />
                              </div>
                            </div>
                          )}

                          {selectedOption?.feedback && (
                            <div className={styles.feedbackContent}>
                              <strong>
                                {selectedOption.isCorrect
                                  ? "Por qué es correcta:"
                                  : "Por qué tu respuesta es incorrecta:"}
                              </strong>
                              <MarkdownRenderer content={selectedOption.feedback} />
                            </div>
                          )}

                          {!selectedOption?.isCorrect && correctOption && (
                            <div className={styles.correctAnswerInfo}>
                              <Check size={16} className={styles.checkIcon} />
                              <span>
                                <strong>La respuesta correcta era:</strong>{" "}
                                <MarkdownRenderer content={correctOption.text} />
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={styles.pageFooter}>
            <div className={styles.footerContent}>
              <div className={styles.progressInfo}>
                <span>
                  {Object.keys(selectedAnswers).length} de {totalQuestions} respondidas
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!showImmediateFeedback ? (
                  <button
                    className={`${styles.confirmButton} ${Object.keys(selectedAnswers).length === 0 ? styles.disabled : ""}`}
                    onClick={() => setShowImmediateFeedback(true)}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    type="button"
                  >
                    <Check size={18} />
                    <span>Confirmar Todas</span>
                  </button>
                ) : null}
                <button
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  type="button"
                >
                  Finalizar y Ver Resultados Completos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Mode - Pagination (existing code)
  return (
    <div className={styles.fullPageContainer}>
      <div className={styles.quizPage}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <button
            onClick={handleBack}
            className={styles.backButtonSmall}
            type="button"
          >
            <ArrowLeft size={18} />
            <span className={styles.backButtonText}>Volver</span>
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.pageTitle}>{quiz.title}</h1>
            <p className={styles.pageMeta}>
              Pregunta {currentIndex + 1} de {totalQuestions}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Content */}
        <div className={styles.mainContent}>
          <div className={styles.questionCard}>
            <div className={styles.questionText}>
              <MarkdownRenderer content={currentQuestion.question} />
            </div>

            <div className={styles.optionsContainer}>
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const showFeedback = showImmediateFeedback;
                const isCorrect = option.isCorrect;
                const showCorrectState = showFeedback && isCorrect;
                const showWrongState = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={option.id}
                    className={`${styles.optionBtn} ${isSelected && !showFeedback ? styles.selected : ""
                      } ${showCorrectState ? styles.correct : ""} ${showWrongState ? styles.incorrect : ""
                      }`}
                    onClick={() =>
                      handleSelectAnswer(option.id, currentQuestion.id || 0)
                    }
                    disabled={showFeedback}
                    type="button"
                  >
                    <span className={styles.optionText}>
                      <MarkdownRenderer content={option.text} />
                    </span>
                    {showCorrectState && (
                      <Check size={18} className={styles.iconCorrect} />
                    )}
                    {showWrongState && (
                      <X size={18} className={styles.iconIncorrect} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Immediate Feedback Section */}
            {showImmediateFeedback && (
              <div className={styles.immediateFeedback}>
                <div
                  className={`${styles.feedbackHeader} ${selectedOption?.isCorrect
                    ? styles.feedbackCorrect
                    : styles.feedbackIncorrect
                    }`}
                >
                  {selectedOption?.isCorrect ? (
                    <>
                      <Check size={18} />
                      <span>¡Correcto!</span>
                    </>
                  ) : (
                    <>
                      <X size={18} />
                      <span>Incorrecto</span>
                    </>
                  )}
                </div>

                {currentQuestion.explanation && (
                  <div className={styles.feedbackContent}>
                    <BookOpen size={16} className={styles.infoIcon} />
                    <div>
                      <strong>Explicación:</strong>
                      <MarkdownRenderer content={currentQuestion.explanation} />
                    </div>
                  </div>
                )}

                {selectedOption?.feedback && (
                  <div className={styles.feedbackContent}>
                    <strong>
                      {selectedOption.isCorrect
                        ? "Por qué es correcta:"
                        : "Por qué tu respuesta es incorrecta:"}
                    </strong>
                    <MarkdownRenderer content={selectedOption.feedback} />
                  </div>
                )}

                {!selectedOption?.isCorrect && correctOption && (
                  <div className={styles.correctAnswerInfo}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>
                      <strong>La respuesta correcta era:</strong>{" "}
                      <MarkdownRenderer content={correctOption.text} />
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className={styles.pageFooter}>
          <div className={styles.footerContent}>
            <button
              className={styles.navButton}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              type="button"
            >
              <ChevronLeft size={18} />
              <span className={styles.navButtonText}>Anterior</span>
            </button>

            {!showImmediateFeedback ? (
              <button
                className={`${styles.confirmButton} ${!selectedOptionId ? styles.disabled : ""}`}
                onClick={handleConfirmAnswer}
                disabled={!selectedOptionId}
                type="button"
              >
                <Check size={18} />
                <span>Confirmar</span>
              </button>
            ) : (
              <button
                className={styles.nextButton}
                onClick={handleNext}
                type="button"
              >
                <span>Siguiente</span>
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {currentIndex === totalQuestions - 1 && showImmediateFeedback && (
            <div className={styles.submitSection}>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                type="button"
              >
                Finalizar y Ver Resultados Completos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
