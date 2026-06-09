"use client"

import { errorHandler } from "@/services/errorHandler";
import { useState, useEffect, useCallback } from 'react';

interface DayData {
  minutes: number;
  sessions: number;
  date: string;
  studyMinutes?: number;
  pomodorosCompleted?: number;
  quizzesTaken?: number;
  chatMessages?: number;
  notesGenerated?: number;
  flashcardsReviewed?: number;
}

interface WeeklyData {
  day: string;
  minutes: number;
  isActive: boolean;
  isFuture: boolean;
}

interface UserStats {
  totalMinutes: number;
  totalSessions: number;
  currentStreak: number;
  level: number;
  xp: number;
  totalXP?: number;
  totalStudyTime?: number;
  totalChatSessions?: number;
  totalQuizzes?: number;
  totalNotesGenerated?: number;
  totalFlashcards?: number;
  totalPomodoros?: number;
  dailyData: { [key: string]: DayData };
}

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

const defaultStats: UserStats = {
  totalMinutes: 0,
  totalSessions: 0,
  currentStreak: 0,
  level: 1,
  xp: 0,
  dailyData: {}
};

const defaultPomodoroState: PomodoroState = {
  currentTime: 25 * 60,
  isRunning: false,
  isPaused: false,
  currentCycle: 1,
  currentSession: 'work',
  cyclesCompleted: 0,
  settings: {
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    cyclesBeforeLongBreak: 4,
    autoStart: false,
    notifications: true,
    soundEnabled: true
  },
  startTime: null,
  pausedAt: null
};

export const useLocalStorage = () => {
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadData = useCallback(<T,>(key: string, defaultValue: T): T => {
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return { ...defaultValue, ...parsed };
      }
    } catch (error) {
      errorHandler(error, "Error loading/saving key");
    }
    return defaultValue;
  }, []);

  const saveData = useCallback(<T,>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      errorHandler(error, "Error loading/saving key");
    }
  }, []);

  const getStats = useCallback((): UserStats => {
    return loadData('focusOS_userStats', defaultStats);
  }, [loadData]);

  const getTodayKey = useCallback((): string => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const updateDailyStats = useCallback((newStats: Partial<DayData>): void => {
    const currentStats = getStats();
    const today = getTodayKey();
    
    const updatedStats: UserStats = {
      ...currentStats,
      dailyData: {
        ...currentStats.dailyData,
        [today]: {
          minutes: currentStats.dailyData[today]?.minutes || 0,
          sessions: currentStats.dailyData[today]?.sessions || 0,
          date: today,
          studyMinutes: (currentStats.dailyData[today]?.studyMinutes || 0) + (newStats.studyMinutes || 0),
          pomodorosCompleted: (currentStats.dailyData[today]?.pomodorosCompleted || 0) + (newStats.pomodorosCompleted || 0),
          quizzesTaken: (currentStats.dailyData[today]?.quizzesTaken || 0) + (newStats.quizzesTaken || 0),
          chatMessages: (currentStats.dailyData[today]?.chatMessages || 0) + (newStats.chatMessages || 0),
          notesGenerated: (currentStats.dailyData[today]?.notesGenerated || 0) + (newStats.notesGenerated || 0),
          flashcardsReviewed: (currentStats.dailyData[today]?.flashcardsReviewed || 0) + (newStats.flashcardsReviewed || 0),
          ...newStats
        }
      }
    };

    saveData('focusOS_userStats', updatedStats);
    setStats(updatedStats);
  }, [getStats, getTodayKey, saveData]);

  const recoverPomodoroSession = useCallback((): PomodoroState => {
    return loadData('focusOS_pomodoroState', defaultPomodoroState);
  }, [loadData]);

  const addStudySession = useCallback((minutes: number) => {
    const currentStats = getStats();
    const today = new Date().toDateString();
    
    const updatedStats: UserStats = {
      ...currentStats,
      totalMinutes: currentStats.totalMinutes + minutes,
      totalSessions: currentStats.totalSessions + 1,
      xp: currentStats.xp + minutes * 2,
      dailyData: {
        ...currentStats.dailyData,
        [today]: {
          minutes: (currentStats.dailyData[today]?.minutes || 0) + minutes,
          sessions: (currentStats.dailyData[today]?.sessions || 0) + 1,
          date: today
        }
      }
    };

    // Calculate level (every 100 XP = 1 level)
    updatedStats.level = Math.floor(updatedStats.xp / 100) + 1;

    saveData('focusOS_userStats', updatedStats);
    setStats(updatedStats);
    return updatedStats;
  }, [getStats, saveData]);

  const getWeeklyProgress = useCallback((): WeeklyData[] => {
    const currentStats = getStats();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weeklyData: WeeklyData[] = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toDateString();
      const dayData = currentStats.dailyData[dateString];
      const isFuture = date > today;

      weeklyData.push({
        day: dayNames[i],
        minutes: dayData?.minutes || 0,
        isActive: !isFuture,
        isFuture
      });
    }

    return weeklyData;
  }, [getStats]);

  const getTodayMinutes = useCallback((): number => {
    const currentStats = getStats();
    const today = new Date().toDateString();
    return currentStats.dailyData[today]?.minutes || 0;
  }, [getStats]);

  const getCurrentStreak = useCallback((): number => {
    const currentStats = getStats();
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toDateString();
      
      if (currentStats.dailyData[dateString]?.minutes > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [getStats]);

  const resetStats = useCallback(() => {
    localStorage.removeItem('focusOS_userStats');
    setStats(defaultStats);
  }, []);

  useEffect(() => {
    setStats(getStats());
    setIsInitialized(true);
  }, [getStats]);

  return {
    stats,
    addStudySession,
    getWeeklyProgress,
    getTodayMinutes,
    getCurrentStreak,
    resetStats,
    loadData,
    saveData,
    updateDailyStats,
    recoverPomodoroSession,
    getTodayKey,
    isInitialized
  };
};
