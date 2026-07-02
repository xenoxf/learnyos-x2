"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { X, Sparkles, Loader } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { quizzesService } from "@/services/quizzesService";
import { cardsService } from "@/services/cardsService";

interface SlashCommandModalProps {
  command: "exam" | "flashcards";
  initialPrompt?: string;
  onClose: () => void;
  onResult: (result: { type: "exam" | "flashcards"; message: string }) => void;
}

export function SlashCommandModal({ command, initialPrompt, onClose, onResult }: SlashCommandModalProps) {
  const [reference, setReference] = useState(initialPrompt || "");
  const [quantity, setQuantity] = useState(command === "exam" ? 10 : 5);
  const [difficulty, setDifficulty] = useState("medium");
  const [examType, setExamType] = useState<"quiz" | "icfes">("quiz");
  const [acceso, setAcceso] = useState("public");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!reference.trim()) {
      toast.error("Validación", "Describe el tema del contenido");
      return;
    }

    setLoading(true);
    try {
      if (command === "exam") {
        const result: any = await quizzesService.generateExam({
          reference: reference.trim(),
          numberOfQuestions: quantity,
          difficulty,
          type: examType,
          acceso,
        });
        const examId = result.examId || result.id;
        const totalQ = result.totalQuestions || result.questions?.length || quantity;
        onResult({
          type: "exam",
          message: `✅ **Examen generado:** "${reference.trim()}"\n\n📝 ${totalQ} preguntas • ${difficulty} • ${examType === "icfes" ? "Formato ICFES" : "Quiz"}\n\n🔗 [Abrir examen](/study/quiz/${examId})`,
        });
      } else {
        const result = await cardsService.generateFlashcards({
          reference: reference.trim(),
          quantity,
          acceso,
        });
        onResult({
          type: "flashcards",
          message: `✅ **Flashcards generadas:** "${reference.trim()}"\n\n🃏 ${result.totalCards || quantity} tarjetas\n\n🔗 [Abrir deck](/study/flashcards)`,
        });
      }
      toast.success("Generado", `${command === "exam" ? "Examen" : "Flashcards"} creado exitosamente`);
      onClose();
    } catch (err: any) {
      toast.error("Error", err.message || `No se pudo generar ${command === "exam" ? "el examen" : "las flashcards"}`);
    } finally {
      setLoading(false);
    }
  }, [command, reference, quantity, difficulty, examType, acceso, onResult, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-[12vh] px-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={15} className="text-primary" />
            </div>
            <span className="font-semibold text-sm">
              {command === "exam" ? "/exam-g — Generar Examen" : "/flashcards-g — Generar Flashcards"}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground" type="button">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tema o referencia</label>
            <input
              ref={inputRef}
              value={reference}
              onChange={e => setReference(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              placeholder={command === "exam" ? "Ej: Revolución Francesa, Álgebra lineal..." : "Ej: Verbos en inglés, Química orgánica..."}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {command === "exam" ? "Preguntas" : "Cantidad"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={2}
                  max={25}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-xs font-mono w-6 text-right text-muted-foreground">{quantity}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Visibilidad</label>
              <select value={acceso} onChange={e => setAcceso(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm text-muted-foreground">
                <option value="public">🌍 Público</option>
                <option value="private">🔒 Privado</option>
              </select>
            </div>
          </div>

          {command === "exam" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Dificultad</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm text-muted-foreground">
                  {["very_easy","easy","medium","hard","very_hard","expert"].map(d => (
                    <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Formato</label>
                <select value={examType} onChange={e => setExamType(e.target.value as "quiz" | "icfes")}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm text-muted-foreground">
                  <option value="quiz">Quiz</option>
                  <option value="icfes">ICFES</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors" type="button">
            Cancelar
          </button>
          <button onClick={handleGenerate} disabled={loading || !reference.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            type="button">
            {loading ? <Loader size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {loading ? "Generando..." : "Generar"}
          </button>
        </div>
      </div>
    </div>
  );
}
