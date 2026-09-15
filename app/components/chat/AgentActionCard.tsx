"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

interface AgentActionCardProps {
  kind: "exam_created" | "flashcards_created" | "notes_created";
  title: string;
  id?: number;
}

export function AgentActionCard({ kind, title, id }: AgentActionCardProps) {
  const label = {
    exam_created: "📝 Examen",
    flashcards_created: "🃏 Flashcards",
    notes_created: "📄 Notas",
  }[kind];

  return (
    <div
      style={{
        margin: "0.5rem 0",
        padding: "0.75rem 1rem",
        background: "var(--border)",
        borderRadius: "0.5rem",
        borderLeft: "3px solid #3b82f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</span>
        <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>{title}</p>
      </div>
      {id && (
        <button
          style={{
            display: "flex", alignItems: "center", gap: "0.3rem",
            background: "#3b82f6", color: "white", border: "none",
            padding: "0.3rem 0.7rem", borderRadius: "0.3rem",
            cursor: "pointer", fontSize: "0.8rem",
          }}
          onClick={() => window.open(`/study/quiz/${id}`, "_blank")}
        >
          <ExternalLink size={14} />
          Abrir
        </button>
      )}
    </div>
  );
}
