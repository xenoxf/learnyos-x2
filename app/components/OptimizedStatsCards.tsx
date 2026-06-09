"use client";
import React, { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Target, Zap, TrendingUp, Clock } from 'lucide-react';

const OptimizedStatsCards: React.FC = React.memo(() => {
  const { loadData, getTodayKey } = useLocalStorage();

  const [userId, setUserId] = React.useState<string>('default-user');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('currentUserId') || 'default-user');
    }
  }, []);

  const stats = useMemo(() => {
    const today = getTodayKey();
    
    const userStats = loadData(`learnyOS_userStats_${userId}`, {
      dailyData: {} as Record<string, any>,
      totalStudyTime: 0,
      totalExperience: 0,
      level: 1
    });

    const dailyData = userStats.dailyData;
    const todayData = dailyData?.[today] || {
      studyMinutes: 0,
      pomodorosCompleted: 0,
      quizzesTaken: 0,
      chatMessages: 0,
      notesGenerated: 0,
      flashcardsReviewed: 0
    };

    // Calculate streak
    const dates = Object.keys(userStats.dailyData || {}).sort();
    let streak = 0;
    const todayDate = new Date().toISOString().split('T')[0];
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      const dayData = userStats.dailyData[date];
      
      if (dayData.studyMinutes > 0 || dayData.chatMessages > 0 || dayData.quizzesTaken > 0) {
        if (date === todayDate || streak > 0) {
          streak++;
        }
      } else {
        break;
      }
    }

    // Calculate weekly progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weeklyMinutes = dates
      .filter(date => {
        const d = new Date(date);
        return d >= weekStart;
      })
      .reduce((total, date) => {
        return total + (userStats.dailyData[date]?.studyMinutes || 0);
      }, 0);

    return {
      level: userStats.level || 1,
      experience: userStats.totalExperience || 0,
      todayStudy: todayData.studyMinutes,
      streak,
      weeklyMinutes,
      totalActivities: todayData.chatMessages + todayData.quizzesTaken + todayData.notesGenerated + todayData.flashcardsReviewed
    };
  }, [loadData, getTodayKey, userId]);

  const cards = useMemo(() => [
    {
      title: 'Nivel Actual',
      value: stats.level,
      subtitle: `${stats.experience} XP`,
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-600',
      change: '+1 este mes'
    },
    {
      title: 'Estudio Hoy',
      value: `${stats.todayStudy}`,
      subtitle: 'minutos',
      icon: Clock,
      color: 'from-blue-500 to-cyan-600',
      change: `${stats.weeklyMinutes}min esta semana`
    },
    {
      title: 'Racha',
      value: stats.streak,
      subtitle: 'días consecutivos',
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      change: stats.streak > 0 ? '¡Sigue así!' : 'Comienza hoy'
    },
    {
      title: 'Actividades',
      value: stats.totalActivities,
      subtitle: 'completadas hoy',
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      change: 'Chats, exámenes, notas...'
    }
  ], [stats]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden border-border bg-card hover:shadow-md transition-shadow">
          <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-5`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.subtitle}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {card.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

OptimizedStatsCards.displayName = 'OptimizedStatsCards';

export default OptimizedStatsCards;