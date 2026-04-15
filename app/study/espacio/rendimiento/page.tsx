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
  Hash,
  BookOpen,
  Sparkles,
  Code,
  Tag,
} from "lucide-react";
import Image from "next/image";
import styles from "@/styles/espacio/espacioPages.module.css";
import { authService } from "@/services/authService";
import { attemptsService } from "@/services/attemptsService";

export default function RendimientoPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [attemptStats, setAttemptStats] = useState<{
    totalAttempts: number;
    avgCorrect: number;
    bestScore: number;
    totalQuestions: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGuest(authService.isGuest());
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {}
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

  if (isGuest) {
    return (
      <>
        <header className={styles.espacioPageHeader}>
          <h1 className={styles.espacioPageTitle}>Mi Rendimiento</h1>
        </header>
        <div className={styles.guestMessage}>
          <AlertTriangle size={32} />
          <h3>Funcionalidad restringida</h3>
          <p>Inicia sesión para ver tu rendimiento.</p>
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
          <p>Cargando...</p>
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

      {/* Attempt Detail Modal */}
      {selectedAttempt && (
        <div className={styles.modalOverlay} onClick={handleCloseDetail}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <h3 className={styles.modalTitle}>Detalle del Intento</h3>
              </div>
              <button
                className={styles.modalClose}
                onClick={handleCloseDetail}
                type="button"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Exam Title */}
              <h4 className={styles.attemptExamTitle}>
                {selectedAttempt.examTitle}
              </h4>

              {/* Quick Stats Card */}
              <div className={styles.attemptQuickStats}>
                <div className={styles.quickStat}>
                  <div className={styles.quickStatIcon}>
                    <Check size={20} />
                  </div>
                  <div className={styles.quickStatContent}>
                    <span className={styles.quickStatLabel}>Correctas</span>
                    <span className={styles.quickStatValue}>
                      {selectedAttempt.correctAnswers}/{selectedAttempt.totalQuestions}
                    </span>
                  </div>
                </div>
                <div className={styles.quickStat}>
                  <div className={styles.quickStatIcon}>
                    <TrendingUp size={20} />
                  </div>
                  <div className={styles.quickStatContent}>
                    <span className={styles.quickStatLabel}>Porcentaje</span>
                    <span className={styles.quickStatValue}>
                      {selectedAttempt.totalQuestions > 0
                        ? Math.round(
                            (selectedAttempt.correctAnswers /
                              selectedAttempt.totalQuestions) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Exam Metadata Grid */}
              {(selectedAttempt.examCode || selectedAttempt.examType || selectedAttempt.examDifficulty || selectedAttempt.examArea) && (
                <div className={styles.attemptMetadataCard}>
                  <div className={styles.attemptMetadataHeader}>
                    <Hash size={16} />
                    <span>Información del Examen</span>
                  </div>
                  <div className={styles.attemptMetadataGrid}>
                    {selectedAttempt.examCode && (
                      <div className={styles.attemptMetadataItem}>
                        <div className={styles.attemptMetadataIcon}>
                          <Code size={16} />
                        </div>
                        <div className={styles.attemptMetadataText}>
                          <span className={styles.attemptMetadataLabel}>Código</span>
                          <span className={styles.attemptMetadataCode}>{selectedAttempt.examCode}</span>
                        </div>
                      </div>
                    )}
                    {selectedAttempt.examType && (
                      <div className={styles.attemptMetadataItem}>
                        <div className={styles.attemptMetadataIcon}>
                          <BookOpen size={16} />
                        </div>
                        <div className={styles.attemptMetadataText}>
                          <span className={styles.attemptMetadataLabel}>Tipo</span>
                          <span className={`${styles.attemptMetadataValue} ${styles[`type_${selectedAttempt.examType}`]}`}>
                            {selectedAttempt.examType === 'icfes' ? 'ICFES' : 'Quiz'}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedAttempt.examDifficulty && (
                      <div className={styles.attemptMetadataItem}>
                        <div className={styles.attemptMetadataIcon}>
                          <Sparkles size={16} />
                        </div>
                        <div className={styles.attemptMetadataText}>
                          <span className={styles.attemptMetadataLabel}>Dificultad</span>
                          <span className={`${styles.attemptMetadataValue} ${styles[`difficulty_${selectedAttempt.examDifficulty}`]}`}>
                            {selectedAttempt.examDifficulty === 'easy' ? 'Fácil' : selectedAttempt.examDifficulty === 'medium' ? 'Medio' : 'Difícil'}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedAttempt.examArea && (
                      <div className={styles.attemptMetadataItem}>
                        <div className={styles.attemptMetadataIcon}>
                          <Tag size={16} />
                        </div>
                        <div className={styles.attemptMetadataText}>
                          <span className={styles.attemptMetadataLabel}>Área</span>
                          <span className={styles.attemptMetadataValue}>{selectedAttempt.examArea}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User & Date Info */}
              <div className={styles.attemptInfoGrid}>
                <div className={styles.attemptInfo}>
                  <div className={styles.attemptInfoIcon}>
                    <User size={16} />
                  </div>
                  <div className={styles.attemptInfoContent}>
                    <span className={styles.attemptInfoLabel}>Usuario</span>
                    <span className={styles.attemptInfoValue}>
                      {user?.picture ? (
                        <Image
                          src={user.picture}
                          alt=""
                          width={24}
                          height={24}
                          className={styles.attemptUserAvatar}
                        />
                      ) : (
                        <div className={styles.attemptUserAvatarPlaceholder}>
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      {user?.name || "Usuario"}
                    </span>
                  </div>
                </div>

                <div className={styles.attemptInfo}>
                  <div className={styles.attemptInfoIcon}>
                    <Calendar size={16} />
                  </div>
                  <div className={styles.attemptInfoContent}>
                    <span className={styles.attemptInfoLabel}>Fecha</span>
                    <span className={styles.attemptInfoValue}>
                      {new Date(selectedAttempt.attemptedAt).toLocaleDateString(
                        "es-CO",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Visual */}
              <div className={styles.attemptPerformance}>
                <div className={styles.performanceHeader}>
                  <span className={styles.performanceCorrect}>
                    <Check size={16} /> {selectedAttempt.correctAnswers}
                  </span>
                  <span className={styles.performanceIncorrect}>
                    <XCircle size={16} /> {selectedAttempt.totalQuestions - selectedAttempt.correctAnswers}
                  </span>
                </div>
                <div className={styles.performanceBar}>
                  <div
                    className={styles.performanceFill}
                    style={{
                      width: `${selectedAttempt.totalQuestions > 0 ? (selectedAttempt.correctAnswers / selectedAttempt.totalQuestions) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tabContent}>
        {attemptStats && attemptStats.totalAttempts > 0 && (
          <section className={styles.creditsHero}>
            <TrendingUp size={32} />
            <h2>Estadísticas</h2>
            <p>{attemptStats.totalAttempts} intentos realizados</p>
            <div
              style={{
                display: "flex",
                gap: "2rem",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "hsl(var(--primary))",
                  }}
                >
                  {attemptStats.avgCorrect.toFixed(1)}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  Promedio buenas
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "hsl(var(--primary))",
                  }}
                >
                  {attemptStats.bestScore}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  Mejor puntaje
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "hsl(var(--primary))",
                  }}
                >
                  {attemptStats.totalQuestions}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  Preguntas totales
                </div>
              </div>
            </div>
          </section>
        )}

        {attempts.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} className={styles.emptyIcon} />
            <p>No tienes intentos registrados aún</p>
            <p style={{ fontSize: "0.85rem" }}>
              Completa quizzes para ver tu progreso aquí
            </p>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {attempts.map((att) => {
              const pct =
                att.totalQuestions > 0
                  ? Math.round((att.correctAnswers / att.totalQuestions) * 100)
                  : 0;
              return (
                <div
                  key={att.id}
                  className={styles.itemCard}
                  onClick={() => handleAttemptClick(att)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAttemptClick(att);
                    }
                  }}
                >
                  <div className={styles.itemCardHeader}>
                    <h4 className={styles.itemCardTitle}>{att.examTitle}</h4>
                  </div>
                  <div className={styles.itemCardMeta}>
                    <span className={styles.itemBadge}>
                      Buenas {att.correctAnswers}/{att.totalQuestions}
                    </span>
                    <span className={styles.diffBadge}>{pct}%</span>
                  </div>
                  <div className={styles.itemCardFooter}>
                    <span className={styles.itemCreator}>
                      {new Date(att.attemptedAt).toLocaleDateString("es-CO")}
                    </span>
                    <User size={12} style={{ opacity: 0.5 }} />
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
