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

const STUDY_RESOURCES = [
  {
    title: "📚 Biblioteca de Recursos",
    description: "Accede a quizzes, flashcards y notas creadas por la comunidad. Aprende de otros estudiantes.",
    icon: Brain,
    color: "221 83% 53%",
    action: "Explorar Recursos",
  },
  {
    title: "⚡ Sesiones de Estudio",
    description: "Temporizador Pomodoro integrado. 25 minutos de enfoque total, 5 de descanso.",
    icon: Zap,
    color: "27 87% 67%",
    action: "Iniciar Sesión",
  },
  {
    title: "🎯 Metas Diarias",
    description: "Establece objetivos de estudio y sigue tu progreso. La consistencia es clave.",
    icon: Target,
    color: "142 76% 36%",
    action: "Ver Metas",
  },
  {
    title: "🏆 Logros y Recompensas",
    description: "Gana insignias por tu dedicación. Celebra cada victoria, por pequeña que sea.",
    icon: Sparkles,
    color: "280 65% 60%",
    action: "Ver Logros",
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

        {/* Recursos de estudio */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Brain className={styles.sectionIcon} />
            Recursos para tu Éxito
          </h2>
          <div className={styles.tipsGrid}>
            {STUDY_RESOURCES.map((resource) => {
              const ResourceIcon = resource.icon;
              return (
                <div key={resource.title} className={styles.tipCard}>
                  <div
                    className={styles.tipIcon}
                    style={{ background: `hsl(${resource.color} / 0.15)` }}
                  >
                    <ResourceIcon size={24} style={{ color: `hsl(${resource.color})` }} />
                  </div>
                  <h3 className={styles.tipTitle}>{resource.title}</h3>
                  <p className={styles.tipDescription}>{resource.description}</p>
                  <button className={styles.tipAction}>{resource.action}</button>
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
