"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  AlertTriangle,
  FileText,
  TrendingUp,
  User,
  X,
  Check,
  XCircle,
  Calendar,
  Eye,
  Hash,
  BookOpen,
  Sparkles,
  Code,
  Tag,
  Award,
  Heart,
} from "lucide-react";
import Image from "next/image";
import styles from "@/styles/espacio/espacioPages.module.css";
import { authService } from "@/services/authService";
import { attemptsService } from "@/services/attemptsService";
import { likesService } from "@/services/likesService";
import { AttemptDetailModal } from "@/components/espacio/AttemptDetailModal";
import { StatsHero } from "@/components/espacio/StatsHero";
import { ExamDeck, StatsHeroProps } from "@/types";
import RestringidoForGuest from "@/components/restringidoForGuest";
import { ItemCard, ItemCardSkeleton } from "@/components/espacio/ItemCard";

export default function RendimientoPage() {
  const [attempts, setAttempts] = useState<ExamDeck[]>([]);
  const [attemptStats, setAttemptStats] = useState<StatsHeroProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const [likedAttempts, setLikedAttempts] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGuest(authService.isGuest());
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch { }
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [atts, stats] = await Promise.all([
        attemptsService.getAttempts(),
        attemptsService.getStats(),
      ]);
      setAttempts(atts);
      setAttemptStats(stats);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAttemptClick = useCallback((attempt: any) => {
    setSelectedAttempt(attempt);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedAttempt(null);
  }, []);

  const handleToggleLike = useCallback(async (attemptId: number, examId: number) => {
    try {
      // Toggle like on exam
      await likesService.toggleExamLike(examId);

      // Update local state
      setLikedAttempts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(attemptId)) {
          newSet.delete(attemptId);
        } else {
          newSet.add(attemptId);
        }
        return newSet;
      });
    } catch {
      // Error silently
    }
  }, []);

  if (isGuest) {
    return (
      <>
        <RestringidoForGuest />
      </>
    );
  }

  if(loading) return <ItemCardSkeleton />

  return (
    <>
      <header className={styles.espacioPageHeader}>
        <h1 className={styles.espacioPageTitle}>Mi Rendimiento</h1>
       
      </header>

      {/* Attempt Detail Modal - PRO UI */}
      {selectedAttempt && (
        <AttemptDetailModal attempt={selectedAttempt} onClose={handleCloseDetail} />
      )}

      <div className={styles.tabContent}>
        {attemptStats && attemptStats.totalAttempts > 0 && (
          <StatsHero bestScore={attemptStats.bestScore} totalAttempts={attemptStats.totalAttempts} avgCorrect={attemptStats.avgCorrect} totalQuestions={attemptStats.totalQuestions} />
        )}

        {attempts.length < 1 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <FileText size={40} />
            </div>
            <h3>Tu historial está vacío</h3>
            <p>Empieza a estudiar para ver tus resultados aquí.</p>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {attempts.map((att) => {
              return (
                <ItemCard key={att.id} description={att.description} title={att.title} />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
