"use client";

import React, { useState, useCallback } from "react";
import { BrainCircuit } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import QuizGrid from "@/components/quiz/QuizGrid";
import ExamAgentWorkspace from "@/components/quiz/ExamAgentWorkspace";
import { quizzesService } from "@/services/quizzesService";

export default function QuizPage() {
  const [showAgent, setShowAgent] = useState(false);

  const handleAgentCreate = useCallback(async (data: { reference: string }) => {
    try {
      await quizzesService.generateExam({
        reference: data.reference,
        numberOfQuestions: 10,
        difficulty: "medium",
        type: "quiz",
        acceso: "public",
      });
      toast.success("Generado", "Examen creado desde el agente");
    } catch (err: any) {
      toast.error("Error", err.message || "No se pudo generar");
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", zIndex: 50 }}>
        <button
          onClick={() => setShowAgent(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all text-sm font-medium"
          type="button"
        >
          <BrainCircuit size={18} />
          Agente IA
        </button>
      </div>
      <QuizGrid />

      {showAgent && (
        <ExamAgentWorkspace
          onClose={() => setShowAgent(false)}
          onQuizCreated={handleAgentCreate}
        />
      )}
    </div>
  );
}
