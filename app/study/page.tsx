"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  Zap, 
  Target, 
  Clock, 
  Brain, 
  TrendingUp,
  Moon,
  Sun,
  Flame,
  Heart,
  Skull,
  Star,
  Infinity,
  Eye,
  Gem,
  Mountain,
  Timer,
  RefreshCw,
} from "lucide-react";
import styles from "@/styles/klerk.module.css";

// Frases motivacionales y de disciplina
const DISCIPLINE_PHRASES = [
  {
    category: "disciplina",
    text: "La disciplina supera a la motivación",
    subtext: "No esperes tener ganas. Solo hazlo.",
    icon: Target,
    type: "motivation",
  },
  {
    category: "consistencia",
    text: "Pequeños avances diarios = grandes resultados",
    subtext: "1% mejor cada día es 37x mejor en un año",
    icon: TrendingUp,
    type: "motivation",
  },
  {
    category: "enfoque",
    text: "Haz lo que tienes que hacer, incluso cuando no quieras",
    subtext: "Esa es la verdadera disciplina",
    icon: Zap,
    type: "motivation",
  },
  {
    category: "persistencia",
    text: "El éxito es la suma de pequeños esfuerzos repetidos",
    subtext: "La consistencia es tu superpoder",
    icon: Clock,
    type: "motivation",
  },
  {
    category: "mentalidad",
    text: "Tu único límite es tu mente",
    subtext: "Cree en tu capacidad de aprender",
    icon: Brain,
    type: "motivation",
  },
  {
    category: "acción",
    text: "El momento perfecto es ahora",
    subtext: "No esperes el momento ideal, créalo",
    icon: Sparkles,
    type: "motivation",
  },
];

// Frases filosóficas profundas
const PHILOSOPHICAL_PHRASES = [
  {
    category: "existencia",
    text: "Existir es resistirse al vacío",
    subtext: "Cada acto de creación es un acto de rebeldía contra la nada",
    icon: Infinity,
    type: "philosophical",
  },
  {
    category: "propósito",
    text: "El significado no se encuentra, se crea",
    subtext: "Eres el arquitecto de tu propio propósito",
    icon: Gem,
    type: "philosophical",
  },
  {
    category: "voluntad",
    text: "Lo que no me mata me hace más fuerte",
    subtext: "Nietzsche - La adversidad forja el carácter",
    icon: Flame,
    type: "philosophical",
  },
  {
    category: "conocimiento",
    text: "Solo sé que nada sé",
    subtext: "Sócrates - La sabiduría comienza en la duda",
    icon: Eye,
    type: "philosophical",
  },
  {
    category: "tiempo",
    text: "El tiempo es la imagen móvil de la eternidad",
    subtext: "Platón - Cada momento es un regalo único",
    icon: Timer,
    type: "philosophical",
  },
  {
    category: "esencia",
    text: "La esencia precede a la existencia",
    subtext: "Sartre - Eres lo que eliges ser",
    icon: Star,
    type: "philosophical",
  },
];

// Frases oscuras / estoicas
const DARK_STOIC_PHRASES = [
  {
    category: "mortalidad",
    text: "Memento Mori - Recuerda que morirás",
    subtext: "La muerte da sentido a la vida. Vive como si fuera tu último día",
    icon: Skull,
    type: "dark",
  },
  {
    category: "dolor",
    text: "El dolor es inevitable, el sufrimiento es opcional",
    subtext: "Buda - Controla tu mente, controla tu destino",
    icon: Moon,
    type: "dark",
  },
  {
    category: "soledad",
    text: "Al final caminas solo",
    subtext: "Pero en esa soledad encuentras tu verdadera fuerza",
    icon: Mountain,
    type: "dark",
  },
  {
    category: "vacío",
    text: "El vacío no se llena, se acepta",
    subtext: "En el silencio del vacío encuentras tu voz interior",
    icon: Eye,
    type: "dark",
  },
  {
    category: "oscuridad",
    text: "Incluso la noche más oscura termina con el amanecer",
    subtext: "Victor Hugo - La esperanza persiste en la adversidad",
    icon: Sun,
    type: "dark",
  },
  {
    category: "resiliencia",
    text: "Caer está permitido, levantarse es obligatorio",
    subtext: "Cada caída es una oportunidad para renacer más fuerte",
    icon: Heart,
    type: "dark",
  },
];

