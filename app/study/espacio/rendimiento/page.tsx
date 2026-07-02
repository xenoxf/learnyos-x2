"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Calendar,
  Eye,
  Award,
  BarChart3,
} from "lucide-react";
import styles from "@/styles/espacio/espacioPages.module.css";
import { authService } from "@/services/authService";
import { attemptsService } from "@/services/attemptsService";
import { AttemptDetailModal } from "@/components/espacio/AttemptDetailModal";
import { StatsHero } from "@/components/espacio/StatsHero";
import AnalyticsDashboard from "@/components/espacio/AnalyticsDashboard";
import { StatsHeroProps, Attempt } from "@/types";
import RestringidoForGuest from "@/components/restringidoForGuest";
import { ItemCard } from "@/components/espacio/ItemCard";
import SkeletonCard from "@/components/SkeletonCard";

export default function RendimientoPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [attemptStats, setAttemptStats] = useState<StatsHeroProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGuest(authService.isGuest());
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
      <>
        <RestringidoForGuest />
      </>
    );
  }

  if (loading) {
    return (
      <div className={styles.itemsList}>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <>
      <header className={styles.espacioPageHeader}>
        <h1 className={styles.espacioPageTitle}>Mi Rendimiento</h1>
        <button
          className={styles.retryButton}
          onClick={() => setShowAnalytics((p) => !p)}
          type="button"
        >
          <BarChart3 size={16} />
          {showAnalytics ? "Historial" : "Analíticas"}
        </button>
      </header>

      {selectedAttempt && (
        <AttemptDetailModal
          attempt={selectedAttempt}
          onClose={handleCloseDetail}
        />
      )}

      <div className={styles.tabContent}>
        {showAnalytics && (
          <div style={{ marginBottom: "1.5rem" }}>
            <AnalyticsDashboard />
          </div>
        )}

        {!showAnalytics && (
          <>
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
          </>
        )}
      </div>
    </>
  );
}
