"use client";

import React, { useState, useRef } from "react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/quiz/agentSurface.module.css";
import { Sparkles, Settings2, BrainCircuit, Wand2 } from "lucide-react";

export default function ExamAgentWorkspace({ onClose, onQuizCreated }) {
  const [intent, setIntent] = useState("");
  const [isExpanding, setIsExpanding] = useState(false);

  const handleAction = async () => {
    if (intent.length < 5) {
      toast.warning("Intención poco clara", "Describe más el examen...");
      return;
    }
    // Lógica de orquestación
    await onQuizCreated({ reference: intent });
    onClose();
  };

  return (
    <div className={styles.canvasOverlay} onClick={onClose}>
      <div className={styles.agentSurface} onClick={(e) => e.stopPropagation()}>
        
        {/* Lente de Inteligencia */}
        <div className={styles.brainPulse}>
          <BrainCircuit size={24} />
        </div>

        {/* El Prompt Principal (Cursor-like) */}
        <div className={styles.promptInputWrapper}>
          <input
            className={styles.promptInput}
            placeholder="¿Qué examen quieres generar hoy? (ej: Historia del arte barroco)..."
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            onFocus={() => setIsExpanding(true)}
          />
          <div className={styles.commandHint}>Cmd + K para herramientas</div>
        </div>

        {/* Chips de configuración dinámicos */}
        <div className={styles.contextChips}>
          <div className={styles.chip}>Medium Difficulty</div>
          <div className={styles.chip}>10 Questions</div>
          <div className={styles.chip}>Dynamic Quiz</div>
          <button className={styles.addToolBtn}><Settings2 size={14} /> Adjust</button>
        </div>

        {/* CTA "Magical" */}
        <button className={styles.executeBtn} onClick={handleAction}>
          <Wand2 size={18} />
          <span>Generar vía Gemini 2.0</span>
        </button>

      </div>
    </div>
  );
}