// Frases para recordar por qué empezaste
const REMEMBER_WHY_PHRASES = [
  {
    category: "origen",
    text: "Recuerda por qué empezaste",
    subtext: "Esa versión de ti que soñaba en grande todavía existe",
    icon: Sparkles,
    type: "remember",
  },
  {
    category: "sueños",
    text: "Tu yo del futuro te lo agradecerá",
    subtext: "Estudia hoy para vivir mañana los sueños de ayer",
    icon: Star,
    type: "remember",
  },
  {
    category: "legado",
    text: "Estás construyendo tu legado",
    subtext: "Cada hora de estudio es un ladrillo en tu imperio",
    icon: Mountain,
    type: "remember",
  },
  {
    category: "familia",
    text: "Ellos creen en ti",
    subtext: "Haz que tu esfuerzo sea el orgullo de quienes te aman",
    icon: Heart,
    type: "remember",
  },
  {
    category: "versión",
    text: "La mejor versión de ti te está esperando",
    subtext: "No la decepciones. Sigue adelante.",
    icon: Gem,
    type: "remember",
  },
  {
    category: "razón",
    text: "Tu 'por qué' es más fuerte que tu 'cómo'",
    subtext: "Cuando tienes una razón clara, el camino se abre",
    icon: Target,
    type: "remember",
  },
];

const STUDY_RESOURCES = [
  {
    title: "📚 Biblioteca de Recursos",
    description: "Accede a quizzes, flashcards y notas creadas por la comunidad",
    icon: Brain,
    color: "var(--chart-1)",
    action: "Explorar Recursos",
  },
  {
    title: "⚡ Sesiones de Estudio",
    description: "Temporizador Pomodoro integrado. 25 minutos de enfoque total",
    icon: Zap,
    color: "var(--chart-5)",
    action: "Iniciar Sesión",
  },
  {
    title: "🎯 Metas Diarias",
    description: "Establece objetivos de estudio y sigue tu progreso",
    icon: Target,
    color: "var(--success)",
    action: "Ver Metas",
  },
  {
    title: "🏆 Logros y Recompensas",
    description: "Gana insignias por tu dedicación. Celebra cada victoria",
    icon: Sparkles,
    color: "var(--chart-4)",
    action: "Ver Logros",
  },
];

interface ApiQuote {
  content: string;
  author: string;
  tags?: string[];
}

