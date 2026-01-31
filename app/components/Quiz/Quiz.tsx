'use client';

import React, { useState, useMemo } from 'react';
import styles from './Quiz.module.css';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizProps {
  questions: QuizQuestion[];
  title?: string;
  onComplete?: (score: number, total: number) => void;
}

interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answered: boolean;
  selectedAnswer: number | null;
  showResults: boolean;
  timeRemaining: number;
}

const INITIAL_TIME = 30; // segundos por pregunta

export const Quiz: React.FC<QuizProps> = ({
  questions,
  title = 'Quiz Interactivo',
  onComplete,
}) => {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
    showResults: false,
    timeRemaining: INITIAL_TIME,
  });

  const currentQuestion = useMemo(
    () => questions[state.currentQuestionIndex],
    [questions, state.currentQuestionIndex]
  );

  const progress = useMemo(
    () => ((state.currentQuestionIndex + 1) / questions.length) * 100,
    [state.currentQuestionIndex, questions.length]
  );

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return styles.difficultyEasy;
      case 'medium':
        return styles.difficultyMedium;
      case 'hard':
        return styles.difficultyHard;
      default:
        return '';
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (state.answered) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    setState((prev) => ({
      ...prev,
      selectedAnswer: answerIndex,
      answered: true,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const handleNextQuestion = () => {
    if (state.currentQuestionIndex + 1 < questions.length) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        answered: false,
        selectedAnswer: null,
        timeRemaining: INITIAL_TIME,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        showResults: true,
      }));
      onComplete?.(state.score + (state.selectedAnswer === currentQuestion.correctAnswer ? 1 : 0), questions.length);
    }
  };

  const handleRestart = () => {
    setState({
      currentQuestionIndex: 0,
      score: 0,
      answered: false,
      selectedAnswer: null,
      showResults: false,
      timeRemaining: INITIAL_TIME,
    });
  };

  if (state.showResults) {
    const finalScore = state.score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    const performanceLevel =
      percentage >= 80 ? 'Excelente' :
      percentage >= 60 ? 'Bueno' :
      percentage >= 40 ? 'Regular' :
      'Necesita mejora';

    return (
      <div className={styles.container}>
        <div className={styles.resultsContainer}>
          <div className={styles.resultsBadge}>
            <div className={styles.resultScore}>{percentage}%</div>
          </div>

          <h2 className={styles.resultsTitle}>¡Quiz Completado!</h2>
          <p className={styles.resultsText}>
            Obtuviste <strong>{finalScore}</strong> de <strong>{questions.length}</strong> respuestas correctas
          </p>
          <p className={`${styles.resultsPerformance} ${styles[`performance${performanceLevel.replace(/\s/g, '')}`]}`}>
            Desempeño: {performanceLevel}
          </p>

          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Correctas</div>
              <div className={styles.statValue}>{finalScore}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Incorrectas</div>
              <div className={styles.statValue}>{questions.length - finalScore}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Precisión</div>
              <div className={styles.statValue}>{percentage}%</div>
            </div>
          </div>

          <button className={styles.restartButton} onClick={handleRestart}>
            Reintentar Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.quizHeader}>
        <h1 className={styles.quizTitle}>{title}</h1>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.progressText}>
          Pregunta {state.currentQuestionIndex + 1} de {questions.length}
        </div>
      </div>

      {currentQuestion && (
        <div className={styles.questionContainer}>
          <div className={styles.questionHeader}>
            <h2 className={styles.questionText}>{currentQuestion.question}</h2>
            <span className={`${styles.difficultyBadge} ${getDifficultyClass(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </span>
          </div>

          <div className={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = state.selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showCorrect = state.answered && isCorrect;
              const showIncorrect = state.answered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  className={`${styles.option} ${
                    isSelected ? styles.selected : ''
                  } ${showCorrect ? styles.correct : ''} ${
                    showIncorrect ? styles.incorrect : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={state.answered}
                >
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={styles.optionText}>{option}</span>
                  {showCorrect && <span className={styles.checkmark}>✓</span>}
                  {showIncorrect && <span className={styles.xmark}>✗</span>}
                </button>
              );
            })}
          </div>

          {state.answered && currentQuestion.explanation && (
            <div className={styles.explanationBox}>
              <h4 className={styles.explanationTitle}>Explicación:</h4>
              <p className={styles.explanationText}>{currentQuestion.explanation}</p>
            </div>
          )}

          {state.answered && (
            <button
              className={styles.nextButton}
              onClick={handleNextQuestion}
            >
              {state.currentQuestionIndex + 1 === questions.length
                ? 'Ver Resultados'
                : 'Siguiente Pregunta'}
            </button>
          )}
        </div>
      )}

      <div className={styles.scoreDisplay}>
        <div className={styles.scoreLabel}>Puntuación</div>
        <div className={styles.scoreValue}>
          {state.score}/{state.currentQuestionIndex}
        </div>
      </div>
    </div>
  );
};
