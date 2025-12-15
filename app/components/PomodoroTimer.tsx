"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PomodoroSettings } from './PomodoroSettings';
import { Settings, Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PomodoroState {
  currentTime: number;
  isRunning: boolean;
  isPaused: boolean;
  currentCycle: number;
  currentSession: 'work' | 'shortBreak' | 'longBreak';
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

export const PomodoroTimer: React.FC = () => {
  const { loadData, saveData, recoverPomodoroSession, updateDailyStats } = useLocalStorage();
  const [showSettings, setShowSettings] = useState(false);
  
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>(() => {
    const recovered = recoverPomodoroSession();
    return {
      ...recovered,
      settings: {
        workTime: 25,
        shortBreak: 5,
        longBreak: 15,
        cyclesBeforeLongBreak: 4,
        autoStart: false,
        notifications: true,
        soundEnabled: true,
        ...recovered.settings
      }
    };
  });

  useEffect(() => {
    if (pomodoroState.isRunning) {
      saveData('focusOS_pomodoroState', pomodoroState);
    }
  }, [pomodoroState, saveData]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (pomodoroState.isRunning && !pomodoroState.isPaused) {
      interval = setInterval(() => {
        setPomodoroState(prev => {
          if (prev.currentTime <= 1) {
            const isWorkSession = prev.currentSession === 'work';
            
            if (isWorkSession) {
              updateDailyStats({ pomodorosCompleted: 1 });
            }
            
            let nextSession: 'work' | 'shortBreak' | 'longBreak';
            let nextTime: number;
            let newCyclesCompleted = prev.cyclesCompleted;
            
            if (isWorkSession) {
              newCyclesCompleted++;
              if (newCyclesCompleted % prev.settings.cyclesBeforeLongBreak === 0) {
                nextSession = 'longBreak';
                nextTime = prev.settings.longBreak * 60;
              } else {
                nextSession = 'shortBreak';
                nextTime = prev.settings.shortBreak * 60;
              }
            } else {
              nextSession = 'work';
              nextTime = prev.settings.workTime * 60;
            }
            
            const newState = {
              ...prev,
              currentTime: nextTime,
              isRunning: prev.settings.autoStart,
              currentSession: nextSession,
              cyclesCompleted: newCyclesCompleted,
              startTime: prev.settings.autoStart ? Date.now() : null,
              pausedAt: null
            };
            
            saveData('focusOS_pomodoroState', newState);
            
            if (prev.settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('LearnyOS', {
                body: `${isWorkSession ? 'Trabajo' : 'Descanso'} completado!`,
                icon: '/favicon.ico'
              });
            }
            
            return newState;
          } else {
            return { ...prev, currentTime: prev.currentTime - 1 };
          }
        });
      }, 1000);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [pomodoroState.isRunning, pomodoroState.isPaused, updateDailyStats, saveData]);

  const toggleTimer = useCallback(() => {
    setPomodoroState(prev => {
      const newIsRunning = !prev.isRunning;
      const newState = {
        ...prev,
        isRunning: newIsRunning,
        isPaused: false,
        startTime: newIsRunning ? Date.now() : null,
        pausedAt: !newIsRunning ? Date.now() : null
      };
      saveData('focusOS_pomodoroState', newState);
      return newState;
    });
  }, [saveData]);

  const resetTimer = useCallback(() => {
    setPomodoroState(prev => {
      const resetTime = prev.currentSession === 'work' 
        ? prev.settings.workTime * 60
        : prev.currentSession === 'shortBreak'
        ? prev.settings.shortBreak * 60
        : prev.settings.longBreak * 60;
      
      const newState = {
        ...prev,
        currentTime: resetTime,
        isRunning: false,
        isPaused: false,
        startTime: null,
        pausedAt: null
      };
      
      saveData('focusOS_pomodoroState', newState);
      return newState;
    });
  }, [saveData]);

  const handleSettingsChange = useCallback((newSettings: any) => {
    setPomodoroState(prev => {
      const updatedState = { ...prev, settings: newSettings };
      saveData('focusOS_pomodoroState', updatedState);
      return updatedState;
    });
  }, [saveData]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSessionInfo = () => {
    switch (pomodoroState.currentSession) {
      case 'work': return { name: 'Estudio', emoji: '📚', color: 'from-cyan-500 to-blue-600' };
      case 'shortBreak': return { name: 'Descanso', emoji: '☕', color: 'from-emerald-500 to-teal-600' };
      case 'longBreak': return { name: 'Descanso largo', emoji: '🌟', color: 'from-purple-500 to-violet-600' };
    }
  };

  const getProgress = () => {
    const totalTime = pomodoroState.currentSession === 'work' 
      ? pomodoroState.settings.workTime * 60
      : pomodoroState.currentSession === 'shortBreak'
      ? pomodoroState.settings.shortBreak * 60
      : pomodoroState.settings.longBreak * 60;
    return ((totalTime - pomodoroState.currentTime) / totalTime) * 100;
  };

  const progress = getProgress();
  const sessionInfo = getSessionInfo();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 rounded-2xl border border-border/50 bg-card">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", sessionInfo.color)}>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">Pomodoro</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Timer Circle */}
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4">
        <div className={cn("absolute inset-0 rounded-full blur-xl opacity-30", `bg-gradient-to-br ${sessionInfo.color}`)} />
        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000",
              pomodoroState.currentSession === 'work' ? "stroke-cyan-500" 
              : pomodoroState.currentSession === 'shortBreak' ? "stroke-emerald-500"
              : "stroke-purple-500"
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              filter: pomodoroState.isRunning ? 'drop-shadow(0 0 8px currentColor)' : 'none'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-3xl sm:text-4xl font-bold text-foreground">{formatTime(pomodoroState.currentTime)}</span>
          <span className="text-xs text-muted-foreground mt-1">{sessionInfo.emoji} {sessionInfo.name}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Ciclo</p>
          <p className="text-sm font-semibold text-primary">#{pomodoroState.currentCycle}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Completados</p>
          <p className="text-sm font-semibold text-emerald-500">{pomodoroState.cyclesCompleted}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={toggleTimer}
          className={cn(
            "h-10 px-6 rounded-xl font-semibold transition-all",
            pomodoroState.isRunning 
              ? "bg-gradient-to-r from-amber-500 to-orange-500" 
              : "bg-gradient-to-r from-cyan-500 to-blue-500",
            "text-white"
          )}
        >
          {pomodoroState.isRunning ? (
            <><Pause className="w-4 h-4 mr-2" />Pausar</>
          ) : (
            <><Play className="w-4 h-4 mr-2" />Iniciar</>
          )}
        </Button>
        <Button onClick={resetTimer} variant="outline" size="icon" className="h-10 w-10 rounded-xl">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      <PomodoroSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        workDuration={pomodoroState.settings.workTime}
        breakDuration={pomodoroState.settings.shortBreak}
        longBreakDuration={pomodoroState.settings.longBreak}
        sessionsUntilLongBreak={pomodoroState.settings.cyclesBeforeLongBreak}
        onWorkDurationChange={(value) => handleSettingsChange({ ...pomodoroState.settings, workTime: value })}
        onBreakDurationChange={(value) => handleSettingsChange({ ...pomodoroState.settings, shortBreak: value })}
        onLongBreakDurationChange={(value) => handleSettingsChange({ ...pomodoroState.settings, longBreak: value })}
        onSessionsUntilLongBreakChange={(value) => handleSettingsChange({ ...pomodoroState.settings, cyclesBeforeLongBreak: value })}
      />
    </div>
  );
};