"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StrategicMemoryGame } from "@/components/MemoryGame";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { CoreLearningStatus } from "@/components/CoreLearningStatus";
import {
  MessageSquare,
  FileText,
  Layers,
  BookOpen,
  Globe,
  Sparkles,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Rocket,
} from "lucide-react";
import styles from "@/styles/dashboard.module.css";
import DashboardLayout from "@/study/layaut";
import ChatPage from "./chat/page";

const node_env: string = process.env.NODE_ENV;
export const dynamic = "force-dynamic";

const Dashboard: React.FC = () => {
  /*const router = useRouter();

  const primaryTools = useMemo(
    () => [
      {
        title: "Junior IA",
        icon: Sparkles,
        path: "/study/chat",
        iconClass: styles["toolIconJuniorIA"],
        description: "Asistente de IA avanzado para aprendizaje",
        gradient: "gradient-primary",
        tag: "Recomendado",
        stat: "+95% precisión",
      },
      {
        title: "Exámenes",
        icon: Target,
        path: "/study/quiz",
        iconClass: styles["toolIconExams"],
        description: "Evaluaciones personalizadas y simulaciones",
        gradient: "gradient-exams",
        tag: "Inteligente",
        stat: "100+ preguntas",
      },
    ],
    [],
  );

  const secondaryTools = useMemo(
    () => [
      {
        title: "Flashcards",
        icon: Layers,
        path: "/study/flashcards",
        iconClass: styles["toolIconFlashcards"],
        description: "Memorización activa con spaced repetition",
        gradient: "gradient-flashcards",
        tag: "Eficiente",
        stat: "2x retención",
      },
      {
        title: "Notas IA",
        icon: Brain,
        path: "/study/notes",
        iconClass: styles["toolIconNotes"],
        description: "Apuntes inteligentes con síntesis automática",
        gradient: "gradient-notes",
        tag: "Inteligente",
        stat: "Síntesis IA",
      },
      {
        title: "Traductor IA",
        icon: Globe,
        path: "/study/translator",
        iconClass: styles["toolIconTranslator"],
        description: "Traducción contextual con comprensión semántica",
        gradient: "gradient-translator",
        tag: "Multilingüe",
        stat: "50+ idiomas",
      },
    ],
    [],
  );

  const stats = useMemo(
    () => [
      { label: "Tiempo activo", value: "4h 32m", icon: Zap, change: "+12%" },
      { label: "Retención", value: "87%", icon: TrendingUp, change: "+5%" },
      { label: "Streak", value: "14 días", icon: Rocket, change: "+3" },
    ],
    [],
  );*/

  return (
    <>
      <ChatPage />
      {/*<div className={styles.container}>
        {/* Header Section }
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.welcomeTitle}>
              ¡Hola, <span className={styles.highlight}>Aprendiz</span>!
            </h1>
            <p className={styles.welcomeSubtitle}>
              Tu centro de aprendizaje inteligente está listo
            </p>
          </div>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statIcon}>
                  <stat.icon size={16} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
                <div className={styles.statChange}>
                  <span className={styles.statChangeValue}>{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* Main Content }
        <main className={styles.main}>
          {/* Learning Status }
          <section className={styles.section}>
            <CoreLearningStatus />
          </section>

          {/* Primary Tools }
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Sparkles className={styles.sectionIcon} />
                Herramientas Principales
              </h2>
              <p className={styles.sectionDescription}>
                Accede a las herramientas más potentes para tu aprendizaje
              </p>
            </div>
            <div className={styles.primaryGrid}>
              {primaryTools.map((tool, index) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={tool.title}
                    className={`${styles.toolCard} ${styles[tool.gradient]}`}
                    onClick={() => router.push(tool.path)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={styles.toolHeader}>
                      <div className={`${styles.toolIcon} ${tool.iconClass}`}>
                        <IconComponent size={24} />
                      </div>
                      <div className={styles.toolTag}>
                        <span>{tool.tag}</span>
                      </div>
                    </div>
                    <div className={styles.toolBody}>
                      <h3 className={styles.toolTitle}>{tool.title}</h3>
                      <p className={styles.toolDescription}>
                        {tool.description}
                      </p>
                      <div className={styles.toolStat}>
                        <span>{tool.stat}</span>
                      </div>
                    </div>
                    <div className={styles.toolFooter}>
                      <div className={styles.toolAction}>
                        <span>Abrir</span>
                        <div className={styles.arrowIcon}>
                          <MessageSquare size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Secondary Tools }
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Layers className={styles.sectionIcon} />
                Herramientas Complementarias
              </h2>
              <p className={styles.sectionDescription}>
                Funcionalidades adicionales para optimizar tu estudio
              </p>
            </div>
            <div className={styles.secondaryGrid}>
              {secondaryTools.map((tool, index) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={tool.title}
                    className={`${styles.toolCardSecondary} ${styles[tool.gradient]}`}
                    onClick={() => router.push(tool.path)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={styles.toolHeaderSecondary}>
                      <div
                        className={`${styles.toolIconSecondary} ${tool.iconClass}`}
                      >
                        <IconComponent size={20} />
                      </div>
                      <div className={styles.toolTagSecondary}>
                        <span>{tool.tag}</span>
                      </div>
                    </div>
                    <div className={styles.toolBodySecondary}>
                      <h3 className={styles.toolTitleSecondary}>
                        {tool.title}
                      </h3>
                      <p className={styles.toolDescriptionSecondary}>
                        {tool.description}
                      </p>
                      <div className={styles.toolStatSecondary}>
                        <span>{tool.stat}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Productivity Section }
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Zap className={styles.sectionIcon} />
                Productividad
              </h2>
              <p className={styles.sectionDescription}>
                Mantén el enfoque y optimiza tu tiempo de estudio
              </p>
            </div>
            <div className={styles.gamesGrid}>
              <div className={styles.gameCard}>
                <PomodoroTimer />
              </div>
              <div className={styles.gameCard}>
                <StrategicMemoryGame />
              </div>
            </div>
          </section>
        </main>
        </div>*/}
    </>
  );
};

export default Dashboard;
