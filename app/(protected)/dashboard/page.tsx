"use client";

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, MessageSquare, Brain, CreditCard, RefreshCw, Zap } from 'lucide-react';
import styles from '@/styles/dashboard.module.css';
import Link from 'next/link';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { MemoryGame } from '@/components/MemoryGame';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    notesCount: 0,
    flashcardsCount: 0,
    examsCount: 0,
    messagesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'pomodoro' | 'games'>('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [notes, flashcards, exams, chats] = await Promise.all([
        apiService.getNotes().catch(() => []),
        apiService.getFlashcards().catch(() => []),
        apiService.getExams().catch(() => []),
        apiService.getUserChats().catch(() => []),
      ]);

      setStats({
        notesCount: Array.isArray(notes) ? notes.length : 0,
        flashcardsCount: Array.isArray(flashcards) ? flashcards.length : 0,
        examsCount: Array.isArray(exams) ? exams.length : 0,
        messagesCount: Array.isArray(chats) ? chats.length : 0,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar estadísticas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { label: 'Notas', count: stats.notesCount, icon: BookOpen, href: '/(protected)/notes', color: 'text-blue-500' },
    { label: 'Chat IA', count: stats.messagesCount, icon: MessageSquare, href: '/(protected)/chat', color: 'text-purple-500' },
    { label: 'Exámenes', count: stats.examsCount, icon: Brain, href: '/(protected)/quiz', color: 'text-green-500' },
    { label: 'Flashcards', count: stats.flashcardsCount, icon: CreditCard, href: '/(protected)/flashcards', color: 'text-orange-500' },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.header}>
        <h1 className={styles.title}>¡Bienvenido de nuevo, {user?.name || 'Usuario'}! 👋</h1>
        <p className={styles.subtitle}>Tu centro de aprendizaje inteligente</p>
      </section>

      {/* Tabs Navigation */}
      <section className="mb-6 flex gap-2">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
          className="flex-1"
        >
          📊 Resumen
        </Button>
        <Button
          variant={activeTab === 'pomodoro' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pomodoro')}
          className="flex-1"
        >
          ⏲️ Pomodoro
        </Button>
        <Button
          variant={activeTab === 'games' ? 'default' : 'outline'}
          onClick={() => setActiveTab('games')}
          className="flex-1"
        >
          🎮 Juegos
        </Button>
      </section>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Cargando tus estadísticas...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <section className={styles.statsGrid}>
                {statItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Card className={`${styles.statCard} hover:shadow-lg transition-all cursor-pointer`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              {item.label}
                            </CardTitle>
                            <Icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className={`${styles.statValue}`}>{item.count}</p>
                          <p className="text-xs text-muted-foreground mt-1">Elementos guardados</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </section>

              {/* Quick Actions */}
              <section className="mt-8">
                <h2 className="text-lg font-semibold mb-4">🚀 Acciones rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/(protected)/notes">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Crear Notas
                    </Button>
                  </Link>
                  <Link href="/(protected)/chat">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat con IA
                    </Button>
                  </Link>
                  <Link href="/(protected)/flashcards">
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Estudiar Flashcards
                    </Button>
                  </Link>
                  <Link href="/(protected)/quiz">
                    <Button variant="outline" className="w-full justify-start">
                      <Brain className="w-4 h-4 mr-2" />
                      Realizar Quiz
                    </Button>
                  </Link>
                </div>
              </section>

              {/* Refresh Button */}
              <section className="mt-8 flex justify-end">
                <Button onClick={loadStats} disabled={loading} variant="secondary" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </section>
            </>
          )}
        </>
      )}

      {/* Pomodoro Tab */}
      {activeTab === 'pomodoro' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Técnica Pomodoro - Mejora tu Productividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PomodoroTimer />
          </CardContent>
        </Card>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎮 Juego de Memoria - Entrena tu Mente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemoryGame />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
