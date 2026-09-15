"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

interface AgentActionCardProps {
  kind: "exam_created" | "flashcards_created" | "notes_created";
  title: string;
  id?: number;
}

const KIND_META = {
  exam_created: { label: "📝 Examen", href: (id: number) => `/study/quiz/${id}` },
  flashcards_created: { label: "🃏 Flashcards", href: (_id: number) => `/study/flashcards` },
  notes_created: { label: "📄 Notas", href: (id: number) => `/study/notes/${id}` },
} as const;

export function AgentActionCard({ kind, title, id }: AgentActionCardProps) {
  const meta = KIND_META[kind];
  if (!meta) return null;

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
        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{meta.label}</span>
        <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>{title}</p>
      </div>
      {id != null && (
        <button
          style={{
            display: "flex", alignItems: "center", gap: "0.3rem",
            background: "#3b82f6", color: "white", border: "none",
            padding: "0.3rem 0.7rem", borderRadius: "0.3rem",
            cursor: "pointer", fontSize: "0.8rem",
          }}
          onClick={() => window.open(meta.href(id), "_blank")}
        >
          <ExternalLink size={14} />
          Abrir
        </button>
      )}
    </div>
  );
}
