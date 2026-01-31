"use client";

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, MessageSquare, Brain, CreditCard, RefreshCw } from 'lucide-react';
import styles from '@/styles/dashboard.module.css';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    notesCount: 0,
    flashcardsCount: 0,
    examsCount: 0,
    messagesCount: 0,
  });
  const [loading, setLoading] = useState(true);
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
    { label: 'Notas', count: stats.notesCount, icon: BookOpen, href: '/notes', color: 'text-blue-500' },
    { label: 'Chat IA', count: stats.messagesCount, icon: MessageSquare, href: '/chat', color: 'text-purple-500' },
    { label: 'Exámenes', count: stats.examsCount, icon: Brain, href: '/quiz', color: 'text-green-500' },
    { label: 'Flashcards', count: stats.flashcardsCount, icon: CreditCard, href: '/flashcards', color: 'text-orange-500' },
  ];

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>¡Bienvenido de nuevo, {user?.name || 'Usuario'}! 👋</h1>
        <p className={styles.subtitle}>Aquí está tu resumen de aprendizaje hoy</p>
      </section>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Cargando tus estadísticas...</p>
        </div>
      ) : (
        <>
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

          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Acciones rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/notes">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ir a Notas
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat con IA
                </Button>
              </Link>
              <Link href="/flashcards">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Estudiar Flashcards
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  Realizar Quiz
                </Button>
              </Link>
            </div>
          </section>

          <section className="mt-8 flex justify-end">
            <Button onClick={loadStats} disabled={loading} variant="secondary" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </section>
        </>
      )}
    </div>
  );
}
