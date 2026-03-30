import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react";
import styles from "@/styles/quiz/quizPlayer.module.css";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import type { Exam } from "@/types";

interface QuizPlayerProps {
  quizId: number;
  onClose: () => void;
}

export default function QuizPlayer({
  quizId,
  onClose,
}: QuizPlayerProps) {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Exam | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setError(null);
        // Use getExamForPlay (klek format) instead of getExam (deck format)
        const data = await apiService.getExamForPlay(quizId);
        
        // Validate exam data
        if (!data || !data.questions || data.questions.length === 0) {
          throw new Error('El quiz no tiene preguntas o no está disponible');
        }
        
        setQuiz(data);
      } catch (err: any) {
        const message = err instanceof Error ? err.message : "Error al cargar quiz";
        setError(message);
        toast({
          variant: "destructive",
          title: "Error al cargar",
          description: message,
        });
        // Don't close immediately, let user see the error
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId, onClose, toast]);

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loadingContent}>
            <p>Cargando quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loadingContent}>
            <p className="text-destructive font-semibold mb-2">Error al cargar el quiz</p>
            <p className="text-sm text-muted-foreground mb-4">{error || 'No se encontró el quiz'}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Validate current question
  if (!currentQuestion) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loadingContent}>
            <p className="text-destructive">Error: Pregunta no encontrada</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary rounded">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectAnswer = (optionId: number) => {
    if (!showResults) {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion.id || 0]: optionId,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const selectedId = selectedAnswers[q.id || 0];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selectedId === correctOption?.id) {
        correct++;
      }
    });
    return ((correct / totalQuestions) * 100).toFixed(1);
  };

  if (showResults) {
    const score = calculateScore();
    const correctCount = questions.filter((q) => {
      const selectedId = selectedAnswers[q.id || 0];
      const correctOption = q.options.find((o) => o.isCorrect);
      return selectedId === correctOption?.id;
    }).length;

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.resultsContainer}>
            <h2 className={styles.resultsTitle}>Resultados</h2>
            <div className={styles.scoreCircle}>
              <div className={styles.scoreValue}>{score}%</div>
              <div className={styles.scoreLabel}>Puntuación</div>
            </div>
            <p className={styles.scoreDetail}>
              Has acertado {correctCount} de {totalQuestions} preguntas
            </p>
            <div className={styles.resultActions}>
              <button
                className={styles.actionBtn}
                onClick={handleReset}
              >
                <RotateCcw size={18} />
                Intentar de nuevo
              </button>
              <button
                className={styles.actionBtn}
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{quiz.title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.questionContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>

          <div className={styles.questionContent}>
            <h3 className={styles.questionText}>{currentQuestion.question}</h3>

            <div className={styles.optionsContainer}>
              {currentQuestion.options.map((option) => {
                const isSelected =
                  selectedAnswers[currentQuestion.id || 0] === option.id;
                const isCorrect = option.isCorrect;
                const showCorrect = showResults && isCorrect;
                const showWrong = showResults && isSelected && !isCorrect;

                return (
                  <button
                    key={option.id}
                    className={`${styles.optionBtn} ${isSelected ? styles.selected : ""
                      } ${showCorrect ? styles.correct : ""} ${showWrong ? styles.incorrect : ""
                      }`}
                    onClick={() => handleSelectAnswer(option.id)}
                    disabled={showResults}
                  >
                    <span className={styles.optionText}>{option.text}</span>
                    {showCorrect && <Check size={20} />}
                    {showWrong && <X size={20} />}
                  </button>
                );
              })}
            </div>

            {currentQuestion.explanation && showResults && (
              <div className={styles.explanation}>
                <h4 className={styles.explanationTitle}>Explicación:</h4>
                <p className={styles.explanationText}>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.navBtn}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} />
          </button>

          <div className={styles.counter}>
            {currentIndex + 1} / {totalQuestions}
          </div>

          <button
            className={styles.navBtn}
            onClick={handleNext}
            disabled={currentIndex === totalQuestions - 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {currentIndex === totalQuestions - 1 && !showResults && (
          <div className={styles.submitContainer}>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              Enviar respuestas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
