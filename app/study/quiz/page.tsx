"use client";

import React, { useState, useEffect } from "react";
import { useExams } from "@/hooks/useExams";
import { apiService } from "@/services/apiService";
import {
  BookOpen,
  Plus,
  Trash2,
  Loader,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import styles from "@/styles/quiz.module.css";
import type { Exam, GenerateExamData } from "@/types";
import DashboardLayout from "../layaut";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const QuizPage: React.FC = () => {
  const { exams, loading, error, addExam, removeExam, updateExam } = useExams();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, number>>(new Map());
  const [testStarted, setTestStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form states for generation
  const [formData, setFormData] = useState<GenerateExamData>({
    topic: "",
    numberOfQuestions: 5,
    difficulty: "medium",
  });

  const handleGenerateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const newExam = await apiService.generateExam(formData);
      if (newExam) {
        addExam(newExam);
        setFormData({ topic: "", numberOfQuestions: 5, difficulty: "medium" });
      }
    } catch (err) {
      console.error("Error generating exam:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStartTest = (exam: Exam) => {
    setSelectedExam(exam);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    setTestStarted(true);
    setShowResults(false);
  };

  const handleAnswerQuestion = (optionIndex: number) => {
    const newAnswers = new Map(userAnswers);
    newAnswers.set(currentQuestionIndex, optionIndex);
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (selectedExam && currentQuestionIndex < selectedExam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishTest = () => {
    const correctAnswers = selectedExam?.questions.reduce((count, question, index) => {
      const selectedAnswer = userAnswers.get(index);
      if (selectedAnswer !== undefined && question.options[selectedAnswer]?.isCorrect) {
        return count + 1;
      }
      return count;
    }, 0) || 0;

    const score = ((correctAnswers / (selectedExam?.questions.length || 1)) * 100);

    if (selectedExam) {
      updateExam(selectedExam.id, { score });
    }

    setShowResults(true);
    setTestStarted(false);
  };

  const handleDeleteExam = async (examId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.deleteExam(examId);
      removeExam(examId);
      if (selectedExam?.id === examId) {
        setSelectedExam(null);
      }
    } catch (err) {
      console.error("Error deleting exam:", err);
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setSelectedExam(null);
  };

  if (testStarted && selectedExam) {
    const currentQuestion = selectedExam.questions[currentQuestionIndex];
    const selectedAnswerIndex = userAnswers.get(currentQuestionIndex);

    return (
      <DashboardLayout>      <div className={styles.quizContainer}>
        <div className={styles.testHeader}>
          <div className={styles.testInfo}>
            <h1>{selectedExam.title}</h1>
            <p>
              Pregunta {currentQuestionIndex + 1} de {selectedExam.questions.length}
            </p>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentQuestionIndex + 1) / selectedExam.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className={styles.questionContent}>
          <h2 className={styles.questionText}><MarkdownRenderer content={currentQuestion.question} /></h2>

          <div className={styles.optionsGrid}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`${styles.optionButton} ${selectedAnswerIndex === index ? styles.selected : ""
                  }`}
                onClick={() => handleAnswerQuestion(index)}
              >
                <span className={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={styles.optionText}><MarkdownRenderer content={option.text} /></span>
              </button>
            ))}
          </div>

          {currentQuestion.explanation && (
            <div className={styles.explanation}>
              <AlertCircle size={20} />
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        <div className={styles.navigationButtons}>
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={styles.navButton}
          >
            Anterior
          </button>

          <div className={styles.questionCounter}>
            {currentQuestionIndex + 1} / {selectedExam.questions.length}
          </div>

          {currentQuestionIndex === selectedExam.questions.length - 1 ? (
            <button
              onClick={handleFinishTest}
              className={`${styles.navButton} ${styles.finish}`}
            >
              Terminar
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className={styles.navButton}
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
      </DashboardLayout>
    );
  }

  if (showResults && selectedExam) {
    const correctAnswers = selectedExam.questions.reduce((count, question, index) => {
      const selectedAnswer = userAnswers.get(index);
      if (selectedAnswer !== undefined && question.options[selectedAnswer]?.isCorrect) {
        return count + 1;
      }
      return count;
    }, 0);

    const score = ((correctAnswers / selectedExam.questions.length) * 100);

    return (
      <DashboardLayout>      <div className={styles.quizContainer}>
        <div className={styles.resultsContainer}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreValue}>{Math.round(score)}%</span>
          </div>

          <h2>Resultados del examen</h2>
          <p className={styles.scoreText}>
            Obtuviste {correctAnswers} respuestas correctas de {selectedExam.questions.length}
          </p>

          <div className={styles.resultsList}>
            {selectedExam.questions.map((question, index) => {
              const selectedAnswer = userAnswers.get(index);
              const isCorrect = selectedAnswer !== undefined && question.options[selectedAnswer]?.isCorrect;

              return (
                <div key={index} className={`${styles.resultItem} ${isCorrect ? styles.correct : styles.incorrect}`}>
                  <div className={styles.resultIcon}>
                    {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                  </div>
                  <div className={styles.resultContent}>
                    <p className={styles.resultQuestion}><MarkdownRenderer content={question.question} /> </p>
                    <p className={styles.resultAnswer}>
                      Tu respuesta: {selectedAnswer !== undefined ? question.options[selectedAnswer].text : "No respondida"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={handleCloseResults} className={styles.primaryButton}>
            Volver a exámenes
          </button>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>    <div className={styles.quizContainer}>
      <aside className={`${styles.quizSidebar} ${sidebarOpen ? "" : styles.closed}`}>
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarSectionTitle}>Generar Examen</h3>
          <form onSubmit={handleGenerateExam} className={styles.generateForm}>
            <input
              type="text"
              placeholder="Tema o referencia"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className={styles.formInput}
            />
            <input
              type="number"
              min="1"
              max="50"
              value={formData.numberOfQuestions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfQuestions: parseInt(e.target.value),
                })
              }
              className={styles.formInput}
              placeholder="Número de preguntas"
            />
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              className={styles.formSelect}
            >
              <option value="easy">Fácil</option>
              <option value="medium">Medio</option>
              <option value="hard">Difícil</option>
            </select>
            <button
              type="submit"
              disabled={generating}
              className={styles.submitButton}
            >
              {generating ? (
                <>
                  <Loader className={styles.spin} size={18} />
                  Generando...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Generar
                </>
              )}
            </button>
          </form>
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarSectionTitle}>Tus Exámenes</h3>
          <div className={styles.examsList}>
            {loading ? (
              <div className={styles.loadingState}>
                <Loader className={styles.spin} size={24} />
              </div>
            ) : error ? (
              <div className={styles.errorState}>{error}</div>
            ) : exams.length === 0 ? (
              <div className={styles.emptyState}>
                <BookOpen size={24} />
                <span>No hay exámenes</span>
              </div>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam.id}
                  className={`${styles.examItem} ${selectedExam?.id === exam.id ? styles.active : ""
                    }`}
                >
                  <div onClick={() => setSelectedExam(exam)}>
                    <p className={styles.examTitle}>{exam.title}</p>
                    <p className={styles.examMeta}>
                      {exam.totalQuestions} preguntas • {exam.difficulty}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteExam(exam.id, e)}
                    className={styles.deleteIcon}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {selectedExam ? (
          <div className={styles.examDetails}>
            <h1 className={styles.examTitle}> <MarkdownRenderer content={selectedExam.title} /> </h1>
            <p className={styles.examDescription}> <MarkdownRenderer content={selectedExam.description ?? ""} /> </p>

            <div className={styles.examStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Preguntas</span>
                <span className={styles.statValue}>{selectedExam.totalQuestions}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Dificultad</span>
                <span className={styles.statValue}>{selectedExam.difficulty}</span>
              </div>
              {selectedExam.score !== undefined && (
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Puntuación</span>
                  <span className={styles.statValue}>{Math.round(selectedExam.score)}%</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleStartTest(selectedExam)}
              className={styles.startButton}
            >
              <ChevronRight size={20} />
              Iniciar Examen
            </button>
          </div>
        ) : (
          <div className={styles.emptyContent}>
            <BookOpen size={64} />
            <p>Selecciona o genera un examen para comenzar</p>
          </div>
        )}
      </main>
    </div>
    </DashboardLayout>
  );
};

export default QuizPage;
