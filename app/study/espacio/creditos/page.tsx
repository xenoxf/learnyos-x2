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
      <div className={styles.guestMessage}>
        <AlertTriangle size={48} className={styles.warningIcon} />
        <h2>Acceso Restringido</h2>
        <p>Inicia sesión con tu cuenta para gestionar y ver tus créditos diarios.</p>
        <button className={styles.retryButton} onClick={() => window.location.href = "/auth"}>
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <RefreshCw size={32} className={styles.spinner} />
        <p>Sincronizando tus créditos...</p>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className={styles.errorState}>
        <AlertTriangle size={48} />
        <h3>Ups, algo salió mal</h3>
        <p>No pudimos recuperar tu información de créditos en este momento.</p>
        <button className={styles.retryButton} onClick={loadCredits}>
          <RefreshCw size={18} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.creditsLayout}>
      <header className={styles.creditsHeader}>
        <div>
          <h1 className={styles.creditsTitle}>Mis Créditos</h1>
          <p className={styles.creditsSubtitle}>Tu balance de energía IA para hoy</p>
        </div>
        <div className={styles.creditsBadge}>
          <Sparkles size={16} />
          <span>Renovación Diaria</span>
        </div>
      </header>

      <div className={styles.creditsGrid}>
        {/* Left Column: Status */}
        <div className={styles.statusColumn}>
          <section className={styles.mainStatusCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconBox}>
                <Coins size={24} />
              </div>
              <div className={styles.cardTitleBox}>
                <h3>Créditos Disponibles</h3>
                <p>Balance actual del día</p>
              </div>
            </div>

            <div className={styles.numbersDisplay}>
              <span className={styles.remainingValue}>{credits.remaining}</span>
              <span className={styles.totalDivider}>/</span>
              <span className={styles.totalValue}>{credits.total}</span>
            </div>

            <div className={styles.progressContainer}>
              <div className={styles.progressBarWrapper}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${Math.max(5, Math.min(credits.percentageUsed, 100))}%` }}
                />
              </div>
              <div className={styles.progressLabel}>
                <TrendingUp size={14} />
                <span>Has consumido el {credits.percentageUsed}% de tu cupo</span>
              </div>
            </div>

            <div className={styles.infoAlert}>
              <Zap size={14} />
              <p>Los créditos se reinician cada día a las 00:00 UTC.</p>
            </div>
          </section>
        </div>

        {/* Right Column: Costs */}
        <div className={styles.costsColumn}>
          <section className={styles.costsListCard}>
            <h3 className={styles.costsTitle}>Costos por Acción</h3>
            <div className={styles.costsItemsGrid}>
              <div className={styles.costItem}>
                <div className={styles.costIcon}><BookOpen size={18} /></div>
                <div className={styles.costDetails}>
                  <span className={styles.costLabel}>Generar Examen</span>
                  <span className={styles.costPrice}>Desde {credits.costs.EXAM_GENERATION} créd.</span>
                </div>
              </div>

              <div className={styles.costItem}>
                <div className={styles.costIcon}><FileText size={18} /></div>
                <div className={styles.costDetails}>
                  <span className={styles.costLabel}>Generar Notas</span>
                  <span className={styles.costPrice}>Desde {credits.costs.NOTE_GENERATION} créd.</span>
                </div>
              </div>

              <div className={styles.costItem}>
                <div className={styles.costIcon}><CreditCard size={18} /></div>
                <div className={styles.costDetails}>
                  <span className={styles.costLabel}>Generar Flashcards</span>
                  <span className={styles.costPrice}>Desde {credits.costs.FLASHCARD_GENERATION} créd.</span>
                </div>
              </div>

              <div className={styles.costItem}>
                <div className={styles.costIcon}><MessageSquare size={18} /></div>
                <div className={styles.costDetails}>
                  <span className={styles.costLabel}>Chat con IA</span>
                  <span className={styles.costPrice}>{credits.costs.CHAT_MESSAGE} crédito / msg</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
