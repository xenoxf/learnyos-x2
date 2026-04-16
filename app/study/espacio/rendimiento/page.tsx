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
  const [likedAttempts, setLikedAttempts] = useState<Set<number>>(new Set());

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
        <div className={styles.modalOverlay} onClick={handleCloseDetail}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "1000px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <Award size={20} className={styles.awardIcon} />
                <h3 className={styles.modalTitle}>Análisis de Desempeño</h3>
              </div>
              <button
                className={styles.modalClose}
                onClick={handleCloseDetail}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.mainGrid}>
                {/* Left: Score Card */}
                <div className={styles.leftColumn}>
                  <div className={styles.heroSection}>
                    <h2 className={styles.attemptExamTitle}>
                      {selectedAttempt.examTitle}
                    </h2>
                    
                    <div className={styles.mainDashboard}>
                      <div className={styles.circularScore}>
                        <span className={styles.percentageBig}>
                          {selectedAttempt.totalQuestions > 0
                            ? Math.round((selectedAttempt.correctAnswers / selectedAttempt.totalQuestions) * 100)
                            : 0}%
                        </span>
                        <span className={styles.percentageSub}>Logrado</span>
                      </div>

                      <div className={styles.quickStatsRow}>
                        <div className={styles.miniStat}>
                          <div className={`${styles.miniIcon} ${styles.bgSuccess}`}>
                            <Check size={16} />
                          </div>
                          <div className={styles.miniText}>
                            <span className={styles.miniVal}>{selectedAttempt.correctAnswers}</span>
                            <span className={styles.miniLab}>Correctas</span>
                          </div>
                        </div>
                        <div className={styles.miniStat}>
                          <div className={`${styles.miniIcon} ${styles.bgError}`}>
                            <XCircle size={16} />
                          </div>
                          <div className={styles.miniText}>
                            <span className={styles.miniVal}>{selectedAttempt.totalQuestions - selectedAttempt.correctAnswers}</span>
                            <span className={styles.miniLab}>Erróneas</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.progressBarLarge}>
                        <div 
                          className={styles.progressFillLarge} 
                          style={{ width: `${(selectedAttempt.correctAnswers / selectedAttempt.totalQuestions) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {selectedAttempt.userAnswers && (
                    <button className={styles.actionBtnFull}>
                      <Eye size={18} />
                      <span>Revisar Pregunta por Pregunta</span>
                    </button>
                  )}
                </div>

                {/* Right: Detailed Metadata */}
                <div className={styles.rightColumn}>
                  <div className={styles.infoDetailsCard}>
                    <div className={styles.detailSection}>
                      <h4 className={styles.detailHeader}>
                        <Hash size={14} /> Identificación
                      </h4>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Código del Examen</span>
                        <span className={styles.codePill}>{selectedAttempt.examCode || "N/A"}</span>
                      </div>
                    </div>

                    <div className={styles.detailSection}>
                      <h4 className={styles.detailHeader}>
                        <BookOpen size={14} /> Academia
                      </h4>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Área de conocimiento</span>
                        <span className={styles.detailValue}>{selectedAttempt.examArea || "General"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Tema específico</span>
                        <span className={styles.detailValue}>{selectedAttempt.examTema || "Varios"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Nivel de complejidad</span>
                        <span className={`${styles.diffValue} ${styles[`text_${selectedAttempt.examDifficulty}`]}`}>
                          {selectedAttempt.examDifficulty || "Media"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.detailSection}>
                      <h4 className={styles.detailHeader}>
                        <User size={14} /> Autoría y Registro
                      </h4>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Creado por</span>
                        <span className={styles.detailValue}>{selectedAttempt.examCreatorName || "Sistema LearnyOS"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Realizado el</span>
                        <span className={styles.detailValue}>
                          {new Date(selectedAttempt.attemptedAt).toLocaleDateString("es-ES", {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tabContent}>
        {attemptStats && attemptStats.totalAttempts > 0 && (
          <section className={styles.statsHero}>
            <div className={styles.statsHeroContent}>
              <div className={styles.statsHeroHeader}>
                <TrendingUp size={28} className={styles.statsIcon} />
                <div>
                  <h2>Estadísticas de Aprendizaje</h2>
                  <p>Has completado {attemptStats.totalAttempts} desafíos</p>
                </div>
              </div>
              <div className={styles.statsSummaryGrid}>
                <div className={styles.summaryBox}>
                  <span className={styles.summaryVal}>{attemptStats.avgCorrect.toFixed(1)}</span>
                  <span className={styles.summaryLab}>Promedio Aciertos</span>
                </div>
                <div className={styles.summaryBox}>
                  <span className={styles.summaryVal}>{attemptStats.bestScore}</span>
                  <span className={styles.summaryLab}>Máximo Puntaje</span>
                </div>
                <div className={styles.summaryBox}>
                  <span className={styles.summaryVal}>{attemptStats.totalQuestions}</span>
                  <span className={styles.summaryLab}>Preguntas Totales</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {attempts.length === 0 ? (
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
