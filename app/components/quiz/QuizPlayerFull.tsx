"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Check, X, BookOpen, TrendingUp, ArrowLeft } from "lucide-react";
import styles from "@/styles/quiz/quizPlayerFull.module.css";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import type { ExamKlek, ExamQuestion } from "@/types";
import MarkdownRenderer from "../MarkdownRenderer";
import { useRouter } from "next/navigation";

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
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<ExamKlek | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setError(null);
        const data = await apiService.getExamForPlay(quizId);

        if (!data) {
          throw new Error('El quiz no existe o no está disponible');
        }

        if (!data.questions || data.questions.length === 0) {
          throw new Error(`El quiz "${data.title}" no tiene preguntas. Total: ${data.totalQuestions || 0}`);
        }

        setQuiz(data);
      } catch (err: any) {
        const message = err instanceof Error ? err.message : "Error al cargar quiz";
        console.error('Quiz loading error:', err);
        setError(message);
        toast({
          variant: "destructive",
          title: "Error al cargar",
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId, toast]);

  const handleSelectAnswer = useCallback((optionId: number, questionId: number) => {
    if (!showImmediateFeedback) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: optionId,
      }));
    }
  }, [showImmediateFeedback]);

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

  const handleSubmit = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleConfirmAnswer = useCallback(() => {
    setShowImmediateFeedback(true);
  }, []);

  const handleBack = useCallback(() => {
    router.push('/study/quiz');
  }, [router]);

  const calculateScore = useMemo(() => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q) => {
      const selectedId = selectedAnswers[q.id || 0];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selectedId === correctOption?.id) {
        correct++;
      }
    });
    return ((correct / quiz.questions.length) * 100).toFixed(1);
  }, [quiz, selectedAnswers]);

  // Calculate results for summary
  const results = useMemo(() => {
    if (!quiz) return { questionResults: [], failedQuestions: [], failedTopics: [] };
    
    const questionResults: QuestionResult[] = [];
    const failedQuestions: QuestionResult[] = [];
    const failedTopics: Set<string> = new Set();

    quiz.questions.forEach((q) => {
      const selectedId = selectedAnswers[q.id || 0];
      const correctOption = q.options.find((o) => o.isCorrect);
      const isCorrect = selectedId === correctOption?.id;

      const result: QuestionResult = {
        question: q,
        selectedOptionId: selectedId || null,
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
      "Practica con ejercicios similares para fortalecer las áreas débiles."
    );

    return recommendations;
  }, [quiz, results.failedTopics]);

  if (loading) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Cargando quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>Error al cargar el quiz</h2>
          <p className={styles.errorMessage}>{error || 'No se encontró el quiz'}</p>
          <button
            onClick={handleBack}
            className={styles.backButton}
          >
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
  const selectedOption = currentQuestion.options.find((o) => o.id === selectedOptionId);
  const correctOption = currentQuestion.options.find((o) => o.isCorrect);

  if (showResults) {
    const score = calculateScore;
    const correctCount = results.questionResults.filter((r) => r.isCorrect).length;

    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.resultsPage}>
          <div className={styles.resultsHeader}>
            <button onClick={handleBack} className={styles.backButtonSmall} type="button">
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            <h1 className={styles.resultsTitle}>Resultados</h1>
          </div>

          <div className={styles.resultsContent}>
            <div className={styles.scoreSection}>
              <div className={styles.scoreCircle}>
                <div className={styles.scoreValue}>{score}%</div>
                <div className={styles.scoreLabel}>Puntuación</div>
              </div>
              
              <p className={styles.scoreDetail}>
                Has acertado <strong>{correctCount}</strong> de <strong>{totalQuestions}</strong> preguntas
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
                      (o) => o.id === result.selectedOptionId
                    );
                    const correctOpt = result.question.options.find((o) => o.isCorrect);

                    return (
                      <div key={result.question.id} className={styles.failedQuestionCard}>
                        <div className={styles.failedQuestionHeader}>
                          <span className={styles.questionNumber}>Pregunta {idx + 1}</span>
                        </div>
                        
                        <p className={styles.failedQuestionText}>
                          <MarkdownRenderer content={result.question.question} />
                        </p>

                        <div className={styles.answerComparison}>
                          <div className={styles.userAnswer}>
                            <span className={styles.answerLabel}>Tu respuesta:</span>
                            <span className={styles.incorrectText}>
                              <X size={16} />
                              <MarkdownRenderer content={selectedOpt?.text || 'No respondida'} />
                            </span>
                          </div>
                          
                          <div className={styles.correctAnswer}>
                            <span className={styles.answerLabel}>Respuesta correcta:</span>
                            <span className={styles.correctText}>
                              <Check size={16} />
                              <MarkdownRenderer content={correctOpt?.text || 'N/A'} />
                            </span>
                          </div>
                        </div>

                        {result.question.explanation && (
                          <div className={styles.explanationBox}>
                            <BookOpen size={18} className={styles.explanationIcon} />
                            <div>
                              <strong>Explicación:</strong>
                              <MarkdownRenderer content={result.question.explanation} />
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

  return (
    <div className={styles.fullPageContainer}>
      <div className={styles.quizPage}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <button onClick={handleBack} className={styles.backButtonSmall} type="button">
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
            <h2 className={styles.questionText}>
              <MarkdownRenderer content={currentQuestion.question} />
            </h2>

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
                    className={`${styles.optionBtn} ${
                      isSelected && !showFeedback ? styles.selected : ""
                    } ${showCorrectState ? styles.correct : ""} ${
                      showWrongState ? styles.incorrect : ""
                    }`}
                    onClick={() => handleSelectAnswer(option.id, currentQuestion.id || 0)}
                    disabled={showFeedback}
                    type="button"
                  >
                    <span className={styles.optionText}>
                      <MarkdownRenderer content={option.text} />
                    </span>
                    {showCorrectState && <Check size={18} className={styles.iconCorrect} />}
                    {showWrongState && <X size={18} className={styles.iconIncorrect} />}
                  </button>
                );
              })}
            </div>

            {/* Immediate Feedback Section */}
            {showImmediateFeedback && (
              <div className={styles.immediateFeedback}>
                <div className={`${styles.feedbackHeader} ${
                  selectedOption?.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect
                }`}>
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
                      {selectedOption.isCorrect ? 'Por qué es correcta:' : 'Por qué tu respuesta es incorrecta:'}
                    </strong>
                    <MarkdownRenderer content={selectedOption.feedback} />
                  </div>
                )}

                {!selectedOption?.isCorrect && correctOption && (
                  <div className={styles.correctAnswerInfo}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>
                      <strong>La respuesta correcta era:</strong> {correctOption.text}
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

            <button
              className={`${styles.confirmButton} ${!selectedOptionId ? styles.disabled : ''}`}
              onClick={handleConfirmAnswer}
              disabled={!selectedOptionId}
              type="button"
            >
              <Check size={18} />
              <span>Confirmar</span>
            </button>
          </div>

          {currentIndex === totalQuestions - 1 && showImmediateFeedback && (
            <div className={styles.submitSection}>
              <button className={styles.submitButton} onClick={handleSubmit} type="button">
                Finalizar y Ver Resultados Completos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
