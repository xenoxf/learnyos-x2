"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import {
  Sparkles, Flame, Eye, Moon, Heart, RefreshCw, Star, Target, Zap,
  Clock, Brain, TrendingUp, Sun, Skull, Infinity, Timer, Mountain,
  Gem, BookOpen, FileText, MessageSquare, ArrowRight, Layers, Copy, Check,
  Trophy, BarChart3, Play, Pause, Square, RotateCcw, ChevronRight,
  Settings, Coffee
} from "lucide-react";
import styles from "@/styles/klerk.module.css";
import { quizzesService } from "@/services/quizzesService";
import { cardsService } from "@/services/cardsService";
import { attemptsService } from "@/services/attemptsService";
import { useRouter } from "next/navigation";
import type { ExamDeck, CardsDeck, StatsHeroProps } from "@/types";
import CardKlekComponent from "@/components/card/CardKlek";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

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

const FALLBACK_QUOTES = [
  { content: "La educación es el arma más poderosa que puedes usar para cambiar el mundo", author: "Nelson Mandela" },
  { content: "El conocimiento es poder", author: "Francis Bacon" },
  { content: "La mente que se abre a una nueva idea jamás volverá a su tamaño original", author: "Albert Einstein" },
];

type PomodoroMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

interface PomodoroState {
  mode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  startTimestamp: number | null;
  elapsedBeforeStart: number;
  pomodorosCompleted: number;
}

const DEFAULT_CONFIG: PomodoroConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

const MODE_LABELS: Record<PomodoroMode, string> = {
  focus: "Enfoque",
  shortBreak: "Descanso Corto",
  longBreak: "Descanso Largo",
};

