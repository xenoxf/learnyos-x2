"use client";

import React, { useState, useCallback } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { quizzesService } from "@/services/quizzesService";
import styles from "@/styles/quiz/createManualQuizModal.module.css";
import { MiniEditor } from "@/components/MiniEditor";

interface Option {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

interface Question {
  question: string;
  explanation: string;
  options: Option[];
}

export function CreateManualQuizModal({
  onClose,
  onQuizCreated,
}: {
  onClose: () => void;
  onQuizCreated?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [tema, setTema] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [acceso, setAcceso] = useState("public");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(0);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", explanation: "", options: [
      { text: "", isCorrect: false, feedback: "" },
      { text: "", isCorrect: false, feedback: "" },
    ]},
  ]);
  const [saving, setSaving] = useState(false);

  const addQuestion = useCallback(() => {
    setQuestions(prev => [...prev, {
      question: "",
      explanation: "",
      options: [
        { text: "", isCorrect: false, feedback: "" },
        { text: "", isCorrect: false, feedback: "" },
      ],
    }]);
  }, []);

  const removeQuestion = useCallback((qi: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== qi));
  }, []);

  const updateQuestion = useCallback((qi: number, field: keyof Question, value: string) => {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, [field]: value } : q));
  }, []);

  const addOption = useCallback((qi: number) => {
    setQuestions(prev => prev.map((q, i) => i === qi ? {
      ...q,
      options: [...q.options, { text: "", isCorrect: false, feedback: "" }],
    } : q));
  }, []);

  const removeOption = useCallback((qi: number, oi: number) => {
    setQuestions(prev => prev.map((q, i) => i === qi ? {
      ...q,
      options: q.options.filter((_, j) => j !== oi),
    } : q));
  }, []);

  const updateOption = useCallback((qi: number, oi: number, field: keyof Option, value: string | boolean) => {
    setQuestions(prev => prev.map((q, i) => i === qi ? {
      ...q,
      options: q.options.map((o, j) => j === oi ? { ...o, [field]: value } : o),
    } : q));
  }, []);

  const setCorrectOption = useCallback((qi: number, oi: number) => {
    setQuestions(prev => prev.map((q, i) => i === qi ? {
      ...q,
      options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })),
    } : q));
  }, []);

  const validate = useCallback(() => {
    if (!title.trim()) { toast.error("Validación", "El título es obligatorio"); return false; }
    if (questions.length === 0) { toast.error("Validación", "Agrega al menos una pregunta"); return false; }
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (!q.question.trim()) { toast.error("Validación", `La pregunta ${qi + 1} está vacía`); return false; }
      if (q.options.length < 2) { toast.error("Validación", `Pregunta ${qi + 1}: mínimo 2 opciones`); return false; }
      if (!q.options.some(o => o.isCorrect)) { toast.error("Validación", `Pregunta ${qi + 1}: marca una opción como correcta`); return false; }
      for (let oi = 0; oi < q.options.length; oi++) {
        if (!q.options[oi].text.trim()) { toast.error("Validación", `Pregunta ${qi + 1}, opción ${oi + 1}: texto vacío`); return false; }
      }
    }
    return true;
  }, [title, questions]);

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
    return "No se pudo guardar el examen";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await quizzesService.createManualExam({
        title: title.trim(),
        description: description.trim() || undefined,
        area: area.trim() || undefined,
        tema: tema.trim() || undefined,
        difficulty,
        acceso,
        timeLimitMinutes: timeLimitMinutes > 0 ? timeLimitMinutes : undefined,
        shuffleQuestions,
        showResults,
        questions: questions.map(q => ({
          question: q.question.trim(),
          explanation: q.explanation.trim() || undefined,
          options: q.options.map(o => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
            feedback: o.feedback.trim() || undefined,
          })),
        })),
      });
      toast.success("Guardado", "Examen creado exitosamente");
      onQuizCreated?.();
      onClose();
    } catch (err: unknown) {
      toast.error("Error", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={handleOverlayKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-quiz-title"
    >
      {/* Focus trap: add a container with tabIndex={-1} and manage focus for full a11y */}
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.headerIcon}>
              <Plus size={16} />
            </div>
            <h2 id="manual-quiz-title" className={styles.title}>Crear Examen Manual</h2>
          </div>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            type="button"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className={styles.body}>
          <div className={styles.grid2}>
            <div className={styles.fieldGroup}>
              <label htmlFor="quiz-title" className={styles.fieldLabel}>Título *</label>
              <input
                id="quiz-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={styles.input}
                placeholder="Ej: Examen de álgebra básica"
                required
                autoFocus
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="quiz-area" className={styles.fieldLabel}>Área</label>
              <input
                id="quiz-area"
                value={area}
                onChange={e => setArea(e.target.value)}
                className={styles.input}
                placeholder="Ej: Matemáticas"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="quiz-tema" className={styles.fieldLabel}>Tema</label>
              <input
                id="quiz-tema"
                value={tema}
                onChange={e => setTema(e.target.value)}
                className={styles.input}
                placeholder="Ej: Álgebra"
              />
            </div>
            <div className={styles.flexRow}>
              <div className={styles.fieldGroup}>
                <label htmlFor="quiz-difficulty" className={styles.fieldLabel}>Dificultad</label>
                <select
                  id="quiz-difficulty"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className={styles.input}
                >
                  {["very_easy","easy","medium","hard","very_hard","expert"].map(d => (
                    <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="quiz-acceso" className={styles.fieldLabel}>Visibilidad</label>
                <select
                  id="quiz-acceso"
                  value={acceso}
                  onChange={e => setAcceso(e.target.value)}
                  className={styles.input}
                >
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                </select>
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="quiz-time" className={styles.fieldLabel}>Límite de tiempo (minutos)</label>
              <input
                id="quiz-time"
                type="number"
                min={0}
                value={timeLimitMinutes}
                onChange={e => setTimeLimitMinutes(Number(e.target.value))}
                className={styles.input}
                placeholder="0 = sin límite"
              />
            </div>
            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={e => setShuffleQuestions(e.target.checked)}
                  className={styles.checkbox}
                />
                Aleatorizar preguntas
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showResults}
                  onChange={e => setShowResults(e.target.checked)}
                  className={styles.checkbox}
                />
                Mostrar resultados
              </label>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="quiz-description" className={styles.fieldLabel}>Descripción</label>
            <textarea
              id="quiz-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className={styles.textarea}
              placeholder="Descripción opcional del examen"
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Preguntas ({questions.length})</h3>
              <button
                onClick={addQuestion}
                className={styles.addBtn}
                type="button"
              >
                <Plus size={14} /> Agregar pregunta
              </button>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className={styles.questionCard}>
                <div className={styles.sectionHeader}>
                  <span className={styles.cardLabel}>Pregunta {qi + 1}</span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qi)}
                      className={styles.deleteBtn}
                      type="button"
                      aria-label={`Eliminar pregunta ${qi + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <MiniEditor
                  value={q.question}
                  onChange={v => updateQuestion(qi, "question", v)}
                  placeholder="Escribe la pregunta..."
                  minRows={2}
                  label="Pregunta"
                />

                <MiniEditor
                  value={q.explanation}
                  onChange={v => updateQuestion(qi, "explanation", v)}
                  placeholder="Explicación (opcional)"
                  minRows={1}
                  label="Explicación"
                />

                <div className={styles.optionsSection}>
                  <div className={styles.optionsHeader}>
                    <span className={styles.optionsLabel}>Opciones</span>
                    <button
                      onClick={() => addOption(qi)}
                      className={styles.addOptionBtn}
                      type="button"
                      aria-label="Agregar opción"
                    >
                      + Opción
                    </button>
                  </div>
                  {q.options.map((o, oi) => (
                    <div key={oi} className={styles.optionRow}>
                      <button
                        onClick={() => setCorrectOption(qi, oi)}
                        className={`${styles.radioBtn} ${o.isCorrect ? styles.radioActive : styles.radioInactive}`}
                        type="button"
                        aria-label={o.isCorrect ? "Opción correcta" : "Marcar como correcta"}
                      >
                        {o.isCorrect && <div className={styles.radioDot} />}
                      </button>
                      <input
                        value={o.text}
                        onChange={e => updateOption(qi, oi, "text", e.target.value)}
                        className={styles.optionInput}
                        placeholder={`Opción ${oi + 1}`}
                        required
                      />
                      <input
                        value={o.feedback}
                        onChange={e => updateOption(qi, oi, "feedback", e.target.value)}
                        className={styles.feedbackInput}
                        placeholder="Feedback"
                      />
                      {q.options.length > 2 && (
                        <button
                          onClick={() => removeOption(qi, oi)}
                          className={styles.removeOptionBtn}
                          type="button"
                          aria-label="Eliminar opción"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <button
              onClick={onClose}
              className={styles.cancelBtn}
              type="button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={styles.saveBtn}
            >
              <Save size={16} />
              {saving ? "Guardando..." : "Guardar Examen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
