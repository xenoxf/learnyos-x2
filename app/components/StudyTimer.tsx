"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const StudyTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { saveData, loadData, getTodayKey } = useLocalStorage();

  // Auto-start timer when user enters the web
  useEffect(() => {
    const userId = localStorage.getItem('currentUserId') || 'default-user';
    const autoTimer = loadData(`learnyOS_autoTimer_${userId}`, { started: false, startTime: null });
    
    if (autoTimer.started && autoTimer.startTime) {
      const elapsed = Math.floor((Date.now() - autoTimer.startTime) / 1000);
      setSeconds(elapsed);
      setIsRunning(true);
    } else {
      // Auto-start when user enters
      setIsRunning(true);
      saveData(`learnyOS_autoTimer_${userId}`, { started: true, startTime: Date.now() });
    }

    // Stop timer when user leaves or reloads
    const handleBeforeUnload = () => {
      const userId = localStorage.getItem('currentUserId') || 'default-user';
      saveData(`learnyOS_autoTimer_${userId}`, { started: false, startTime: null });
    };

    const handleVisibilityChange = () => {
      const userId = localStorage.getItem('currentUserId') || 'default-user';
      if (document.hidden) {
        // Page hidden - pause timer
        saveData(`learnyOS_autoTimer_${userId}`, { started: false, startTime: null });
        setIsRunning(false);
      } else {
        // Page visible - resume timer
        const autoTimer = loadData(`learnyOS_autoTimer_${userId}`, { started: false, startTime: null });
        if (!autoTimer.started) {
          setIsRunning(true);
          saveData(`learnyOS_autoTimer_${userId}`, { started: true, startTime: Date.now() - (seconds * 1000) });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData, saveData, seconds]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning) {
      intervalId = setInterval(() => setSeconds(seconds => seconds + 1), 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  const time = formatTime(seconds);

  const handleStart = () => {
    setIsRunning(true);
    const userId = localStorage.getItem('currentUserId') || 'default-user';
    saveData(`learnyOS_autoTimer_${userId}`, { started: true, startTime: Date.now() - (seconds * 1000) });
  };

  const handlePause = () => setIsRunning(false);
  
  const handleStop = () => {
    setIsRunning(false);
    if (seconds > 0) {
      const userId = localStorage.getItem('currentUserId') || 'default-user';
      const today = getTodayKey();
      const userStats = loadData(`learnyOS_userStats_${userId}`, {
        dailyData: {} as Record<string, any>,
        totalStudyTime: 0
      });
      
      if (!userStats.dailyData) userStats.dailyData = {};
      if (!userStats.dailyData[today]) {
        userStats.dailyData[today] = {
          studyMinutes: 0,
          pomodorosCompleted: 0,
          quizzesTaken: 0,
          chatMessages: 0,
          notesGenerated: 0,
          flashcardsReviewed: 0
        };
      }
      
      const minutesStudied = Math.floor(seconds / 60);
      userStats.dailyData[today].studyMinutes += minutesStudied;
      userStats.totalStudyTime = (userStats.totalStudyTime || 0) + minutesStudied;
      
      saveData(`learnyOS_userStats_${userId}`, userStats);
      saveData(`learnyOS_autoTimer_${userId}`, { started: false, startTime: null });
    }
    setSeconds(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    const userId = localStorage.getItem('currentUserId') || 'default-user';
    saveData(`learnyOS_autoTimer_${userId}`, { started: false, startTime: null });
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-blue-900 dark:text-blue-100 flex items-center gap-2">
          ⏱️ Tiempo de Estudio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="text-3xl font-mono font-bold text-blue-900 dark:text-blue-100">
            {time.hours}:{time.minutes}:{time.seconds}
          </div>
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button
                size="sm"
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handlePause}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleReset}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Timer iniciado automáticamente
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
