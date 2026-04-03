"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PomodoroSettings } from "./PomodoroSettings";
import { Settings, Play, Pause, RotateCcw, Clock } from "lucide-react";
import styles from "@/styles/PomodoroTimer.module.css";

interface PomodoroState {
  currentTime: number;
  isRunning: boolean;
  isPaused: boolean;
  currentCycle: number;
  currentSession: "work" | "shortBreak" | "longBreak";
  cyclesCompleted: number;
  settings: {
    workTime: number;
    shortBreak: number;
    longBreak: number;
    cyclesBeforeLongBreak: number;
    autoStart: boolean;
    notifications: boolean;
    soundEnabled: boolean;
  };
  startTime: number | null;
  pausedAt: number | null;
}

interface SessionInfo {
  name: string;
  emoji: string;
  colorClass: string;
  progressColor: string;
}

export const PomodoroTimer: React.FC = () => {
  const { loadData, saveData, recoverPomodoroSession, updateDailyStats } =
    useLocalStorage();
  const [showSettings, setShowSettings] = useState(false);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const [pomodoroState, setPomodoroState] = useState<PomodoroState>(() => {
    const recovered = recoverPomodoroSession();
    return {
      ...recovered,
      settings: {
        ...recovered.settings,
        workTime: recovered.settings?.workTime ?? 25,
        shortBreak: recovered.settings?.shortBreak ?? 5,
        longBreak: recovered.settings?.longBreak ?? 15,
        cyclesBeforeLongBreak: recovered.settings?.cyclesBeforeLongBreak ?? 4,
        autoStart: recovered.settings?.autoStart ?? false,
        notifications: recovered.settings?.notifications ?? true,
        soundEnabled: recovered.settings?.soundEnabled ?? true,
      },
    };
  });

  // Session info memoized
  const sessionInfo: SessionInfo = useMemo(() => {
    switch (pomodoroState.currentSession) {
      case "work":
        return {
          name: "Estudio",
          emoji: "📚",
          colorClass: styles.workGradient,
          progressColor: styles.workProgress,
        };
      case "shortBreak":
        return {
          name: "Descanso",
          emoji: "☕",
          colorClass: styles.shortBreakGradient,
          progressColor: styles.shortBreakProgress,
        };
      case "longBreak":
        return {
          name: "Descanso largo",
          emoji: "🌟",
          colorClass: styles.longBreakGradient,
          progressColor: styles.longBreakProgress,
        };
      default:
        return {
          name: "Estudio",
          emoji: "📚",
          colorClass: styles.workGradient,
          progressColor: styles.workProgress,
        };
    }
  }, [pomodoroState.currentSession]);

  // Calculate progress memoized
  const progress = useMemo(() => {
    const totalTime =
      pomodoroState.currentSession === "work"
        ? pomodoroState.settings.workTime * 60
        : pomodoroState.currentSession === "shortBreak"
          ? pomodoroState.settings.shortBreak * 60
          : pomodoroState.settings.longBreak * 60;
    return ((totalTime - pomodoroState.currentTime) / totalTime) * 100;
  }, [
    pomodoroState.currentSession,
    pomodoroState.currentTime,
    pomodoroState.settings,
  ]);

  // Format time function
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  // Animation loop for smoother timer updates
  const animate = useCallback(
    (time: number) => {
      if (
        previousTimeRef.current !== undefined &&
        pomodoroState.isRunning &&
        !pomodoroState.isPaused
      ) {
        setPomodoroState((prev) => {
          if (prev.currentTime <= 1) {
            const isWorkSession = prev.currentSession === "work";

            if (isWorkSession) {
              updateDailyStats({ pomodorosCompleted: 1 });
            }

            let nextSession: "work" | "shortBreak" | "longBreak";
            let nextTime: number;
            let newCyclesCompleted = prev.cyclesCompleted;

            if (isWorkSession) {
              newCyclesCompleted++;
              if (
                newCyclesCompleted % prev.settings.cyclesBeforeLongBreak ===
                0
              ) {
                nextSession = "longBreak";
                nextTime = prev.settings.longBreak * 60;
              } else {
                nextSession = "shortBreak";
                nextTime = prev.settings.shortBreak * 60;
              }
            } else {
              nextSession = "work";
              nextTime = prev.settings.workTime * 60;
            }

            const newState = {
              ...prev,
              currentTime: nextTime,
              isRunning: prev.settings.autoStart,
              currentSession: nextSession,
              cyclesCompleted: newCyclesCompleted,
              startTime: prev.settings.autoStart ? Date.now() : null,
              pausedAt: null,
            };

            saveData("focusOS_pomodoroState", newState);

            if (
              prev.settings.notifications &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("LearnYos", {
                body: `${isWorkSession ? "Trabajo" : "Descanso"} completado!`,
                icon: "/favicon.ico",
              });
            }

            return newState;
          }
          return { ...prev, currentTime: prev.currentTime - 1 };
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [
      pomodoroState.isRunning,
      pomodoroState.isPaused,
      updateDailyStats,
      saveData,
    ],
  );

  // Start/stop animation loop
  useEffect(() => {
    if (pomodoroState.isRunning && !pomodoroState.isPaused) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [pomodoroState.isRunning, pomodoroState.isPaused, animate]);

  // Save state when running
  useEffect(() => {
    if (pomodoroState.isRunning) {
      saveData("focusOS_pomodoroState", pomodoroState);
    }
  }, [pomodoroState, saveData]);

  // Toggle timer
  const toggleTimer = useCallback(() => {
    setPomodoroState((prev) => {
      const newIsRunning = !prev.isRunning;
      const newState = {
        ...prev,
        isRunning: newIsRunning,
        isPaused: false,
        startTime: newIsRunning ? Date.now() : null,
        pausedAt: !newIsRunning ? Date.now() : null,
      };
      saveData("focusOS_pomodoroState", newState);
      return newState;
    });
  }, [saveData]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setPomodoroState((prev) => {
      const resetTime =
        prev.currentSession === "work"
          ? prev.settings.workTime * 60
          : prev.currentSession === "shortBreak"
            ? prev.settings.shortBreak * 60
            : prev.settings.longBreak * 60;

      const newState = {
        ...prev,
        currentTime: resetTime,
        isRunning: false,
        isPaused: false,
        startTime: null,
        pausedAt: null,
      };

      saveData("focusOS_pomodoroState", newState);
      return newState;
    });
  }, [saveData]);

  // Handle settings change
  const handleSettingsChange = useCallback(
    (newSettings: any) => {
      setPomodoroState((prev) => {
        const updatedState = { ...prev, settings: newSettings };
        saveData("focusOS_pomodoroState", updatedState);
        return updatedState;
      });
    },
    [saveData],
  );

  // Notificaciones se manejan con useToast; no pedir permiso de Notification

  // Calculate stroke dasharray for circle
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={`${styles.headerIcon} ${sessionInfo.colorClass}`}>
            <Clock className={styles.icon} />
          </div>
          <span className={styles.title}>Pomodoro</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          className={styles.settingsButton}
        >
          <Settings className={styles.smallIcon} />
        </Button>
      </div>

      {/* Timer Circle */}
      <div className={styles.timerCircleContainer}>
        <div className={`${styles.timerGlow} ${sessionInfo.colorClass}`} />
        <svg className={styles.timerSvg} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className={styles.timerBackground} />
          <circle
            cx="50"
            cy="50"
            r="45"
            className={`${styles.timerProgress} ${sessionInfo.progressColor}`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              filter: pomodoroState.isRunning
                ? "drop-shadow(0 0 8px currentColor)"
                : "none",
            }}
          />
        </svg>
        <div className={styles.timerTextContainer}>
          <span className={styles.timeDisplay}>
            {formatTime(pomodoroState.currentTime)}
          </span>
          <span className={styles.sessionInfo}>
            {sessionInfo.emoji} {sessionInfo.name}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Ciclo</p>
          <p className={`${styles.statValue} ${styles.primaryStat}`}>
            #{pomodoroState.currentCycle}
          </p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Completados</p>
          <p className={`${styles.statValue} ${styles.successStat}`}>
            {pomodoroState.cyclesCompleted}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controlsContainer}>
        <Button
          onClick={toggleTimer}
          className={`${styles.mainButton} ${pomodoroState.isRunning ? styles.runningButton : styles.pausedButton}`}
        >
          {pomodoroState.isRunning ? (
            <>
              <Pause className={styles.buttonIcon} />
              Pausar
            </>
          ) : (
            <>
              <Play className={styles.buttonIcon} />
              Iniciar
            </>
          )}
        </Button>
        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className={styles.resetButton}
        >
          <RotateCcw className={styles.smallIcon} />
        </Button>
      </div>

      <PomodoroSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};
