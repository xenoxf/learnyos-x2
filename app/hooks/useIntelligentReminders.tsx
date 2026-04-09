"use client"

import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/hooks/useLocalToast';

interface Reminder {
  id: string;
  message: string;
  time: string;
  type: 'break' | 'study' | 'review';
  enabled: boolean;
}

interface StudyPattern {
  averageSessionLength: number;
  preferredStudyTime: string;
  preferredStudyTimes: string[];
  breakFrequency: number;
  mostProductiveHours: number[];
  productiveDays: string[];
}

export const useIntelligentReminders = () => {
  const { stats } = useLocalStorage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [studyPattern, setStudyPattern] = useState<StudyPattern | null>(null);

  const analyzeStudyPatterns = () => {
    if (!stats.dailyData || Object.keys(stats.dailyData).length === 0) {
      return null;
    }

    const sessions = Object.values(stats.dailyData);
    const avgSessionLength = sessions.reduce((acc, day) => {
      return acc + (day.minutes / Math.max(day.sessions, 1));
    }, 0) / sessions.length;

    // Analyze most productive hours (simplified)
    const mostProductiveHours = [9, 10, 14, 15, 20, 21]; // Default productive hours
    const preferredStudyTimes = ['10:00', '14:00', '20:00'];
    const productiveDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    const pattern: StudyPattern = {
      averageSessionLength: Math.round(avgSessionLength),
      preferredStudyTime: '10:00',
      preferredStudyTimes,
      breakFrequency: Math.round(avgSessionLength / 25), // Break every 25 min on average
      mostProductiveHours,
      productiveDays
    };

    setStudyPattern(pattern);
    return pattern;
  };

  const generateIntelligentReminders = () => {
    const pattern = analyzeStudyPatterns();
    if (!pattern) return;

    const newReminders: Reminder[] = [
      {
        id: 'morning_study',
        message: `¡Es tu momento más productivo! Tiempo estimado de sesión: ${pattern.averageSessionLength} min`,
        time: pattern.preferredStudyTime,
        type: 'study',
        enabled: true
      },
      {
        id: 'break_reminder',
        message: 'Es hora de tomar un descanso. Tu cerebro te lo agradecerá.',
        time: '14:30',
        type: 'break',
        enabled: true
      },
      {
        id: 'evening_review',
        message: 'Momento perfecto para repasar lo aprendido hoy.',
        time: '19:00',
        type: 'review',
        enabled: true
      }
    ];

    setReminders(newReminders);
  };

  const scheduleNotification = (reminder: Reminder) => {
    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      toast.success("Éxito");
    }, timeUntilReminder);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder
      )
    );
  };

  useEffect(() => {
    generateIntelligentReminders();
  }, [stats]);

  useEffect(() => {
    reminders.filter(r => r.enabled).forEach(scheduleNotification);
  }, [reminders]);

  return {
    reminders,
    studyPattern,
    toggleReminder,
    analyzeStudyPatterns,
    generateIntelligentReminders
  };
};
