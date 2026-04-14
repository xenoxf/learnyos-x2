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
              <h3 className={styles.modalTitle}>Detalle del Intento</h3>
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
              <h4
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                }}
              >
                {selectedAttempt.examTitle}
              </h4>

              <div className={styles.modalInfo}>
                <span className={styles.modalInfoLabel}>Usuario</span>
                <span
                  className={styles.modalInfoValue}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {user?.picture ? (
                    <Image
                      src={user.picture}
                      alt=""
                      width={24}
                      height={24}
                      style={{ borderRadius: "50%" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "hsl(var(--primary) / 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  {user?.name || "Usuario"}
                </span>
              </div>

              <div className={styles.modalInfo}>
                <span className={styles.modalInfoLabel}>Fecha</span>
                <span className={styles.modalInfoValue}>
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

              <div className={styles.modalInfo}>
                <span className={styles.modalInfoLabel}>
                  Respuestas correctas
                </span>
                <span className={styles.modalInfoValue}>
                  {selectedAttempt.correctAnswers} /{" "}
                  {selectedAttempt.totalQuestions}
                </span>
              </div>

              <div className={styles.modalInfo}>
                <span className={styles.modalInfoLabel}>Porcentaje</span>
                <span className={styles.modalInfoValue}>
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

              {/* Feedback Visual */}
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "hsl(var(--muted) / 0.15)",
                  borderRadius: "0.75rem",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "hsl(var(--success))",
                      fontWeight: 600,
                    }}
                  >
                    <Check size={18} /> Correctas:{" "}
                    {selectedAttempt.correctAnswers}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "hsl(var(--destructive))",
                      fontWeight: 600,
                    }}
                  >
                    <XCircle size={18} /> Incorrectas:{" "}
                    {selectedAttempt.totalQuestions -
                      selectedAttempt.correctAnswers}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "hsl(var(--muted))",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${selectedAttempt.totalQuestions > 0 ? (selectedAttempt.correctAnswers / selectedAttempt.totalQuestions) * 100 : 0}%`,
                      background:
                        "linear-gradient(90deg, hsl(var(--success)), hsl(var(--success) / 0.7))",
                      borderRadius: "4px",
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
