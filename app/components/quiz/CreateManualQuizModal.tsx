"use client";

import React, { useState, useCallback } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { quizzesService } from "@/services/quizzesService";

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

  const handleSave = async () => {
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
    } catch (err: any) {
      toast.error("Error", err.message || "No se pudo guardar el examen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Plus size={16} />
            </div>
            <h2 className="text-lg font-bold">Crear Examen Manual</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" type="button">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                placeholder="Ej: Examen de álgebra básica"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Área</label>
              <input
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                placeholder="Ej: Matemáticas"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tema</label>
              <input
                value={tema}
                onChange={e => setTema(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                placeholder="Ej: Álgebra"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Dificultad</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
                  {["very_easy","easy","medium","hard","very_hard","expert"].map(d => (
                    <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Visibilidad</label>
                <select value={acceso} onChange={e => setAcceso(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Límite de tiempo (minutos)</label>
              <input type="number" min={0} value={timeLimitMinutes} onChange={e => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={shuffleQuestions} onChange={e => setShuffleQuestions(e.target.checked)}
                  className="rounded border-border" />
                Aleatorizar preguntas
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showResults} onChange={e => setShowResults(e.target.checked)}
                  className="rounded border-border" />
                Mostrar resultados
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
              placeholder="Descripción opcional del examen" />
          </div>

          {/* Preguntas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Preguntas ({questions.length})</h3>
              <button onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                type="button">
                <Plus size={14} /> Agregar pregunta
              </button>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Pregunta {qi + 1}</span>
                  {questions.length > 1 && (
                    <button onClick={() => removeQuestion(qi)}
                      className="text-muted-foreground hover:text-destructive transition-colors" type="button">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <textarea value={q.question} onChange={e => updateQuestion(qi, "question", e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                  placeholder="Escribe la pregunta..." />

                <textarea value={q.explanation} onChange={e => updateQuestion(qi, "explanation", e.target.value)} rows={1}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                  placeholder="Explicación (opcional)" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">Opciones</span>
                    <button onClick={() => addOption(qi)}
                      className="text-[11px] text-primary hover:underline" type="button">
                      + Opción
                    </button>
                  </div>
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        onClick={() => setCorrectOption(qi, oi)}
                        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${o.isCorrect ? "border-green-500 bg-green-500" : "border-border hover:border-primary"}`}
                        type="button"
                        title={o.isCorrect ? "Correcta" : "Marcar como correcta"}
                      >
                        {o.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                      </button>
                      <input value={o.text} onChange={e => updateOption(qi, oi, "text", e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        placeholder={`Opción ${oi + 1}`} />
                      <input value={o.feedback} onChange={e => updateOption(qi, oi, "feedback", e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs"
                        placeholder="Feedback" />
                      {q.options.length > 2 && (
                        <button onClick={() => removeOption(qi, oi)}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0" type="button">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors" type="button">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            type="button">
            <Save size={16} />
            {saving ? "Guardando..." : "Guardar Examen"}
          </button>
        </div>
      </div>
    </div>
  );
}
