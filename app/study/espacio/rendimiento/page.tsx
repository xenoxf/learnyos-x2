"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertTriangle, FileText, TrendingUp, User } from "lucide-react";
import Image from "next/image";
import { apiService } from "@/services/apiService";
import styles from "@/styles/espacio/espacioPages.module.css";

export default function RendimientoPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [attemptStats, setAttemptStats] = useState<{ totalAttempts: number; avgCorrect: number; bestScore: number; totalQuestions: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGuest(apiService.isGuest());
      const userData = localStorage.getItem("user");
      if (userData) {
        try { setUser(JSON.parse(userData)); } catch {}
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
        apiService.getExamAttempts(),
        apiService.getExamAttemptStats(),
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
        <div className={styles.loadingState}><RefreshCw size={24} className={styles.spinner} /><p>Cargando...</p></div>
      </>
    );
  }

  return (
    <>
      <header className={styles.espacioPageHeader}>
        <h1 className={styles.espacioPageTitle}>Mi Rendimiento</h1>
        <div className={styles.userInfo}>
          {user?.picture ? (
            <Image src={user.picture} alt={user.name || "User"} width={32} height={32} className={styles.userAvatar} />
          ) : (
            <div className={styles.userAvatarPlaceholder}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
          )}
          <span className={styles.userName}>{user?.name || "Invitado"}</span>
        </div>
      </header>

      <div className={styles.tabContent}>
        {attemptStats && attemptStats.totalAttempts > 0 && (
          <section className={styles.creditsHero}>
            <TrendingUp size={32} />
            <h2>Estadísticas</h2>
            <p>{attemptStats.totalAttempts} intentos realizados</p>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--primary))" }}>
                  {attemptStats.avgCorrect.toFixed(1)}
                </div>
                <div style={{ fontSize: "0.8rem", color: "hsl(var(--muted-foreground))" }}>Promedio buenas</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--primary))" }}>
                  {attemptStats.bestScore}
                </div>
                <div style={{ fontSize: "0.8rem", color: "hsl(var(--muted-foreground))" }}>Mejor puntaje</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--primary))" }}>
                  {attemptStats.totalQuestions}
                </div>
                <div style={{ fontSize: "0.8rem", color: "hsl(var(--muted-foreground))" }}>Preguntas totales</div>
              </div>
            </div>
          </section>
        )}

        {attempts.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} className={styles.emptyIcon} />
            <p>No tienes intentos registrados aún</p>
            <p style={{ fontSize: "0.85rem" }}>Completa quizzes para ver tu progreso aquí</p>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {attempts.map((att) => {
              const pct = att.totalQuestions > 0 ? Math.round((att.correctAnswers / att.totalQuestions) * 100) : 0;
              return (
                <div key={att.id} className={styles.itemCard}>
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
                    <span className={styles.itemCreator}>{new Date(att.attemptedAt).toLocaleDateString("es-CO")}</span>
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
