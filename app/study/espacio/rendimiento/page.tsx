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
import { StatsHeroProps } from "@/types";

export default function RendimientoPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
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
        <header className={styles.espacioPageHeader}>
          <h1 className={styles.espacioPageTitle}>Mi Rendimiento</h1>
        </header>
        <div className={styles.guestMessage}>
          <AlertTriangle size={32} />
          <h3>Funcionalidad restringida</h3>
          <p>Inicia sesión para ver tu progreso.</p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <header className={styles.espacioPageHeader}>
          <h1 className={styles.espacioPageTitle}>Mi Rendimiento</h1>
        </header>
        <div className={styles.loadingState}>
          <RefreshCw size={24} className={styles.spinner} />
          <p>Cargando datos maestros...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <header className={styles.espacioPageHeader}>
        <h1 className={styles.espacioPageTitle}>Mi Rendimiento</h1>
        <div className={styles.userInfo}>
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={user.name || "User"}
              width={32}
              height={32}
              className={styles.userAvatar}
            />
          ) : (
            <div className={styles.userAvatarPlaceholder}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <span className={styles.userName}>{user?.name || "Invitado"}</span>
        </div>
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
              const pct = att.totalQuestions > 0 ? Math.round((att.correctAnswers / att.totalQuestions) * 100) : 0;
              const isLiked = likedAttempts.has(att.id);
              return (
                <div
                  key={att.id}
                  className={styles.itemCard}
                  onClick={() => handleAttemptClick(att)}
                >
                  <div className={styles.itemCardBody}>
                    <div className={styles.itemCardHeader}>
                      <h4 className={styles.itemCardTitle}>{att.examTitle}</h4>
                      <button
                        className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLike(att.id, att.examId);
                        }}
                        type="button"
                        aria-label="Like exam"
                      >
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className={styles.itemCardMeta}>
                      <div className={styles.metaScore}>
                        <Award size={14} />
                        <span>{pct}% de éxito</span>
                      </div>
                      <div className={styles.metaDetails}>
                        <span>{att.correctAnswers}/{att.totalQuestions} aciertos</span>
                      </div>
                    </div>
                    <div className={styles.itemCardFooter}>
                      <span className={styles.itemDate}>
                        {new Date(att.attemptedAt).toLocaleDateString("es-CO")}
                      </span>
                      <div className={styles.arrowIcon}>
                        <Eye size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
