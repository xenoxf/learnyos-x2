"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense, lazy, memo } from "react";
import { Sparkles, Flame, Eye, Moon, Heart, RefreshCw, Star, Target, Zap, Clock, Brain, TrendingUp, Sun, Skull, Infinity, Timer, Mountain, Gem } from "lucide-react";
import styles from "@/styles/klerk.module.css";

const iconMap = { Target, Zap, Clock, Brain, Sparkles, Flame, Eye, Moon, Skull, Star, Infinity, Timer, Mountain, Gem, Sun, Heart } as const;

const DISCIPLINE_PHRASES = [
  { category: "disciplina", text: "La disciplina supera a la motivación", subtext: "No esperes tener ganas. Solo hazlo.", icon: "Target" },
  { category: "consistencia", text: "Pequeños avances diarios = grandes resultados", subtext: "1% mejor cada día es 37x mejor en un año", icon: "TrendingUp" },
  { category: "enfoque", text: "Haz lo que tienes que hacer, incluso cuando no quieras", subtext: "Esa es la verdadera disciplina", icon: "Zap" },
  { category: "persistencia", text: "El éxito es la suma de pequeños esfuerzos repetidos", subtext: "La consistencia es tu superpoder", icon: "Clock" },
  { category: "mentalidad", text: "Tu único límite es tu mente", subtext: "Cree en tu capacidad de aprender", icon: "Brain" },
  { category: "acción", text: "El momento perfecto es ahora", subtext: "No esperes el momento ideal, créalo", icon: "Sparkles" },
];

const PHILOSOPHICAL_PHRASES = [
  { category: "existencia", text: "Existir es resistirse al vacío", subtext: "Cada acto de creación es un acto de rebeldía", icon: "Infinity" },
  { category: "propósito", text: "El significado no se encuentra, se crea", subtext: "Eres el arquitecto de tu propio propósito", icon: "Gem" },
  { category: "voluntad", text: "Lo que no me mata me hace más fuerte", subtext: "Nietzsche", icon: "Flame" },
  { category: "conocimiento", text: "Solo sé que nada sé", subtext: "Sócrates", icon: "Eye" },
  { category: "tiempo", text: "El tiempo es la imagen móvil de la eternidad", subtext: "Platón", icon: "Timer" },
  { category: "esencia", text: "La esencia precede a la existencia", subtext: "Sartre", icon: "Star" },
];

const DARK_PHRASES = [
  { category: "mortalidad", text: "Memento Mori - Recuerda que morirás", subtext: "Vive como si fuera tu último día", icon: "Skull" },
  { category: "dolor", text: "El dolor es inevitable, el sufrimiento es opcional", subtext: "Buda", icon: "Moon" },
  { category: "soledad", text: "Al final caminas solo", subtext: "En esa soledad encuentras tu fuerza", icon: "Mountain" },
  { category: "vacío", text: "El vacío no se llena, se acepta", subtext: "En el silencio encuentras tu voz", icon: "Eye" },
  { category: "oscuridad", text: "Incluso la noche más oscura termina con el amanecer", subtext: "Victor Hugo", icon: "Sun" },
  { category: "resiliencia", text: "Caer está permitido, levantarse es obligatorio", subtext: "Cada caída es una oportunidad", icon: "Heart" },
];

const REMEMBER_PHRASES = [
  { category: "origen", text: "Recuerda por qué empezaste", subtext: "Esa versión de ti que soñaba en grande", icon: "Sparkles" },
  { category: "sueños", text: "Tu yo del futuro te lo agradecerá", subtext: "Estudia hoy para vivir mañana", icon: "Star" },
  { category: "legado", text: "Estás construyendo tu legado", subtext: "Cada hora es un ladrillo en tu imperio", icon: "Mountain" },
  { category: "familia", text: "Ellos creen en ti", subtext: "Haz que tu esfuerzo sea su orgullo", icon: "Heart" },
  { category: "versión", text: "La mejor versión de ti te está esperando", subtext: "No la decepciones", icon: "Gem" },
  { category: "razón", text: "Tu 'por qué' es más fuerte que tu 'cómo'", subtext: "Cuando tienes una razón clara, el camino se abre", icon: "Target" },
];

const getCategoryPhrases = (cat: string) => {
  switch (cat) {
    case "philosophical": return PHILOSOPHICAL_PHRASES;
    case "dark": return DARK_PHRASES;
    case "remember": return REMEMBER_PHRASES;
    default: return DISCIPLINE_PHRASES;
  }
};

// Memoized phrase card to prevent re-renders
const PhraseCard = memo(({ phrase, isActive }: { phrase: typeof DISCIPLINE_PHRASES[0]; isActive: boolean }) => {
  const IconComp = iconMap[phrase.icon as keyof typeof iconMap] || Sparkles;
  return (
    <div className={`${styles.phraseCardSmall} ${isActive ? styles.activePhraseCard : ""}`}>
      <div className={styles.phraseCardHeader}>
        <IconComp size={18} />
        <span className={styles.phraseCategorySmall}>{phrase.category}</span>
      </div>
      <p className={styles.phraseTextSmall}>{phrase.text}</p>
    </div>
  );
});
PhraseCard.displayName = "PhraseCard";

