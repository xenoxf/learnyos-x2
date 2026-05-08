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
  Link,
  LogIn,
} from "lucide-react";
import Image from "next/image";
import styles from "@/styles/espacio/espacioPages.module.css";
import { authService } from "@/services/authService";
import { attemptsService } from "@/services/attemptsService";
import { likesService } from "@/services/likesService";
import { AttemptDetailModal } from "@/components/espacio/AttemptDetailModal";
import { StatsHero } from "@/components/espacio/StatsHero";
import { ExamDeck, StatsHeroProps, Attempt } from "@/types";
import RestringidoForGuest from "@/components/restringidoForGuest";
import { ItemCard, ItemCardSkeleton } from "@/components/espacio/ItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonCard from "@/components/SkeletonCard";

export default function RendimientoPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [attemptStats, setAttemptStats] = useState<StatsHeroProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);

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

  const handleAttemptClick = useCallback((attempt: Attempt) => {
    setSelectedAttempt(attempt);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedAttempt(null);
  }, []);

  if (isGuest) {


    return (
      <div className={styles.guestMessage}>
        <AlertTriangle size={48} />
        <h3>Función Premium</h3>
        <p>
          Para gestionar tus flashcards, notas y quizzes necesitas una cuenta
          registrada.
        </p>
        <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          Puedes explorar el contenido público en cada sección.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <Link
            href="/auth"
            className={styles.retryButton}
            onClick={() => setLoading(true)}
          >
            <LogIn size={16} />
            <span>Iniciar Sesión</span>
          </Link>
          <Link
            href="/study/flashcards"
            className={`${styles.retryButton} ${styles.secondaryButton}`}
            onClick={() => setLoading(true)}
          >
            <span>Explorar público</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <SkeletonCard />

    );
  }

  return (
    <>
      <header className={styles.espacioPageHeader}>
        <h1 className={styles.espacioPageTitle}>Mi Rendimiento</h1>
      </header>

      {/* Attempt Detail Modal - PRO UI */}
      {selectedAttempt && (
        <AttemptDetailModal
          attempt={selectedAttempt}
          onClose={handleCloseDetail}
        />
      )}

      <div className={styles.tabContent}>
        {attemptStats && attemptStats.totalAttempts > 0 && (
          <StatsHero
            bestScore={attemptStats.bestScore}
            totalAttempts={attemptStats.totalAttempts}
            avgCorrect={attemptStats.avgCorrect}
            totalQuestions={attemptStats.totalQuestions}
          />
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
              const score = (att.correctAnswers / att.totalQuestions) * 100;
              const variant =
                score >= 80 ? "success" : score >= 60 ? "warning" : "error";

              return (
                <ItemCard
                  key={att.id}
                  title={att.examTitle}
                  description={
                    att.examDescription ||
                    `Completaste este examen con un resultado de ${att.correctAnswers}/${att.totalQuestions} preguntas correctas.`
                  }
                  icon={Award}
                  variant={variant}
                  onClick={() => handleAttemptClick(att)}
                  badges={[`Score: ${score.toFixed(0)}%`]}
                  footerLeft={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Calendar size={12} />
                      <span>
                        {new Date(att.attemptedAt).toLocaleDateString()}
                      </span>
                    </div>
                  }
                  footerRight={
                    <div className={styles.footerAction}>
                      <Eye size={12} />
                      Ver detalle
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
