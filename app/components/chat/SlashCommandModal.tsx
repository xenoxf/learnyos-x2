"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { X, Sparkles, Loader } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { quizzesService } from "@/services/quizzesService";
import { cardsService } from "@/services/cardsService";
import styles from "@/styles/chat/slashCommandModal.module.css";

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "";
      toast.error("Error", errorMessage || `No se pudo generar ${command === "exam" ? "el examen" : "las flashcards"}`);
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Sparkles size={15} />
            </div>
            <span className={styles.headerTitle}>
              {command === "exam" ? "/exam-g — Generar Examen" : "/flashcards-g — Generar Flashcards"}
            </span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} type="button">
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tema o referencia</label>
            <input
              ref={inputRef}
              value={reference}
              onChange={e => setReference(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
              placeholder={command === "exam" ? "Ej: Revolución Francesa, Álgebra lineal..." : "Ej: Verbos en inglés, Química orgánica..."}
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                {command === "exam" ? "Preguntas" : "Cantidad"}
              </label>
              <div className={styles.rangeRow}>
                <input
                  type="range"
                  min={2}
                  max={25}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className={styles.range}
                />
                <span className={styles.rangeValue}>{quantity}</span>
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Visibilidad</label>
              <select value={acceso} onChange={e => setAcceso(e.target.value)}
                className={styles.select}>
                <option value="public">🌍 Público</option>
                <option value="private">🔒 Privado</option>
              </select>
            </div>
          </div>

          {command === "exam" && (
            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Dificultad</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className={styles.select}>
                  {["very_easy","easy","medium","hard","very_hard","expert"].map(d => (
                    <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Formato</label>
                <select value={examType} onChange={e => setExamType(e.target.value as "quiz" | "icfes")}
                  className={styles.select}>
                  <option value="quiz">Quiz</option>
                  <option value="icfes">ICFES</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose}
            className={styles.cancelBtn} type="button">
            Cancelar
          </button>
          <button onClick={handleGenerate} disabled={loading || !reference.trim()}
            className={styles.generateBtn}
            type="button">
            {loading ? <Loader size={15} className={styles.spinner} /> : <Sparkles size={15} />}
            {loading ? "Generando..." : "Generar"}
          </button>
        </div>
      </div>
    </div>
  );
}
