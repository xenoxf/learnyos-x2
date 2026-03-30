"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Zap,
  Target,
  Clock,
  Brain,
  TrendingUp,
  Flame,
  Award,
  Shield,
  Mountain,
  Lightbulb,
  Rocket,
  Heart,
  Star,
  Trophy,
  ArrowUp,
  BookOpen,
  Focus,
} from "lucide-react";
import styles from "@/styles/klerk.module.css";

const MOTIVATIONAL_PHRASES = [
  {
    category: "disciplina",
    text: "La disciplina supera a la motivación",
    subtext: "No esperes tener ganas. Solo hazlo.",
    icon: Target,
    color: "var(--chart-1)",
  },
  {
    category: "consistencia",
    text: "Pequeños avances diarios = grandes resultados",
    subtext: "1% mejor cada día es 37x mejor en un año",
    icon: TrendingUp,
    color: "var(--chart-2)",
  },
  {
    category: "enfoque",
    text: "Haz lo que tienes que hacer, incluso cuando no quieras",
    subtext: "Esa es la verdadera disciplina",
    icon: Zap,
    color: "var(--chart-3)",
  },
  {
    category: "persistencia",
    text: "El éxito es la suma de pequeños esfuerzos repetidos",
    subtext: "La consistencia es tu superpoder",
    icon: Clock,
    color: "var(--chart-4)",
  },
  {
    category: "mentalidad",
    text: "Tu único límite es tu mente",
    subtext: "Cree en tu capacidad de aprender",
    icon: Brain,
    color: "var(--chart-5)",
  },
  {
    category: "acción",
    text: "El momento perfecto es ahora",
    subtext: "No esperes el momento ideal, créalo",
    icon: Sparkles,
    color: "var(--chart-1)",
  },
  {
    category: "resiliencia",
    text: "Cada error es una oportunidad de aprendizaje",
    subtext: "Los fracasos son lecciones disfrazadas",
    icon: Mountain,
    color: "var(--chart-2)",
  },
  {
    category: "crecimiento",
    text: "Sal de tu zona de confort",
    subtext: "El crecimiento comienza donde termina la comodidad",
    icon: Rocket,
    color: "var(--chart-3)",
  },
  {
    category: "pasión",
    text: "Encuentra propósito en lo que haces",
    subtext: "La pasión transforma el trabajo en placer",
    icon: Flame,
    color: "var(--chart-4)",
  },
  {
    category: "excelencia",
    text: "Busca la excelencia, no la perfección",
    subtext: "La perfección paraliza, la excelencia impulsa",
    icon: Award,
    color: "var(--chart-5)",
  },
  {
    category: "coraje",
    text: "Atraviesa el miedo con acción",
    subtext: "El coraje no es ausencia de miedo, es actuar a pesar de él",
    icon: Shield,
    color: "var(--chart-1)",
  },
  {
    category: "sabiduría",
    text: "Aprende como si fueras a vivir para siempre",
    subtext: "El conocimiento es la única inversión que nunca quiebra",
    icon: Lightbulb,
    color: "var(--chart-2)",
  },
  {
    category: "determinación",
    text: "Cuando quieras rendirte, recuerda por qué empezaste",
    subtext: "Tu 'por qué' es tu combustible",
    icon: Heart,
    color: "var(--chart-3)",
  },
  {
    category: "visión",
    text: "Mantén la vista en el premio",
    subtext: "La visión clara del objetivo mantiene la motivación alta",
    icon: Star,
    color: "var(--chart-4)",
  },
  {
    category: "victoria",
    text: "Gánate a ti mismo primero",
    subtext: "La única competencia real es contra quien eras ayer",
    icon: Trophy,
    color: "var(--chart-5)",
  },
];

