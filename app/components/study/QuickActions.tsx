"use client";

import React from "react";
import { Zap, FileText, Layers, MessageSquare, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "@/styles/klerk.module.css";

const quickActions = [
  {
    title: "Crear Examen",
    description: "Evaluación personalizada con IA",
    icon: FileText,
    path: "/study/quiz",
    accent: "hsl(var(--primary))"
  },
  {
    title: "Flashcards",
    description: "Practica con mazos comunitarios",
    icon: Layers,
    path: "/study/flashcards",
    accent: "#f59e0b"
  },
  {
    title: "Junior IA",
    description: "Tu tutor inteligente 24/7",
    icon: MessageSquare,
    path: "/study/chat",
    accent: "#7c3aed"
  }
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><Zap size={20} /> Acceso Rápido</h2>
      </div>
      <div className={styles.quickActions}>
        {quickActions.map((action, i) => (
          <button key={i} className={styles.actionCard} onClick={() => router.push(action.path)}>
            <div className={styles.actionContent}>
              <div className={styles.actionIconWrap} style={{ color: action.accent }}>
                <action.icon size={24} />
              </div>
              <div className={styles.actionText}>
                <h3 className={styles.actionTitle}>{action.title}</h3>
                <p className={styles.actionDesc}>{action.description}</p>
              </div>
              <ArrowRight size={18} className={styles.actionArrow} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
