"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, RotateCw, Loader } from "lucide-react";
import styles from "@/styles/quiz.module.css";

interface Exam {
  id: number;
  title: string;
  subject: string;
  questions: Question[];
}

interface Question {
  id?: number;
  question: string;
  options?: string[];
  correctAnswer: string;
}

export default function QuizPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await apiService.getExams();
      const typedData = (Array.isArray(data) ? data : []).map((exam: any) => ({
        id: exam.id,
        title: exam.title || "Sin título",
        subject: exam.subject || exam.topic || "General",
        questions: Array.isArray(exam.questions)
          ? exam.questions.map((q: any, idx: number) => ({
              id: q.id || idx,
              question: q.question || q.text || "",
              options: q.options || q.choices || [],
              correctAnswer: q.correctAnswer || q.correct || "",
            }))
          : [],
      }));
      setExams(typedData);
    } catch (error: any) {
      console.error("Error loading exams:", error);
      toast({
        title: "Error",
        description: error.message || "No pudimos cargar los exámenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startExam = (exam: Exam) => {
    setCurrentExam(exam);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (answer: string) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer,
    });
  };

  const handleNext = () => {
    if (currentExam && currentQuestion < currentExam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setShowResults(true);
      toast({
        title: "Examen completado",
        description: "Tu examen ha sido revisado",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando exámenes...</p>
        </div>
      </div>
    );
  }

  if (currentExam && !showResults) {
    const question = currentExam.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentExam.questions.length) * 100;

    return (
      <div className={styles.container}>
        <section className={styles.examHeader}>
          <h1 className={styles.examTitle}>🎯 {currentExam.title}</h1>
          <p className={styles.examProgress}>
            Pregunta {currentQuestion + 1} de {currentExam.questions.length}
          </p>
          <Progress value={progress} className={styles.progressBar} />
        </section>

        <Card className="p-8 mb-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold">{question.question}</h2>
          </div>

          <div className="space-y-3 mb-8">
            {question.options?.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === option
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === option
                        ? "border-primary bg-primary text-white"
                        : "border-muted"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentExam(null)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentQuestion === currentExam.questions.length - 1}
            className="flex-1"
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {currentQuestion === currentExam.questions.length - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Completar Examen
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (currentExam && showResults) {
    const correctCount = currentExam.questions.filter(
      (q: any, idx: number) => answers[idx] === q.correctAnswer
    ).length;
    const percentage = (correctCount / currentExam.questions.length) * 100;

    return (
      <div className={styles.container}>
        <section className={styles.resultsHeader}>
          <h1 className={styles.resultsTitle}>📊 Resultados</h1>
        </section>

        <Card className={`p-12 text-center mb-8 ${percentage >= 70 ? "border-green-500" : "border-orange-500"}`}>
          <div className={percentage >= 70 ? "text-green-600" : "text-orange-600"}>
            <p className="text-6xl font-bold mb-2">{percentage.toFixed(0)}%</p>
            <p className="text-lg mb-4">
              {correctCount} de {currentExam.questions.length} correctas
            </p>
            {percentage >= 70 ? (
              <p className="text-green-600">¡Excelente trabajo! 🎉</p>
            ) : (
              <p className="text-orange-600">Necesitas practicar más 💪</p>
            )}
          </div>
        </Card>

        <div className="space-y-4 mb-8">
          {currentExam.questions.map((q: Question, idx: number) => {
            const isCorrect = answers[idx] === q.correctAnswer;
            return (
              <Card key={idx} className={`p-4 ${isCorrect ? "border-green-500" : "border-red-500"}`}>
                <div className="flex items-start gap-4">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium mb-2">{q.question}</p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Tu respuesta: <strong>{answers[idx] || "No respondiste"}</strong>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-600">
                        Respuesta correcta: <strong>{q.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={() => setCurrentExam(null)}
          className="w-full"
          size="lg"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Volver a Exámenes
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>🎓 Exámenes</h1>
        <p className={styles.description}>Selecciona un examen para comenzar a estudiar</p>
      </section>

      {exams.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No tienes exámenes disponibles</p>
          <Button onClick={loadExams} variant="outline">
            <RotateCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </Card>
      ) : (
        <div className={styles.grid}>
          {exams.map((exam) => (
            <Card key={exam.id} className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{exam.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Asignatura:</span> {exam.subject}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">Preguntas:</span> {exam.questions.length}
              </p>
              <Button
                onClick={() => startExam(exam)}
                className="w-full"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Iniciar Examen
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}