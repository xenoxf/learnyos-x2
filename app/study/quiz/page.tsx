"use client";

import React, { useState, useMemo } from "react";
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
  Trophy,
  Clock,
  BarChart3,
  ChevronLeft,
  Target,
} from "lucide-react";
import styles from "@/styles/quiz.module.css";
import type { Exam, GenerateExamData, ExamQuestion } from "@/types";
import DashboardLayout from "../layaut";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const QuizPage: React.FC = () => {
  const { exams, loading, error, addExam, removeExam, updateExamScore } = useExams();
  const { toast } = useToast();

  // Estados de Navegación y Examen
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, number>>(
    new Map(),
  );
  const [testStarted, setTestStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState<GenerateExamData>({
    topic: "",
    numberOfQuestions: 5,
    difficulty: "medium",
  });

  // --- LÓGICA DE NEGOCIO ---

  const handleGenerateExam = async (e: React.FormEvent) => {
    e.preventDefault();

    // CORRECCIÓN: Separamos el toast del return
    if (!formData.topic) {
      toast({
        title: "Falta el tema",
        variant: "destructive",
      });
      return; // Ahora devuelve void explícitamente
    }

    setGenerating(true);
    try {
      const newExam = await apiService.generateExam(formData);
      if (newExam) {
        addExam(newExam);
        setFormData({ topic: "", numberOfQuestions: 5, difficulty: "medium" });
        toast({
          title: "¡Examen generado!",
          description: "Ya puedes comenzar a estudiar.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo generar el examen",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleStartTest = (exam: Exam) => {
    if (!exam.questions || exam.questions.length === 0) return;
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

  const handleFinishTest = () => {
    if (!selectedExam) return;

    const correctCount = selectedExam.questions.reduce(
      (count, question, index) => {
        const selectedIdx = userAnswers.get(index);
        return selectedIdx !== undefined &&
          question.options[selectedIdx]?.isCorrect
          ? count + 1
          : count;
      },
      0,
    );

    const finalScore = (correctCount / selectedExam.questions.length) * 100;
    updateExamScore(selectedExam.id, finalScore);
    setShowResults(true);
    setTestStarted(false);
  };

  // --- RENDERIZADO DE ESTADOS ---

  // 1. ESTADO: RESULTADOS
  if (showResults && selectedExam) {
    const score = selectedExam.score || 0;
    return (
      <DashboardLayout>
        <div className={styles.resultsWrapper}>
          <div className={styles.resultsCard}>
            <div className={styles.scoreHeader}>
              <div className={styles.trophyIcon}>
                <Trophy size={48} color={score >= 60 ? "#eab308" : "#94a3b8"} />
              </div>
              <h2>¡Examen Completado!</h2>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreBig}>{Math.round(score)}%</span>
                <span className={styles.scoreLabel}>Calificación</span>
              </div>
            </div>

            <div className={styles.resultsList}>
              {selectedExam.questions.map((q, idx) => {
                const ansIdx = userAnswers.get(idx);
                const isCorrect =
                  ansIdx !== undefined && q.options[ansIdx]?.isCorrect;
                return (
                  <div
                    key={idx}
                    className={`${styles.resultReviewItem} ${isCorrect ? styles.revCorrect : styles.revIncorrect}`}
                  >
                    <div className={styles.revHeader}>
                      {isCorrect ? (
                        <CheckCircle size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                      <span>Pregunta {idx + 1}</span>
                    </div>
                    <p className={styles.revQuestion}>{q.question}</p>
                    <p className={styles.revUserAns}>
                      <strong>Tu respuesta:</strong>{" "}
                      {ansIdx !== undefined
                        ? q.options[ansIdx].text
                        : "No respondida"}
                    </p>
                    {!isCorrect && (
                      <p className={styles.revCorrectAns}>
                        <strong>Correcta:</strong>{" "}
                        {q.options.find((o) => o.isCorrect)?.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => {
                setShowResults(false);
                setSelectedExam(null);
              }}
              className="w-full mt-6"
            >
              Volver al Inicio
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 2. ESTADO: TEST EN CURSO
  if (testStarted && selectedExam) {
    const currentQ = selectedExam.questions[currentQuestionIndex];
    const progress =
      ((currentQuestionIndex + 1) / selectedExam.questions.length) * 100;

    return (
      <DashboardLayout>
        <div className={styles.activeQuizContainer}>
          <div className={styles.quizTopBar}>
            <div className={styles.quizInfo}>
              <h3>{selectedExam.title}</h3>
              <span>
                Pregunta {currentQuestionIndex + 1} de{" "}
                {selectedExam.questions.length}
              </span>
            </div>
            <div className={styles.mainProgressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className={styles.questionCard}>
            <div className={styles.questionText}>
              <MarkdownRenderer content={currentQ.question} />
            </div>

            <div className={styles.optionsGrid}>
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  className={`${styles.optionBtn} ${userAnswers.get(currentQuestionIndex) === i ? styles.optSelected : ""}`}
                  onClick={() => handleAnswerQuestion(i)}
                >
                  <span className={styles.optLetter}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={styles.optText}> <MarkdownRenderer content={opt.text} /> </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.quizNavigation}>
            <Button
              variant="outline"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            >
              Anterior
            </Button>

            {currentQuestionIndex === selectedExam.questions.length - 1 ? (
              <Button onClick={handleFinishTest} className={styles.finishBtn}>
                Finalizar Examen
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              >
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 3. ESTADO: DASHBOARD PRINCIPAL (LISTA Y GENERACIÓN)
  return (
    <DashboardLayout>
      <div className={styles.dashboardGrid}>
        {/* Sidebar de Generación */}
        <aside className={styles.sidePanel}>
          <div className={styles.panelHeader}>
            <Plus size={20} />
            <h2>Nuevo Examen</h2>
          </div>
          <form onSubmit={handleGenerateExam} className={styles.genForm}>
            <div className={styles.field}>
              <label>¿Sobre qué quieres aprender?</label>
              <Input
                placeholder="Ej: React Hooks, Historia de Roma..."
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label>Nº de preguntas</label>
              <Input
                type="number"
                value={formData.numberOfQuestions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfQuestions: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className={styles.field}>
              <label>Dificultad</label>
              <select
                className={styles.customSelect}
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as any,
                  })
                }
              >
                <option value="easy">Fácil</option>
                <option value="medium">Intermedio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
            <Button type="submit" disabled={generating} className="w-full">
              {generating ? (
                <Loader className={styles.spin} />
              ) : (
                "Generar con IA"
              )}
            </Button>
          </form>
        </aside>

        {/* Contenido Principal */}
        <main className={styles.mainSection}>
          <header className={styles.mainHeader}>
            <h1>Mis Exámenes</h1>
            <p>Pon a prueba tus conocimientos y mide tu progreso.</p>
          </header>

          <div className={styles.examsGrid}>
            {loading ? (
              <div className={styles.loadingBox}>
                <Loader className={styles.spin} size={40} />
              </div>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam.id}
                  className={`${styles.examCard} ${selectedExam?.id === exam.id ? styles.examCardActive : ""}`}
                  onClick={() => setSelectedExam(exam)}
                >
                  <div className={styles.examCardHeader}>
                    <div className={styles.examIcon}>
                      <BookOpen size={20} />
                    </div>
                    <button
                      className={styles.btnTrash}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExam(exam.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className={styles.examTitle}>{exam.title}</h3>
                  <div className={styles.examBadges}>
                    <span className={styles.badge}>
                      <Target size={14} /> {exam.totalQuestions} qns
                    </span>
                    <span className={styles.badge}>
                      <BarChart3 size={14} /> {exam.difficulty}
                    </span>
                  </div>
                  {exam.score !== undefined && (
                    <div className={styles.scoreTag}>
                      Último puntaje: {Math.round(exam.score)}%
                    </div>
                  )}
                  {selectedExam?.id === exam.id && (
                    <Button
                      onClick={() => handleStartTest(exam)}
                      className="mt-4 w-full"
                    >
                      Comenzar
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default QuizPage;
