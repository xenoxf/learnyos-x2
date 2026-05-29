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
  LogIn,
  BarChart3,
  Info,
  Clock,
  Upload,
} from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/espacio/creditos.module.css";
import { CreditsStatus } from "@/types";
import { creditsService } from "@/services/creditsService";
import { authService } from "@/services/authService";
import Link from "next/link";

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
        <AlertTriangle size={48} />
        <h3>Función Premium</h3>
        <p>
          Para gestionar tus créditos necesitas una cuenta registrada.
        </p>
        <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          Regístrate y recibe créditos gratis cada día.
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

  const breakdownItems = [
    { key: 'examGenerations' as const, label: 'Quizzes generados', icon: BookOpen, color: 'hsl(var(--primary))' },
    { key: 'noteGenerations' as const, label: 'Notas generadas', icon: FileText, color: 'hsl(142, 76%, 36%)' },
    { key: 'flashcardGenerations' as const, label: 'Flashcards generados', icon: CreditCard, color: 'hsl(271, 76%, 53%)' },
    { key: 'chatMessages' as const, label: 'Mensajes de chat', icon: MessageSquare, color: 'hsl(199, 89%, 48%)' },
  ] as const;

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

        <section className={styles.usageCard}>
          <h3>
            <BarChart3 size={18} /> Uso de Hoy
          </h3>
          <div className={styles.usageGrid}>
            {breakdownItems.map(({ key, label, icon: Icon, color }) => {
              const count = credits.breakdown[key];
              const maxBar = Math.max(
                ...breakdownItems.map((i) => credits.breakdown[i.key]),
                1,
              );
              const pct = (count / maxBar) * 100;
              return (
                <div key={key} className={styles.usageItem}>
                  <div className={styles.usageItemHeader}>
                    <div className={styles.usageItemLeft}>
                      <Icon size={16} style={{ color }} />
                      <span className={styles.usageItemLabel}>{label}</span>
                    </div>
                    <span className={styles.usageItemCount}>{count}</span>
                  </div>
                  <div className={styles.usageBar}>
                    <div
                      className={styles.usageBarFill}
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
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
              <span className={styles.creditsCostDetail}>
                +0.5 por pregunta · x1.0/x1.3/x1.7 dificultad
              </span>
            </div>
            <div className={styles.creditsCostItem}>
              <FileText size={18} />
              <span>Generar Notas</span>
              <span className={styles.creditsCostValue}>
                Desde {credits.costs.NOTE_GENERATION}
              </span>
              <span className={styles.creditsCostDetail}>
                x1.0 breve · x1.4 medio · x1.9 detallado
              </span>
            </div>
            <div className={styles.creditsCostItem}>
              <CreditCard size={18} />
              <span>Generar Flashcards</span>
              <span className={styles.creditsCostValue}>
                Desde {credits.costs.FLASHCARD_GENERATION}
              </span>
              <span className={styles.creditsCostDetail}>
                +0.4 por tarjeta
              </span>
            </div>
            <div className={styles.creditsCostItem}>
              <MessageSquare size={18} />
              <span>Chat</span>
              <span className={styles.creditsCostValue}>
                {credits.costs.CHAT_MESSAGE} crédito
              </span>
              <span className={styles.creditsCostDetail}>
                Por mensaje enviado
              </span>
            </div>
          </div>
          <div className={styles.creditsCostsFooter}>
            <Info size={14} />
            <span>Contenido público tiene 50% de descuento</span>
          </div>
        </section>

        <section className={styles.infoCard}>
          <div className={styles.infoCardItem}>
            <Clock size={18} />
            <div>
              <strong>Renovación diaria</strong>
              <p>Tus créditos se reinician cada día a medianoche (00:00).</p>
            </div>
          </div>
          <div className={styles.infoCardItem}>
            <Upload size={18} />
            <div>
              <strong>Subida de archivos</strong>
              <p>Límite de 30 archivos/día en el chat, y 10/día para generar exámenes o flashcards desde archivo.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
