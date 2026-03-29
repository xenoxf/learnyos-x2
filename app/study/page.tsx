"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Zap, Target, Clock, Brain, TrendingUp } from "lucide-react";
import styles from "@/styles/klerk.module.css";

const MOTIVATIONAL_PHRASES = [
  {
    category: "disciplina",
    text: "La disciplina supera a la motivación",
    subtext: "No esperes tener ganas. Solo hazlo.",
    icon: Target,
  },
  {
    category: "consistencia",
    text: "Pequeños avances diarios = grandes resultados",
    subtext: "1% mejor cada día es 37x mejor en un año",
    icon: TrendingUp,
  },
  {
    category: "enfoque",
    text: "Haz lo que tienes que hacer, incluso cuando no quieras",
    subtext: "Esa es la verdadera disciplina",
    icon: Zap,
  },
  {
    category: "persistencia",
    text: "El éxito es la suma de pequeños esfuerzos repetidos",
    subtext: "La consistencia es tu superpoder",
    icon: Clock,
  },
  {
    category: "mentalidad",
    text: "Tu único límite es tu mente",
    subtext: "Cree en tu capacidad de aprender",
    icon: Brain,
  },
  {
    category: "acción",
    text: "El momento perfecto es ahora",
    subtext: "No esperes el momento ideal, créalo",
    icon: Sparkles,
  },
];

const STUDY_TIPS = [
  {
    title: "Técnica Pomodoro",
    description: "25 min de enfoque total + 5 min de descanso. Repite 4 veces.",
    icon: Clock,
    color: "var(--chart-1)",
  },
  {
    title: "Active Recall",
    description: "Ponte a prueba en lugar de solo releer. La recuperación activa fortalece la memoria.",
    icon: Brain,
    color: "var(--chart-2)",
  },
  {
    title: "Spaced Repetition",
    description: "Repasa en intervalos: 1 día, 3 días, 1 semana, 1 mes.",
    icon: TrendingUp,
    color: "var(--chart-3)",
  },
  {
    title: "Feynman",
    description: "Si no puedes explicárselo a un niño, no lo entiendes bien.",
    icon: Zap,
    color: "var(--chart-4)",
  },
];

export default function KlerkPage() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Rotar frases cada 8 segundos
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentPhrase = MOTIVATIONAL_PHRASES[currentPhraseIndex];
  const IconComponent = currentPhrase.icon;

  return (
    <div className={styles.container}>
      {/* Fondo dinámico con partículas */}
      <div className={styles.backgroundEffects}>
        <div className={styles.particle} style={{ top: "10%", left: "20%" }} />
        <div className={styles.particle} style={{ top: "60%", left: "80%" }} />
        <div className={styles.particle} style={{ top: "80%", left: "30%" }} />
        <div className={styles.glowOrb} style={{ top: "0%", right: "0%" }} />
        <div className={styles.glowOrb} style={{ bottom: "0%", left: "0%" }} />
      </div>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Sparkles className={styles.titleIcon} />
            <h1 className={styles.title}>Klerk</h1>
          </div>
          <p className={styles.subtitle}>
            Tu espacio de disciplina y enfoque mental
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {/* Frase principal rotativa */}
        <section className={styles.heroSection}>
          <div className={styles.heroCard}>
            <div className={styles.heroIcon}>
              <IconComponent size={32} />
            </div>
            <div className={styles.heroCategory}>{currentPhrase.category}</div>
            <h2 className={styles.heroPhrase}>{currentPhrase.text}</h2>
            <p className={styles.heroSubtext}>{currentPhrase.subtext}</p>
            <div className={styles.progressDots}>
              {MOTIVATIONAL_PHRASES.map((_, index) => (
                <span
                  key={index}
                  className={`${styles.dot} ${index === currentPhraseIndex ? styles.activeDot : ""}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trucos de estudio */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Brain className={styles.sectionIcon} />
            Técnicas de Estudio Comprobadas
          </h2>
          <div className={styles.tipsGrid}>
            {STUDY_TIPS.map((tip) => {
              const TipIcon = tip.icon;
              return (
                <div key={tip.title} className={styles.tipCard}>
                  <div
                    className={styles.tipIcon}
                    style={{ background: `hsl(${tip.color} / 0.15)` }}
                  >
                    <TipIcon size={24} style={{ color: `hsl(${tip.color})` }} />
                  </div>
                  <h3 className={styles.tipTitle}>{tip.title}</h3>
                  <p className={styles.tipDescription}>{tip.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats motivacionales */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Target className={styles.sectionIcon} />
            Tu Progreso Importa
          </h2>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>1%</div>
              <div className={styles.statLabel}>Mejora diaria</div>
              <div className={styles.statDescription}>
                Comprométete a mejorar solo 1% cada día
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>37x</div>
              <div className={styles.statLabel}>En un año</div>
              <div className={styles.statDescription}>
                El poder del interés compuesto en aprendizaje
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>∞</div>
              <div className={styles.statLabel}>Potencial</div>
              <div className={styles.statDescription}>
                Tu único límite es tu dedicación
              </div>
            </div>
          </div>
        </section>

        {/* Frases adicionales */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Sparkles className={styles.sectionIcon} />
            Sabiduría Diaria
          </h2>
          <div className={styles.phrasesGrid}>
            {MOTIVATIONAL_PHRASES.map((phrase, index) => {
              const PhraseIcon = phrase.icon;
              return (
                <div
                  key={index}
                  className={`${styles.phraseCardSmall} ${index === currentPhraseIndex ? styles.activePhraseCard : ""}`}
                >
                  <div className={styles.phraseCardHeader}>
                    <PhraseIcon size={18} />
                    <span className={styles.phraseCategorySmall}>
                      {phrase.category}
                    </span>
                  </div>
                  <p className={styles.phraseTextSmall}>{phrase.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
