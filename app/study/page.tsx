"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense, memo } from "react";
import {
  Sparkles, Flame, Eye, Moon, Heart, RefreshCw, Star, Target, Zap,
  Clock, Brain, TrendingUp, Sun, Skull, Infinity, Timer, Mountain,
  Gem, BookOpen, FileText, MessageSquare, ArrowRight, Layers, Copy, Check,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigRightDash
} from "lucide-react";
import styles from "@/styles/klerk.module.css";
import { quizzesService } from "@/services/quizzesService";
import { cardsService } from "@/services/cardsService";
import { useRouter } from "next/navigation";
import type { ExamDeck, CardsDeck } from "@/types";
import CardKlekComponent from "@/components/card/CardKlek";

const iconMap = {
  Target, Zap, Clock, Brain, Sparkles, Flame, Eye, Moon, Skull, Star,
  Infinity, Timer, Mountain, Gem, BookOpen, FileText, MessageSquare,
  ArrowRight, Layers, Copy, Check
} as const;

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
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState("motivation");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [publicExams, setPublicExams] = useState<ExamDeck[]>([]);
  const [publicCards, setPublicCards] = useState<CardsDeck[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [copied, setCopied] = useState(false);
  const phraseIndexRef = useRef(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [exams, cards] = await Promise.all([
          quizzesService.getExamsPublic(),
          cardsService.getFlashcardsPublic()
        ]);
        setPublicExams(exams.slice(0, 4));
        setPublicCards(cards.slice(0, 4));
      } catch (error) {
        console.error("Error fetching community content:", error);
      } finally {
        setIsLoadingContent(false);
      }
    };
    fetchContent();
  }, []);

  const handleRefreshPhrase = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const phrases = getCategoryPhrases(currentCategory);
      const nextIndex = (currentPhraseIndex + 1) % phrases.length;
      setCurrentPhraseIndex(nextIndex);
      phraseIndexRef.current = nextIndex;
      setIsFlipping(false);
    }, 300);
  };

  const handleCategoryChange = (cat: string) => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentCategory(cat);
      setCurrentPhraseIndex(0);
      phraseIndexRef.current = 0;
      setIsFlipping(false);
    }, 300);
  };

  const handleCopyPhrase = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFlipping) {
        const phrases = getCategoryPhrases(currentCategory);
        const nextIndex = (phraseIndexRef.current + 1) % phrases.length;
        phraseIndexRef.current = nextIndex;
        setCurrentPhraseIndex(nextIndex);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [currentCategory, isFlipping]);

  const currentPhrases = getCategoryPhrases(currentCategory);
  const currentPhrase = currentPhrases[currentPhraseIndex];
  const IconComponent = iconMap[currentPhrase.icon as keyof typeof iconMap] || Sparkles;

  const categoryButtons = [
    { id: "motivation", label: "Motivación", icon: Flame },
    { id: "philosophical", label: "Filosofía", icon: Eye },
    { id: "dark", label: "Oscuro", icon: Moon },
    { id: "remember", label: "Propósito", icon: Heart },
  ];

  const quickActions = [
    {
      title: "Crear Examen",
      description: "Genera una evaluación personalizada con IA.",
      icon: FileText,
      path: "/study/quiz",
      color: "hsl(var(--primary))"
    },
    {
      title: "Practicar Flashcards",
      description: "Mejora tu memoria con mazos de la comunidad.",
      icon: Layers,
      path: "/study/flashcards",
      color: "#f59e0b"
    },
    {
      title: "Preguntar a Junior IA",
      description: "Resuelve dudas al instante con tu tutor inteligente.",
      icon: MessageSquare,
      path: "/study/chat",
      color: "#7c3aed"
    }
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
            <h1 className={styles.title}>Panel de Aprendizaje</h1>
          </div>
          <p className={styles.subtitle}>¿Qué quieres aprender o validar hoy?</p>
        </div>
      </header>

      <main className={styles.main}>
        {/* Quick Actions */}
        <section className={styles.section}>
          <div className={styles.sectionTitleHeader}>
            <h2 className={styles.sectionTitle}><Zap className={styles.sectionIcon} /> Acceso Rápido</h2>
          </div>
          <div className={styles.quickActions}>
            {quickActions.map((action, i) => (
              <button key={i} className={styles.actionCard} onClick={() => router.push(action.path)}>
                <div className={styles.actionHeader}>
                  <div className={styles.actionIcon} style={{ backgroundColor: `${action.color}20`, color: action.color }}>
                    <action.icon size={24} />
                  </div>
                  <ArrowRight size={18} className={styles.buttonArrow} />
                </div>
                <h3 className={styles.actionTitle}>{action.title}</h3>
                <p className={styles.actionDescription}>{action.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Community Spotlight - Exams */}
        <section className={styles.section}>
          <div className={styles.sectionTitleHeader}>
            <h2 className={styles.sectionTitle}><BookOpen className={styles.sectionIcon} /> Exámenes de la Comunidad</h2>
            <button className={styles.seeMoreBtn} onClick={() => router.push("/study/quiz")}>Ver todos</button>
          </div>
          <div className={styles.communityGrid}>
            {isLoadingContent ? (
              Array(4).fill(0).map((_, i) => <div key={i} className={styles.skeletonCard} style={{ height: '140px' }} />)
            ) : publicExams.length > 0 ? (
              publicExams.map((exam) => (
                <div key={exam.id} className={styles.publicItemCard} onClick={() => router.push(`/study/quiz/${exam.id}`)}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemBadge}>Examen</span>
                    {exam.difficulty && <span className={styles.difficultyBadge}>{exam.difficulty}</span>}
                  </div>
                  <h3 className={styles.itemTitle}>{exam.title}</h3>
                  <div className={styles.itemMeta}>
                    <div className={styles.metaDetail}><Target size={14} /> {exam.totalQuestions || 0} preg.</div>
                    <div className={styles.metaDetail}><Heart size={14} /> {exam.likesCount || 0}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noDataText}>No hay exámenes públicos disponibles aún.</p>
            )}
          </div>
        </section>

        {/* Community Spotlight - Flashcards */}
        <section className={styles.section}>
          <div className={styles.sectionTitleHeader}>
            <h2 className={styles.sectionTitle}><Layers className={styles.sectionIcon} /> Flashcards Populares</h2>
            <button className={styles.seeMoreBtn} onClick={() => router.push("/study/flashcards")}>Ver todas</button>
          </div>
          <div className={styles.communityGrid}>
            {isLoadingContent ? (
              Array(4).fill(0).map((_, i) => <div key={i} className={styles.skeletonCard} style={{ height: '140px' }} />)
            ) : publicCards.length > 0 ? (
              publicCards.map((card) => (
                <div key={card.id} className={styles.publicItemCard} onClick={() => setSelectedCardId(card.id)}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemBadge} style={{ backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>Mazo</span>
                  </div>
                  <h3 className={styles.itemTitle}>{card.title}</h3>
                  <div className={styles.itemMeta}>
                    <div className={styles.metaDetail}><Eye size={14} /> {card.totalCards || 0} tarjetas</div>
                    <div className={styles.metaDetail}><Heart size={14} /> {card.likesCount || 0}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noDataText}>No hay mazos públicos disponibles aún.</p>
            )}
          </div>
        </section>

        {/* Daily Inspiration (DYNAMIC & INTERACTIVE) */}
        <section className={styles.section} style={{ marginTop: '4rem' }}>
          <div className={styles.sectionTitleHeader}>
            <h2 className={styles.sectionTitle}><Sun className={styles.sectionIcon} /> Inspiración Diaria</h2>
            <div className={styles.miniCategorySelector}>
              {categoryButtons.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`${styles.miniCatBtn} ${currentCategory === cat.id ? styles.miniCatBtnActive : ""}`}
                    title={cat.label}
                  >
                    <CatIcon size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`${styles.interactiveHeroCard} ${isFlipping ? styles.flipAnimation : ""}`}>
            <div className={styles.heroHeader}>
              <div className={styles.heroIcon}><IconComponent size={28} /></div>
              <div className={styles.heroCategoryBadge}>{currentPhrase.category}</div>
            </div>

            <h2 className={styles.heroPhrase}>&ldquo;{currentPhrase.text}&rdquo;</h2>
            <p className={styles.heroSubtext}>— {currentPhrase.subtext}</p>

            <div className={styles.progressDots}>
              {currentPhrases.map((_, i) => (
                <span key={i} className={`${styles.dot} ${i === currentPhraseIndex ? styles.activeDot : ""}`} />
              ))}
            </div>

            <div className={styles.heroActions}>
              <button className={styles.heroActionBtn} onClick={handleRefreshPhrase}>
                <ArrowRight size={19} />
                Siguiente
              </button>
              <button
                className={`${styles.heroActionBtn} ${copied ? styles.copySuccess : ""}`}
                onClick={() => handleCopyPhrase(`"${currentPhrase.text}" - ${currentPhrase.subtext}`)}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </section>

        <Suspense fallback={null}>
          <ApiQuoteSection />
        </Suspense>

        {selectedCardId && (
          <CardKlekComponent
            cardId={selectedCardId}
            onClose={() => setSelectedCardId(null)}
          />
        )}
      </main>
    </div>
  );
}