const STUDY_TIPS = [
  {
    title: "Técnica Pomodoro",
    description:
      "25 min de enfoque total + 5 min de descanso. Repite 4 veces y toma un descanso largo.",
    icon: Clock,
    color: "var(--chart-1)",
    tip: "Ideal para tareas que requieren concentración sostenida",
  },
  {
    title: "Active Recall",
    description:
      "Ponte a prueba en lugar de solo releer. La recuperación activa fortalece las conexiones neuronales.",
    icon: Brain,
    color: "var(--chart-2)",
    tip: "Usa flashcards o auto-exámenes para maximizar la retención",
  },
  {
    title: "Spaced Repetition",
    description:
      "Repasa en intervalos: 1 día, 3 días, 1 semana, 1 mes. El cerebro recuerda mejor con espaciado.",
    icon: TrendingUp,
    color: "var(--chart-3)",
    tip: "La curva del olvido se combate con repasos estratégicos",
  },
  {
    title: "Técnica Feynman",
    description:
      "Si no puedes explicárselo a un niño de 5 años, no lo entiendes bien. Simplifica para comprender.",
    icon: Zap,
    color: "var(--chart-4)",
    tip: "Enseñar es la mejor forma de aprender",
  },
  {
    title: "Interleaving",
    description:
      "Alterna entre diferentes temas o tipos de problemas en una misma sesión.",
    icon: ArrowUp,
    color: "var(--chart-5)",
    tip: "Mejora la capacidad de distinguir entre conceptos",
  },
  {
    title: "Deep Work",
    description:
      "Bloques de trabajo sin distracciones. Elimina notificaciones y enfócate completamente.",
    icon: Focus,
    color: "var(--chart-1)",
    tip: "La calidad del enfoque determina la calidad del aprendizaje",
  },
];