function PomodoroTimerWidget() {
  const { saveData, loadData } = useLocalStorage();
  const [config, setConfig] = useState<PomodoroConfig>(DEFAULT_CONFIG);
  const [pomoState, setPomoState] = useState<PomodoroState>({
    mode: "focus",
    secondsLeft: DEFAULT_CONFIG.focusMinutes * 60,
    isRunning: false,
    startTimestamp: null,
    elapsedBeforeStart: 0,
    pomodorosCompleted: 0,
  });
  const [showConfig, setShowConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState<PomodoroConfig>(DEFAULT_CONFIG);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isOnStudyPage = useRef(true);
  const configRef = useRef<HTMLDivElement>(null);
  const configBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        configRef.current &&
        !configRef.current.contains(e.target as Node) &&
        configBtnRef.current &&
        !configBtnRef.current.contains(e.target as Node)
      ) {
        setShowConfig(false);
      }
    };
    if (showConfig) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showConfig]);

  const timerKey = "learnyOS_pomodoroState";
  const configKey = "learnyOS_pomodoroConfig";

  useEffect(() => {
    isOnStudyPage.current = true;
    return () => { isOnStudyPage.current = false; };
  }, []);

  useEffect(() => {
    const savedConfig = loadData(configKey, DEFAULT_CONFIG) as PomodoroConfig;
    setConfig(savedConfig);
    setTempConfig(savedConfig);

    const savedState = loadData(timerKey, null) as PomodoroState | null;
    if (savedState && savedState.isRunning && savedState.startTimestamp) {
      const elapsedOverall = Math.floor((Date.now() - savedState.startTimestamp) / 1000);
      const targetSeconds = savedState.mode === "focus"
        ? savedConfig.focusMinutes * 60
        : savedState.mode === "shortBreak"
          ? savedConfig.shortBreakMinutes * 60
          : savedConfig.longBreakMinutes * 60;
      const secondsLeft = Math.max(0, targetSeconds - elapsedOverall);
      setPomoState({
        ...savedState,
        secondsLeft,
        isRunning: secondsLeft > 0,
        startTimestamp: secondsLeft > 0 ? savedState.startTimestamp : null,
      });
    } else if (savedState) {
      const target = savedState.mode === "focus"
        ? savedConfig.focusMinutes * 60
        : savedState.mode === "shortBreak"
          ? savedConfig.shortBreakMinutes * 60
          : savedConfig.longBreakMinutes * 60;
      setPomoState({
        ...savedState,
        secondsLeft: savedState.secondsLeft ?? target,
        isRunning: false,
        startTimestamp: null,
      });
    } else {
      const initialSeconds = savedConfig.focusMinutes * 60;
      setPomoState(prev => ({ ...prev, secondsLeft: initialSeconds }));
    }
  }, [loadData, configKey, timerKey]);

  useEffect(() => {
    saveData(configKey, config);
  }, [config, saveData, configKey]);

  useEffect(() => {
    saveData(timerKey, pomoState);
  }, [pomoState, saveData, timerKey]);

  const getTargetSeconds = useCallback((mode: PomodoroMode, cfg: PomodoroConfig) => {
    if (mode === "focus") return cfg.focusMinutes * 60;
    if (mode === "shortBreak") return cfg.shortBreakMinutes * 60;
    return cfg.longBreakMinutes * 60;
  }, []);

  const transitionTo = useCallback((newMode: PomodoroMode) => {
    const target = getTargetSeconds(newMode, config);
    setPomoState(prev => ({
      ...prev,
      mode: newMode,
      secondsLeft: target,
      isRunning: false,
      startTimestamp: null,
      elapsedBeforeStart: 0,
    }));
  }, [config, getTargetSeconds]);

  const handleStart = () => {
    if (pomoState.secondsLeft <= 0) return;
    setPomoState(prev => ({
      ...prev,
      isRunning: true,
      startTimestamp: Date.now(),
      elapsedBeforeStart: prev.secondsLeft,
    }));
  };

  const handlePause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPomoState(prev => ({
      ...prev,
      isRunning: false,
      startTimestamp: null,
      secondsLeft: prev.elapsedBeforeStart,
    }));
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const target = getTargetSeconds(pomoState.mode, config);
    setPomoState(prev => ({
      ...prev,
      secondsLeft: target,
      isRunning: false,
      startTimestamp: null,
      elapsedBeforeStart: 0,
    }));
  };

  const handleComplete = useCallback(() => {
    if (pomoState.mode === "focus") {
      const newCompleted = pomoState.pomodorosCompleted + 1;
      const isLongBreak = newCompleted % config.longBreakInterval === 0;
      const nextMode: PomodoroMode = isLongBreak ? "longBreak" : "shortBreak";
      const target = isLongBreak ? config.longBreakMinutes * 60 : config.shortBreakMinutes * 60;

      if (!isOnStudyPage.current) {
        toast(`${MODE_LABELS[nextMode]} iniciado`, {
          description: isLongBreak
            ? "Tómate un respiro largo, te lo has ganado."
            : "Pequeña pausa para recargar energía.",
          icon: isLongBreak ? "☕" : "🧘",
          duration: 5000,
        });
      }

      setPomoState({
        mode: nextMode,
        secondsLeft: target,
        isRunning: true,
        startTimestamp: Date.now(),
        elapsedBeforeStart: target,
        pomodorosCompleted: newCompleted,
      });
    } else {
      const target = config.focusMinutes * 60;
      if (!isOnStudyPage.current) {
        toast("Tiempo de enfoque iniciado", {
          description: "Vuelve al trabajo. Un nuevo pomodoro ha comenzado.",
          icon: "🎯",
          duration: 4000,
        });
      }
      setPomoState({
        mode: "focus",
        secondsLeft: target,
        isRunning: true,
        startTimestamp: Date.now(),
        elapsedBeforeStart: target,
        pomodorosCompleted: pomoState.pomodorosCompleted,
      });
    }
  }, [pomoState.mode, pomoState.pomodorosCompleted, config]);

  useEffect(() => {
    if (!pomoState.isRunning || pomoState.startTimestamp === null) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pomoState.startTimestamp!) / 1000);
      const remaining = Math.max(0, pomoState.elapsedBeforeStart - elapsed);

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleComplete();
      } else {
        setPomoState(prev => ({ ...prev, secondsLeft: remaining }));
      }
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pomoState.isRunning, pomoState.startTimestamp, pomoState.elapsedBeforeStart, handleComplete]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (() => {
    const total = getTargetSeconds(pomoState.mode, config);
    if (total === 0) return 0;
    return ((total - pomoState.secondsLeft) / total) * 100;
  })();

  const isFocus = pomoState.mode === "focus";
  const isShortBreak = pomoState.mode === "shortBreak";
  const isLongBreak = pomoState.mode === "longBreak";

  const modeColor = isShortBreak
    ? "var(--success)"
    : isLongBreak
      ? "217 91% 60%"
      : "var(--primary)";

  return (
    <div
      className={styles.pomodoroWidget}
      data-mode={pomoState.mode}
    >
      <div className={styles.pomodoroInner}>
        <div className={styles.pomodoroHeader}>
          <div className={styles.pomodoroModeLabel}>
            <div
              className={styles.pomodoroModeDot}
              style={{
                backgroundColor: isShortBreak
                  ? "hsl(var(--success))"
                  : isLongBreak
                    ? "hsl(217 91% 60%)"
                    : "hsl(var(--primary))"
              }}
            />
            <span>{MODE_LABELS[pomoState.mode]}</span>
          </div>
          <div className={styles.pomodoroStats}>
            <span className={styles.pomodoroStatItem}>
              <Timer size={13} />
              {pomoState.pomodorosCompleted}
            </span>
            <button
              ref={configBtnRef}
              className={styles.pomodoroConfigBtn}
              onClick={() => { setShowConfig(!showConfig); setTempConfig(config); }}
              aria-label="Configurar"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {showConfig && (
          <div className={styles.pomodoroConfigDropdownWrapper}>
            <div ref={configRef} className={styles.pomodoroConfigDropdown}>
              <div className={styles.configRow}>
                <label className={styles.configLabel}>Enfoque</label>
                <input
                  type="number"
                  className={styles.configInput}
                  value={tempConfig.focusMinutes}
                  min={1}
                  max={120}
                  onChange={e => setTempConfig(prev => ({ ...prev, focusMinutes: Math.max(1, parseInt(e.target.value) || 1) }))}
                />
                <span className={styles.configUnit}>min</span>
              </div>
              <div className={styles.configRow}>
                <label className={styles.configLabel}>Descanso corto</label>
                <input
                  type="number"
                  className={styles.configInput}
                  value={tempConfig.shortBreakMinutes}
                  min={1}
                  max={30}
                  onChange={e => setTempConfig(prev => ({ ...prev, shortBreakMinutes: Math.max(1, parseInt(e.target.value) || 1) }))}
                />
                <span className={styles.configUnit}>min</span>
              </div>
              <div className={styles.configRow}>
                <label className={styles.configLabel}>Descanso largo</label>
                <input
                  type="number"
                  className={styles.configInput}
                  value={tempConfig.longBreakMinutes}
                  min={1}
                  max={60}
                  onChange={e => setTempConfig(prev => ({ ...prev, longBreakMinutes: Math.max(1, parseInt(e.target.value) || 1) }))}
                />
                <span className={styles.configUnit}>min</span>
              </div>
              <div className={styles.configRow}>
                <label className={styles.configLabel}>Intervalo largo</label>
                <input
                  type="number"
                  className={styles.configInput}
                  value={tempConfig.longBreakInterval}
                  min={1}
                  max={10}
                  onChange={e => setTempConfig(prev => ({ ...prev, longBreakInterval: Math.max(1, parseInt(e.target.value) || 1) }))}
                />
                <span className={styles.configUnit}>pomodoros</span>
              </div>
              <div className={styles.configActions}>
                <button
                  className={styles.configCancelBtn}
                  onClick={() => setShowConfig(false)}
                >
                  Cancelar
                </button>
                <button
                  className={styles.configSaveBtn}
                  onClick={() => {
                    setConfig(tempConfig);
                    const target = getTargetSeconds(pomoState.mode, tempConfig);
                    setPomoState(prev => ({
                      ...prev,
                      secondsLeft: target,
                      isRunning: false,
                      startTimestamp: null,
                      elapsedBeforeStart: 0,
                    }));
                    setShowConfig(false);
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.pomodoroBody}>
          <div className={styles.pomodoroTimerRing}>
            <svg className={styles.pomodoroRingSvg} viewBox="0 0 120 120">
              <circle
                className={styles.pomodoroRingBg}
                cx="60" cy="60" r="54"
                fill="none"
                strokeWidth="6"
              />
              <circle
                className={styles.pomodoroRingProgress}
                cx="60" cy="60" r="54"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                style={{
                  stroke: isShortBreak
                    ? "hsl(var(--success))"
                    : isLongBreak
                      ? "hsl(217 91% 60%)"
                      : "hsl(var(--primary))",
                  transition: "stroke-dashoffset 0.3s ease",
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                }}
              />
            </svg>
            <div className={styles.pomodoroTimerText}>
              {formatTime(pomoState.secondsLeft)}
            </div>
          </div>
        </div>

        <div className={styles.pomodoroControls}>
          {pomoState.secondsLeft <= 0 ? (
            <button
              className={styles.pomodoroBtnNext}
              onClick={handleComplete}
            >
              <ArrowRight size={16} />
              {pomoState.mode === "focus" ? "Iniciar descanso" : "Siguiente enfoque"}
            </button>
          ) : !pomoState.isRunning ? (
            <button
              className={`${styles.pomodoroBtn} ${styles.pomodoroBtnPrimary}`}
              onClick={handleStart}
              style={{
                backgroundColor: isShortBreak
                  ? "hsl(var(--success))"
                  : isLongBreak
                    ? "hsl(217 91% 60%)"
                    : "hsl(var(--primary))",
              }}
            >
              <Play size={18} />
              Iniciar
            </button>
          ) : (
            <button
              className={`${styles.pomodoroBtn} ${styles.pomodoroBtnOutline}`}
              onClick={handlePause}
            >
              <Pause size={18} />
              Pausar
            </button>
          )}
          <button
            className={styles.pomodoroBtnOutline}
            onClick={handleReset}
            aria-label="Reiniciar"
          >
            <RotateCcw size={16} />
          </button>
          <div className={styles.pomodoroModeSelector}>
            {(["focus", "shortBreak", "longBreak"] as PomodoroMode[]).map(mode => (
              <button
                key={mode}
                className={`${styles.pomodoroModeBtn} ${pomoState.mode === mode ? styles.pomodoroModeBtnActive : ""}`}
                onClick={() => {
                  if (!pomoState.isRunning) {
                    transitionTo(mode);
                  }
                }}
                disabled={pomoState.isRunning}
                data-active={pomoState.mode === mode}
              >
                {mode === "focus" ? <Brain size={13} /> : <Coffee size={13} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiQuoteSection() {
  const [apiQuote, setApiQuote] = useState<{ content: string; author: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchQuote = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch("https://api.quotable.io/random?tags=inspirational|wisdom", { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        setApiQuote({ content: data.content, author: data.author });
      } else {
        throw new Error("Failed to fetch");
      }
    } catch {
      setError(true);
      const randomFallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setApiQuote(randomFallback);
    }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  if (!apiQuote && !isLoading) return null;

  return (
    <div className={styles.apiQuoteCard}>
      <div className={styles.apiQuoteHeader}>
        <Star size={16} style={{ color: "hsl(var(--primary))" }} />
        <span className={styles.apiQuoteLabel}>
          {error ? "Sabiduría Local" : "Sabiduría del Universo"}
        </span>
        <button onClick={fetchQuote} className={styles.refreshButton} disabled={isLoading} aria-label="Nueva frase">
          <RefreshCw size={14} className={isLoading ? styles.spinning : ""} />
        </button>
      </div>
      {isLoading ? (
        <div className={styles.quoteLoadingSkeleton}>
          <div className={styles.skeletonLine} style={{ width: '80%' }} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
        </div>
      ) : apiQuote ? (
        <>
          <blockquote className={styles.apiQuoteText}>&quot;{apiQuote.content}&quot;</blockquote>
          <cite className={styles.apiQuoteAuthor}>— {apiQuote.author}</cite>
        </>
      ) : null}
    </div>
  );
}

function StatsOverview({ onSeeDetails }: { onSeeDetails: () => void }) {
  const [stats, setStats] = useState<StatsHeroProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await attemptsService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.statsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><BarChart3 size={20} /> Tu Progreso</h2>
        </div>
        <div className={styles.statsGrid}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.skeletonStat} style={{ width: '60%', height: '20px', marginBottom: '8px' }} />
              <div className={styles.skeletonStat} style={{ width: '40%', height: '28px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: "Exámenes", value: stats.totalAttempts || 0, icon: FileText, color: "hsl(var(--primary))" },
    { label: "Promedio", value: stats.avgCorrect ? `${stats.avgCorrect.toFixed(1)}%` : "0%", icon: Target, color: "#10b981" },
    { label: "Mejor", value: stats.bestScore ? `${stats.bestScore.toFixed(1)}%` : "0%", icon: Trophy, color: "#f59e0b" },
    { label: "Preguntas", value: stats.totalQuestions || 0, icon: MessageSquare, color: "#7c3aed" },
  ];

  return (
    <div className={styles.statsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><BarChart3 size={20} /> Tu Progreso</h2>
        <button className={styles.seeMoreBtn} onClick={onSeeDetails}>Ver detalles <ChevronRight size={16} /></button>
      </div>
      <div className={styles.statsGrid}>
        {statItems.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={styles.statIconWrap} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={18} />
              </div>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
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
          cardsService.getFlashcardsPublic(),
        ]);
        setPublicExams(exams.slice(0, 6));
        setPublicCards(cards.slice(0, 6));
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

  return (
    <div className={styles.container}>
      <div className={styles.bgGradient} />
      <div className={styles.backgroundEffects}>
        <div className={styles.particle} style={{ top: "10%", left: "20%" }} />
        <div className={styles.particle} style={{ top: "60%", left: "80%" }} />
        <div className={styles.particle} style={{ top: "80%", left: "30%" }} />
      </div>

      <header className={styles.heroHeader}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>Panel de Aprendizaje</span>
          </div>
          <h1 className={styles.heroTitle}>¿Qué quieres aprender hoy?</h1>
          <p className={styles.heroSubtitle}>Accede a tus herramientas de estudio y explora contenido de la comunidad</p>
        </div>
      </header>

      <main className={styles.main}>
        <PomodoroTimerWidget />

        <StatsOverview onSeeDetails={() => router.push("/study/espacio/rendimiento")} />

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

        <div className={styles.twoColLayout}>
          <div className={styles.col}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><BookOpen size={20} /> Exámenes</h2>
              <button className={styles.seeMoreBtn} onClick={() => router.push("/study/quiz")}>Ver todos</button>
            </div>
            <div className={styles.verticalList}>
              {isLoadingContent ? (
                Array(3).fill(0).map((_, i) => <div key={i} className={styles.skeletonCard} style={{ height: '72px' }} />)
              ) : publicExams.length > 0 ? (
                publicExams.slice(0, 4).map((exam) => (
                  <div key={exam.id} className={styles.listItem} onClick={() => router.push(`/study/quiz/${exam.id}`)}>
                    <div className={styles.listItemIcon} style={{ backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                      <FileText size={18} />
                    </div>
                    <div className={styles.listItemInfo}>
                      <h4 className={styles.listItemTitle}>{exam.title}</h4>
                      <span className={styles.listItemMeta}>{exam.totalQuestions || 0} preguntas · {exam.likesCount || 0} likes</span>
                    </div>
                    {exam.difficulty && <span className={styles.listItemBadge}>{exam.difficulty}</span>}
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>Sin exámenes públicos aún</p>
              )}
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><Layers size={20} /> Flashcards</h2>
              <button className={styles.seeMoreBtn} onClick={() => router.push("/study/flashcards")}>Ver todas</button>
            </div>
            <div className={styles.verticalList}>
              {isLoadingContent ? (
                Array(3).fill(0).map((_, i) => <div key={i} className={styles.skeletonCard} style={{ height: '72px' }} />)
              ) : publicCards.length > 0 ? (
                publicCards.slice(0, 4).map((card) => (
                  <div key={card.id} className={styles.listItem} onClick={() => setSelectedCardId(card.id)}>
                    <div className={styles.listItemIcon} style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                      <Layers size={18} />
                    </div>
                    <div className={styles.listItemInfo}>
                      <h4 className={styles.listItemTitle}>{card.title}</h4>
                      <span className={styles.listItemMeta}>{card.totalCards || 0} tarjetas · {card.likesCount || 0} likes</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>Sin mazos públicos aún</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.inspirationSection}>
          <div className={styles.inspirationCard}>
            <div className={styles.inspirationBg} />
            <div className={styles.inspirationContent}>
              <div className={styles.inspirationTop}>
                <div className={styles.inspirationCategory}>
                  {categoryButtons.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`${styles.catBtn} ${currentCategory === cat.id ? styles.catBtnActive : ""}`}
                      >
                        <CatIcon size={14} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`${styles.inspirationBody} ${isFlipping ? styles.flipAnimation : ""}`}>
                <div className={styles.inspirationIcon}>
                  <IconComponent size={32} />
                </div>
                <h2 className={styles.inspirationPhrase}>&ldquo;{currentPhrase.text}&rdquo;</h2>
                <p className={styles.inspirationSubtext}>— {currentPhrase.subtext}</p>
              </div>

              <div className={styles.inspirationFooter}>
                <div className={styles.progressDots}>
                  {currentPhrases.map((_, i) => (
                    <span key={i} className={`${styles.dot} ${i === currentPhraseIndex ? styles.activeDot : ""}`} />
                  ))}
                </div>
                <div className={styles.inspirationActions}>
                  <button className={styles.inspBtn} onClick={handleRefreshPhrase}>
                    <ArrowRight size={16} /> Siguiente
                  </button>
                  <button
                    className={`${styles.inspBtn} ${copied ? styles.inspBtnCopied : ""}`}
                    onClick={() => handleCopyPhrase(`"${currentPhrase.text}" - ${currentPhrase.subtext}`)}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
