"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Coins,
  Sparkles,
  TrendingUp,
  Zap,
  BookOpen,
  FileText,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/espacio/creditos.module.css";
import { CreditsStatus } from "@/types";
import { creditsService } from "@/services/creditsService";
import { authService } from "@/services/authService";

export default function EspacioCreditosContent() {
  const [credits, setCredits] = useState<CreditsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGuest(authService.isGuest());
    }
  }, []);

  const loadCredits = useCallback(async () => {
    try {
      setLoading(true);
      const status = await creditsService.getStatus();
      setCredits(status);
    } catch {
      toast.error("Error", "No se pudieron cargar los créditos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) loadCredits();
    else setLoading(false);
  }, [isGuest, loadCredits]);

  if (isGuest) {
    return (
      <>
        <header className={styles.espacioPageHeader}>
          <h1 className={styles.espacioPageTitle}>Mis Créditos</h1>
        </header>
        <div className={styles.guestMessage}>
          <AlertTriangle size={32} />
          <h3>Funcionalidad restringida</h3>
          <p>Inicia sesión para acceder a tus créditos.</p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <header className={styles.espacioPageHeader}>
          <h1 className={styles.espacioPageTitle}>Mis Créditos</h1>
        </header>
        <div className={styles.loadingState}>
          <RefreshCw size={24} className={styles.spinner} />
          <p>Cargando...</p>
        </div>
      </>
    );
  }

  if (!credits) {
    return (
      <>
        <header className={styles.espacioPageHeader}>
          <h1 className={styles.espacioPageTitle}>Mis Créditos</h1>
        </header>
        <div className={styles.errorState}>
          <AlertTriangle size={32} />
          <p>No se pudieron cargar los créditos</p>
          <button
            className={styles.retryButton}
            onClick={loadCredits}
            type="button"
          >
            <RefreshCw size={16} />
            <span>Reintentar</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <header className={styles.espacioPageHeader}>
        <h1 className={styles.espacioPageTitle}>Mis Créditos</h1>
      </header>

      <div className={styles.tabContent}>
        <section className={styles.creditsHero}>
          <Sparkles size={32} />
          <h2>Tus Créditos Diarios</h2>
          <p>Se renuevan automáticamente cada día a medianoche</p>
        </section>

        <section className={styles.creditsMainCard}>
          <div className={styles.creditsMainHeader}>
            <Coins size={28} />
            <div>
              <span className={styles.creditsMainLabel}>Disponibles</span>
              <div className={styles.creditsMainNumbers}>
                <span className={styles.creditsRemaining}>
                  {credits.remaining}
                </span>
                <span className={styles.creditsSeparator}>/</span>
                <span className={styles.creditsTotal}>{credits.total}</span>
              </div>
            </div>
          </div>
          <div className={styles.creditsProgressBar}>
            <div
              className={styles.creditsProgressFill}
              style={{ width: `${Math.min(credits.percentageUsed, 100)}%` }}
            />
          </div>
          <div className={styles.creditsPercentage}>
            <TrendingUp size={16} />
            <span>{credits.percentageUsed}% usado hoy</span>
          </div>
        </section>

        <section className={styles.creditsCostsCard}>
          <h3>
            <Zap size={18} /> Costo Base por Acción
          </h3>
          <div className={styles.creditsCostsGrid}>
            <div className={styles.creditsCostItem}>
              <BookOpen size={18} />
              <span>Generar Quiz</span>
              <span className={styles.creditsCostValue}>
                Desde {credits.costs.EXAM_GENERATION}
              </span>
            </div>
            <div className={styles.creditsCostItem}>
              <FileText size={18} />
              <span>Generar Notas</span>
              <span className={styles.creditsCostValue}>
                Desde {credits.costs.NOTE_GENERATION}
              </span>
            </div>
            <div className={styles.creditsCostItem}>
              <CreditCard size={18} />
              <span>Generar Flashcards</span>
              <span className={styles.creditsCostValue}>
                Desde {credits.costs.FLASHCARD_GENERATION}
              </span>
            </div>
            <div className={styles.creditsCostItem}>
              <MessageSquare size={18} />
              <span>Chat</span>
              <span className={styles.creditsCostValue}>
                {credits.costs.CHAT_MESSAGE} crédito
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