// Separate component for API quote to isolate re-renders
function ApiQuoteSection() {
  const [apiQuote, setApiQuote] = useState<{ content: string; author: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://api.quotable.io/random?tags=inspirational|wisdom");
      if (res.ok) {
        const data = await res.json();
        setApiQuote({ content: data.content, author: data.author });
      }
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  if (!apiQuote) return null;

  return (
    <section className={styles.apiQuoteSection}>
      <div className={styles.apiQuoteCard}>
        <div className={styles.apiQuoteHeader}>
          <Star className={styles.apiQuoteIcon} size={20} />
          <span className={styles.apiQuoteLabel}>Sabiduría del Universo</span>
          <button onClick={fetchQuote} className={styles.refreshButton} disabled={isLoading} aria-label="Nueva frase">
            <RefreshCw size={16} className={isLoading ? styles.spinning : ""} />
          </button>
        </div>
        <blockquote className={styles.apiQuoteText}>&quot;{apiQuote.content}&quot;</blockquote>
        <cite className={styles.apiQuoteAuthor}>— {apiQuote.author}</cite>
      </div>
    </section>
  );
}

export default function StudyPage() {
  const [currentCategory, setCurrentCategory] = useState("motivation");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const phraseIndexRef = useRef(0);

  // Rotate phrases every 10 seconds
  useEffect(() => {
    const phrases = getCategoryPhrases(currentCategory);
    const interval = setInterval(() => {
      phraseIndexRef.current = (phraseIndexRef.current + 1) % phrases.length;
      setCurrentPhraseIndex(phraseIndexRef.current);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentCategory]);

  const currentPhrases = getCategoryPhrases(currentCategory);
  const currentPhrase = currentPhrases[currentPhraseIndex];
  const IconComponent = iconMap[currentPhrase.icon as keyof typeof iconMap] || Sparkles;

  const categoryButtons = [
    { id: "motivation", label: "Motivación", icon: Flame },
    { id: "philosophical", label: "Filosofía", icon: Eye },
    { id: "dark", label: "Oscuro", icon: Moon },
    { id: "remember", label: "Propósito", icon: Heart },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.backgroundEffects}>
        <div className={styles.particle} style={{ top: "10%", left: "20%" }} />
        <div className={styles.particle} style={{ top: "60%", left: "80%" }} />
        <div className={styles.particle} style={{ top: "80%", left: "30%" }} />
      </div>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Sparkles className={styles.titleIcon} />
            <h1 className={styles.title}>Tu Espacio de Motivación</h1>
          </div>
          <p className={styles.subtitle}>Encuentra tu razón para seguir adelante</p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.categorySelector}>
          {categoryButtons.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => { setCurrentCategory(cat.id); setCurrentPhraseIndex(0); phraseIndexRef.current = 0; }}
                className={`${styles.categoryButton} ${currentCategory === cat.id ? styles.categoryButtonActive : ""}`}
              >
                <CatIcon size={18} />
                <span className={styles.categoryButtonLabel}>{cat.label}</span>
              </button>
            );
          })}
        </section>

        <section className={styles.heroSection}>
          <div className={styles.heroCard}>
            <div className={styles.heroIcon}><IconComponent size={32} /></div>
            <div className={styles.heroCategory}>{currentPhrase.category}</div>
            <h2 className={styles.heroPhrase}>{currentPhrase.text}</h2>
            <p className={styles.heroSubtext}>{currentPhrase.subtext}</p>
            <div className={styles.progressDots}>
              {currentPhrases.map((_, i) => (
                <span key={i} className={`${styles.dot} ${i === currentPhraseIndex ? styles.activeDot : ""}`} />
              ))}
            </div>
          </div>
        </section>

        <Suspense fallback={null}>
          <ApiQuoteSection />
        </Suspense>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Target className={styles.sectionIcon} />Tu Progreso Importa</h2>
          <div className={styles.statsRow}>
            <div className={styles.statCard}><div className={styles.statValue}>1%</div><div className={styles.statLabel}>Mejora diaria</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>37x</div><div className={styles.statLabel}>En un año</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>∞</div><div className={styles.statLabel}>Potencial</div></div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Heart className={styles.sectionIcon} />Recuerda Por Qué Empezaste</h2>
          <div className={styles.rememberGrid}>
            {REMEMBER_PHRASES.map((p, i) => <PhraseCard key={i} phrase={p} isActive={false} />)}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Sparkles className={styles.sectionIcon} />
            {currentCategory === "motivation" && "Sabiduría Diaria"}
            {currentCategory === "philosophical" && "Reflexiones Profundas"}
            {currentCategory === "dark" && "Verdades Oscuras"}
            {currentCategory === "remember" && "Tu Propósito"}
          </h2>
          <div className={styles.phrasesGrid}>
            {currentPhrases.map((p, i) => <PhraseCard key={i} phrase={p} isActive={i === currentPhraseIndex} />)}
          </div>
        </section>

        <section className={styles.finalCtaSection}>
          <div className={styles.finalCtaContent}>
            <Flame className={styles.finalCtaIcon} size={48} />
            <h2 className={styles.finalCtaTitle}>Ahora ve y conquista tu día</h2>
            <p className={styles.finalCtaText}>La motivación te inicia, el hábito te mantiene.<br /><strong>Tú puedes con esto y más.</strong></p>
          </div>
        </section>
      </main>
    </div>
  );
}