export default function StudyPage() {
  const [currentCategory, setCurrentCategory] = useState<"motivation" | "philosophical" | "dark" | "remember">("motivation");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [apiQuote, setApiQuote] = useState<ApiQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  // Obtener frase de API externa (quotable.io - gratis, sin key)
  const fetchApiQuote = useCallback(async () => {
    setIsLoadingQuote(true);
    try {
      const response = await fetch("https://api.quotable.io/random?tags=inspirational|wisdom|life|philosophy");
      if (response.ok) {
        const data: ApiQuote = await response.json();
        setApiQuote(data);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setIsLoadingQuote(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchApiQuote();
  }, [fetchApiQuote]);

  // Rotar frases cada 10 segundos
  useEffect(() => {
    if (!mounted) return;
    
    const getCategoryPhrases = () => {
      switch (currentCategory) {
        case "philosophical":
          return PHILOSOPHICAL_PHRASES;
        case "dark":
          return DARK_STOIC_PHRASES;
        case "remember":
          return REMEMBER_WHY_PHRASES;
        default:
          return DISCIPLINE_PHRASES;
      }
    };

    const phrases = getCategoryPhrases();
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentCategory, mounted]);

  const handleCategoryChange = (category: typeof currentCategory) => {
    setCurrentCategory(category);
    setCurrentPhraseIndex(0);
  };

  const getCurrentPhrases = () => {
    switch (currentCategory) {
      case "philosophical":
        return PHILOSOPHICAL_PHRASES;
      case "dark":
        return DARK_STOIC_PHRASES;
      case "remember":
        return REMEMBER_WHY_PHRASES;
      default:
        return DISCIPLINE_PHRASES;
    }
  };

  if (!mounted) {
    return null;
  }

  const currentPhrases = getCurrentPhrases();
  const currentPhrase = currentPhrases[currentPhraseIndex];
  const IconComponent = currentPhrase.icon;

  const categoryButtons = [
    { id: "motivation" as const, label: "Motivación", icon: Flame },
    { id: "philosophical" as const, label: "Filosofía", icon: Eye },
    { id: "dark" as const, label: "Oscuro", icon: Moon },
    { id: "remember" as const, label: "Propósito", icon: Heart },
  ];

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
            <h1 className={styles.title}>Tu Espacio de Motivación</h1>
          </div>
          <p className={styles.subtitle}>
            Encuentra tu razón para seguir adelante
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {/* Selector de categoría */}
        <section className={styles.categorySelector}>
          {categoryButtons.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`${styles.categoryButton} ${currentCategory === cat.id ? styles.categoryButtonActive : ""}`}
              >
                <CatIcon size={18} />
                <span className={styles.categoryButtonLabel}>{cat.label}</span>
              </button>
            );
          })}
        </section>

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
              {currentPhrases.map((_, index) => (
                <span
                  key={index}
                  className={`${styles.dot} ${index === currentPhraseIndex ? styles.activeDot : ""}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Frase de API externa */}
        {apiQuote && (
          <section className={styles.apiQuoteSection}>
            <div className={styles.apiQuoteCard}>
              <div className={styles.apiQuoteHeader}>
                <Star className={styles.apiQuoteIcon} size={20} />
                <span className={styles.apiQuoteLabel}>Sabiduría del Universo</span>
                <button 
                  onClick={fetchApiQuote} 
                  className={styles.refreshButton}
                  disabled={isLoadingQuote}
                  aria-label="Nueva frase"
                >
                  <RefreshCw size={16} className={isLoadingQuote ? styles.spinning : ""} />
                </button>
              </div>
              <blockquote className={styles.apiQuoteText}>
                &quot;{apiQuote.content}&quot;
              </blockquote>
              <cite className={styles.apiQuoteAuthor}>— {apiQuote.author}</cite>
            </div>
          </section>
        )}

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

        {/* Recordatorios de propósito */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Heart className={styles.sectionIcon} />
            Recuerda Por Qué Empezaste
          </h2>
          <div className={styles.rememberGrid}>
            {REMEMBER_WHY_PHRASES.map((phrase, index) => {
              const PhraseIcon = phrase.icon;
              return (
                <div key={index} className={styles.rememberCard}>
                  <div className={styles.rememberIcon}>
                    <PhraseIcon size={20} />
                  </div>
                  <h3 className={styles.rememberTitle}>{phrase.text}</h3>
                  <p className={styles.rememberText}>{phrase.subtext}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Frases adicionales por categoría */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Sparkles className={styles.sectionIcon} />
            {currentCategory === "motivation" && "Sabiduría Diaria"}
            {currentCategory === "philosophical" && "Reflexiones Profundas"}
            {currentCategory === "dark" && "Verdades Oscuras"}
            {currentCategory === "remember" && "Tu Propósito"}
          </h2>
          <div className={styles.phrasesGrid}>
            {currentPhrases.map((phrase, index) => {
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

        {/* CTA motivacional final */}
        <section className={styles.finalCtaSection}>
          <div className={styles.finalCtaContent}>
            <Flame className={styles.finalCtaIcon} size={48} />
            <h2 className={styles.finalCtaTitle}>
              Ahora ve y conquista tu día
            </h2>
            <p className={styles.finalCtaText}>
              La motivación te inicia, el hábito te mantiene. 
              <br />
              <strong>Tú puedes con esto y más.</strong>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
