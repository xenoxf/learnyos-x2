"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Brain, Coffee, ArrowRight, Play, Pause, RotateCcw, Timer, Settings,
} from "lucide-react";
import styles from "@/styles/klerk.module.css";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

export interface PomodoroConfig {
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

export function PomodoroTimerWidget() {
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


  const isShortBreak = pomoState.mode === "shortBreak";
  const isLongBreak = pomoState.mode === "longBreak";

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