export default function KlerkPage() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Rotar frases cada 10 segundos para dar tiempo a leer
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentPhrase = useMemo(
    () => MOTIVATIONAL_PHRASES[currentPhraseIndex],
    [currentPhraseIndex]
  );
  const IconComponent = currentPhrase.icon;

  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Cargando inspiración...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Fondo dinámico con partículas */}
      <div className={styles.backgroundEffects} aria-hidden="true">
        <div className={styles.particle} style={{ top: "10%", left: "20%" }} />
        <div className={styles.particle} style={{ top: "60%", left: "80%" }} />
        <div className={styles.particle} style={{ top: "80%", left: "30%" }} />
        <div className={styles.glowOrb} style={{ top: "0%", right: "0%" }} />
        <div className={styles.glowOrb} style={{ bottom: "0%", left: "0%" }} />
      </div>

      <header className={styles.header} role="banner">
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Sparkles className={styles.titleIcon} aria-hidden="true" />
            <h1 className={styles.title}>Klerk</h1>
          </div>
          <p className={styles.subtitle}>
            Tu espacio de disciplina y enfoque mental
          </p>
        </div>
      </header>

      <main className={styles.main} role="main">
        {/* Frase principal rotativa */}
        <section
          className={styles.heroSection}
          aria-labelledby="hero-phrase-title"
        >
          <div className={styles.heroCard}>
            <div
              className={styles.heroIcon}
              style={{
                background: `hsl(${currentPhrase.color} / 0.15)`,
              }}
            >
              <IconComponent
                size={32}
                style={{ color: `hsl(${currentPhrase.color})` }}
              />
            </div>
            <div className={styles.heroCategory}>{currentPhrase.category}</div>
            <h2 id="hero-phrase-title" className={styles.heroPhrase}>
              {currentPhrase.text}
            </h2>
            <p className={styles.heroSubtext}>{currentPhrase.subtext}</p>
            <div
              className={styles.progressDots}
              role="tablist"
              aria-label="Frases motivacionales"
            >
              {MOTIVATIONAL_PHRASES.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${
                    index === currentPhraseIndex ? styles.activeDot : ""
                  }`}
                  onClick={() => setCurrentPhraseIndex(index)}
                  aria-label={`Ver frase ${index + 1}`}
                  aria-selected={index === currentPhraseIndex}
                  role="tab"
                  type="button"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trucos de estudio */}
        <section className={styles.section} aria-labelledby="study-tips-title">
          <h2 id="study-tips-title" className={styles.sectionTitle}>
            <Brain className={styles.sectionIcon} aria-hidden="true" />
            Técnicas de Estudio Comprobadas
          </h2>
          <div className={styles.tipsGrid} role="list">
            {STUDY_TIPS.map((tip, index) => {
              const TipIcon = tip.icon;
              return (
                <article
                  key={tip.title}
                  className={styles.tipCard}
                  role="listitem"
                >
                  <div
                    className={styles.tipIcon}
                    style={{ background: `hsl(${tip.color} / 0.15)` }}
                  >
                    <TipIcon
                      size={24}
                      style={{ color: `hsl(${tip.color})` }}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className={styles.tipTitle}>{tip.title}</h3>
                  <p className={styles.tipDescription}>{tip.description}</p>
                  <div className={styles.tipExtra}>{tip.tip}</div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Stats motivacionales */}
        <section className={styles.section} aria-labelledby="stats-title">
          <h2 id="stats-title" className={styles.sectionTitle}>
            <Target className={styles.sectionIcon} aria-hidden="true" />
            Tu Progreso Importa
          </h2>
          <div className={styles.statsRow} role="list">
            <div className={styles.statCard} role="listitem">
              <div className={styles.statValue}>1%</div>
              <div className={styles.statLabel}>Mejora diaria</div>
              <div className={styles.statDescription}>
                Comprométete a mejorar solo 1% cada día
              </div>
            </div>
            <div className={styles.statCard} role="listitem">
              <div className={styles.statValue}>37x</div>
              <div className={styles.statLabel}>En un año</div>
              <div className={styles.statDescription}>
                El poder del interés compuesto en aprendizaje
              </div>
            </div>
            <div className={styles.statCard} role="listitem">
              <div className={styles.statValue}>∞</div>
              <div className={styles.statLabel}>Potencial</div>
              <div className={styles.statDescription}>
                Tu único límite es tu dedicación
              </div>
            </div>
          </div>
        </section>

        {/* Frases adicionales en grid */}
        <section
          className={styles.section}
          aria-labelledby="daily-wisdom-title"
        >
          <h2 id="daily-wisdom-title" className={styles.sectionTitle}>
            <Sparkles className={styles.sectionIcon} aria-hidden="true" />
            Sabiduría Diaria
          </h2>
          <div className={styles.phrasesGrid} role="list">
            {MOTIVATIONAL_PHRASES.map((phrase, index) => {
              const PhraseIcon = phrase.icon;
              return (
                <button
                  key={index}
                  className={`${styles.phraseCardSmall} ${
                    index === currentPhraseIndex ? styles.activePhraseCard : ""
                  }`}
                  onClick={() => setCurrentPhraseIndex(index)}
                  role="listitem"
                  type="button"
                  aria-label={`Ver frase: ${phrase.text}`}
                >
                  <div className={styles.phraseCardHeader}>
                    <PhraseIcon
                      size={18}
                      style={{ color: `hsl(${phrase.color})` }}
                      aria-hidden="true"
                    />
                    <span
                      className={styles.phraseCategorySmall}
                      style={{ color: `hsl(${phrase.color})` }}
                    >
                      {phrase.category}
                    </span>
                  </div>
                  <p className={styles.phraseTextSmall}>{phrase.text}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Call to action */}
        <section className={styles.ctaSection} aria-labelledby="cta-title">
          <div className={styles.ctaContent}>
            <BookOpen className={styles.ctaIcon} aria-hidden="true" />
            <h2 id="cta-title" className={styles.ctaTitle}>
              ¿Listo para ponerlo en práctica?
            </h2>
            <p className={styles.ctaText}>
              El conocimiento sin acción es solo información. ¡Actúa ahora!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
