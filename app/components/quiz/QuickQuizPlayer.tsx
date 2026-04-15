"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { RotateCcw, Check, X, BookOpen, TrendingUp, ArrowLeft, Zap } from "lucide-react";
import styles from "@/styles/quiz/quickQuizPlayer.module.css";
import { toast } from "@/hooks/useLocalToast";
import type { QuickQuizKlek, QuickQuizQuestion } from "@/types";
import MarkdownRenderer from "../MarkdownRenderer";
import { useRouter } from "next/navigation";
import { quickQuizzesService } from "@/services/quizzesService";
import { attemptsService } from "@/services/attemptsService";

interface QuickQuizPlayerProps {
  quizId: number;
}

interface QuestionResult {
  question: QuickQuizQuestion;
  selectedOptionId: number | null;
  isCorrect: boolean;
}

export default function QuickQuizPlayer({ quizId }: QuickQuizPlayerProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuickQuizKlek | null>(null);
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
        const data = await quickQuizzesService.getQuizForPlay(quizId);
        if (!data) throw new Error("El quiz no existe o no está disponible");
        if (!data.questions || data.questions.length === 0) {
          throw new Error(`El quiz "${data.title}" no tiene preguntas.`);
        }
        setQuiz(data);
      } catch (err: any) {
        const message = err instanceof Error ? err.message : "Error al cargar";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  const handleSelectAnswer = useCallback(
    (optionId: number, questionId: number) => {
      if (!showImmediateFeedback) {
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
      }
    },
    [showImmediateFeedback],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < (quiz?.questions.length || 0) - 1) {
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

  const handleConfirmAnswer = useCallback(() => {
    setShowImmediateFeedback(true);
  }, []);

  const handleSubmit = useCallback(async () => {
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
      } catch { /* silent */ }
    }
    setShowResults(true);
  }, [quiz, selectedAnswers]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setShowImmediateFeedback(false);
  }, []);

  const handleBack = useCallback(() => {
    router.push("/study/quick-quiz");
  }, [router]);

  const calculateScore = useMemo(() => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q) => {
      const selectedId = selectedAnswers[q.id || 0];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selectedId === correctOption?.id) correct++;
    });
    return ((correct / quiz.questions.length) * 100).toFixed(1);
  }, [quiz, selectedAnswers]);

  const results = useMemo(() => {
    if (!quiz) return { questionResults: [], failedQuestions: [], failedTopics: [] };
    const questionResults: QuestionResult[] = [];
    const failedQuestions: QuestionResult[] = [];
    const failedTopics = new Set<string>();

    quiz.questions.forEach((q) => {
      const selectedId = selectedAnswers[q.id || 0];
      const correctOption = q.options.find((o) => o.isCorrect);
      const isCorrect = selectedId !== undefined && selectedId === correctOption?.id;
      const result: QuestionResult = { question: q, selectedOptionId: selectedId ?? null, isCorrect };
      questionResults.push(result);
      if (!isCorrect) {
        failedQuestions.push(result);
        if (quiz.area) failedTopics.add(quiz.area);
        if (quiz.tema) failedTopics.add(quiz.tema);
      }
    });

    return { questionResults, failedQuestions, failedTopics: Array.from(failedTopics) };
  }, [quiz, selectedAnswers]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.center}>
          <div className={styles.spinner} />
          <p>Cargando quiz rápido...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className={styles.container}>
        <div className={styles.center}>
          <h2 className={styles.errorTitle}>Error</h2>
          <p>{error || "No se encontró el quiz"}</p>
          <button onClick={handleBack} className={styles.btnPrimary}>
            <ArrowLeft size={18} /> Volver
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = results.questionResults.filter((r) => r.isCorrect).length;
    return (
      <div className={styles.container}>
        <div className={styles.resultsPage}>
          <div className={styles.resultsHeader}>
            <button onClick={handleBack} className={styles.btnSmall}>
              <ArrowLeft size={18} /> Volver
            </button>
            <h1 className={styles.resultsTitle}>Resultados</h1>
          </div>

          <div className={styles.resultsContent}>
            <div className={styles.scoreSection}>
              <div className={styles.scoreCircle}>
                <div className={styles.scoreValue}>{correctCount}/{quiz.totalQuestions}</div>
                <div className={styles.scoreLabel}>Buenas</div>
              </div>
              <p className={styles.scoreDetail}>
                Acertaste <strong>{correctCount}</strong> de <strong>{quiz.totalQuestions}</strong> ({calculateScore}%)
              </p>
            </div>

            {results.failedQuestions.length > 0 && (
              <div className={styles.failedSection}>
                <h2 className={styles.sectionTitle}>
                  <X size={20} /> Preguntas para repasar
                </h2>
                <div className={styles.failedList}>
                  {results.failedQuestions.map((result, idx) => {
                    const selectedOpt = result.question.options.find((o) => o.id === result.selectedOptionId);
                    const correctOpt = result.question.options.find((o) => o.isCorrect);
                    return (
                      <div key={result.question.id} className={styles.failedCard}>
                        <span className={styles.qNum}>Pregunta {idx + 1}</span>
                        <p className={styles.qText}><MarkdownRenderer content={result.question.question} /></p>
                        <div className={styles.comparison}>
                          <div className={styles.userAns}>
                            <span>Tu respuesta:</span>
                            <span className={styles.wrong}><X size={14} /> {selectedOpt?.text || "No respondida"}</span>
                          </div>
                          <div className={styles.correctAns}>
                            <span>Correcta:</span>
                            <span className={styles.right}><Check size={14} /> {correctOpt?.text}</span>
                          </div>
                        </div>
                        {result.question.explanation && (
                          <div className={styles.explanation}>
                            <BookOpen size={14} />
                            <MarkdownRenderer content={result.question.explanation} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.recommendations}>
              <h2 className={styles.sectionTitle}><TrendingUp size={18} /> Recomendaciones</h2>
              <div className={styles.recGrid}>
                {results.failedTopics.length === 0 ? (
                  <div className={styles.recItem}><Check size={16} /> ¡Excelente! Dominaste todos los temas.</div>
                ) : (
                  results.failedTopics.map((t, i) => (
                    <div key={i} className={styles.recItem}><Check size={16} /> Repasa: {t}</div>
                  ))
                )}
              </div>
            </div>

            <div className={styles.resultActions}>
              <button className={styles.btnPrimary} onClick={handleReset}><RotateCcw size={18} /> Reintentar</button>
              <button className={styles.btnSecondary} onClick={handleBack}>Volver</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const selectedOptionId = selectedAnswers[currentQuestion.id || 0];
  const selectedOption = currentQuestion.options.find((o) => o.id === selectedOptionId);
  const correctOption = currentQuestion.options.find((o) => o.isCorrect);

  return (
    <div className={styles.container}>
      <div className={styles.quizPage}>
        <div className={styles.pageHeader}>
          <button onClick={handleBack} className={styles.btnSmall}>
            <ArrowLeft size={18} /> Volver
          </button>
          <div className={styles.headerInfo}>
            <div className={styles.titleRow}>
              <Zap size={20} className={styles.zapIcon} />
              <h1 className={styles.pageTitle}>{quiz.title}</h1>
            </div>
            <p className={styles.pageMeta}>
              Pregunta {currentIndex + 1} de {totalQuestions}
            </p>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
        </div>

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
                    className={`${styles.optionBtn} ${isSelected && !showFeedback ? styles.selected : ""} ${showCorrectState ? styles.correct : ""} ${showWrongState ? styles.incorrect : ""}`}
                    onClick={() => handleSelectAnswer(option.id, currentQuestion.id || 0)}
                    disabled={showFeedback}
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

            {showImmediateFeedback && (
              <div className={styles.feedback}>
                <div className={`${styles.feedbackHeader} ${selectedOption?.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}>
                  {selectedOption?.isCorrect ? <><Check size={18} /> ¡Correcto!</> : <><X size={18} /> Incorrecto</>}
                </div>
                {currentQuestion.explanation && (
                  <div className={styles.feedbackContent}>
                    <BookOpen size={14} />
                    <MarkdownRenderer content={currentQuestion.explanation} />
                  </div>
                )}
                {selectedOption?.feedback && (
                  <div className={styles.feedbackContent}>
                    <strong>{selectedOption.isCorrect ? "Por qué es correcta:" : "Por qué es incorrecta:"}</strong>
                    <MarkdownRenderer content={selectedOption.feedback} />
                  </div>
                )}
                {!selectedOption?.isCorrect && correctOption && (
                  <div className={styles.correctInfo}>
                    <Check size={14} /> Respuesta correcta: {correctOption.text}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.pageFooter}>
          <div className={styles.footerContent}>
            <button className={styles.navBtn} onClick={handlePrevious} disabled={currentIndex === 0}>
              ← Anterior
            </button>

            {!showImmediateFeedback ? (
              <button
                className={`${styles.confirmBtn} ${!selectedOptionId ? styles.disabled : ""}`}
                onClick={handleConfirmAnswer}
                disabled={!selectedOptionId}
              >
                <Check size={18} /> Confirmar
              </button>
            ) : (
              <button className={styles.nextBtn} onClick={handleNext}>
                {currentIndex < totalQuestions - 1 ? "Siguiente →" : "Ver resultados"}
              </button>
            )}
          </div>

          {currentIndex === totalQuestions - 1 && showImmediateFeedback && (
            <div className={styles.submitSection}>
              <button className={styles.submitBtn} onClick={handleSubmit}>
                Finalizar y Ver Resultados
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
