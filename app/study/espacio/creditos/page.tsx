"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, RefreshCw, LogIn, Info } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import ui from "@/styles/espacio/ui.module.css";
import { CreditsStatus } from "@/types";
import { creditsService } from "@/services/creditsService";
import { authService } from "@/services/authService";
import Link from "next/link";

const USAGE_ROWS = [
  { key: "examGenerations", label: "Quizzes generados" },
  { key: "noteGenerations", label: "Notas generadas" },
  { key: "flashcardGenerations", label: "Flashcards generadas" },
  { key: "chatMessages", label: "Mensajes de chat" },
] as const;

const COST_ROWS: Array<{
  label: string;
  help: string;
  value: (c: CreditsStatus) => string;
}> = [
  {
    label: "Generar quiz",
    help: "+0,5 por pregunta · ×1,0 / ×1,3 / ×1,7 según dificultad",
    value: (c) => `desde ${c.costs.EXAM_GENERATION}`,
  },
  {
    label: "Generar notas",
    help: "×1,0 breve · ×1,4 medio · ×1,9 detallado",
    value: (c) => `desde ${c.costs.NOTE_GENERATION}`,
  },
  {
    label: "Generar flashcards",
    help: "+0,4 por tarjeta",
    value: (c) => `desde ${c.costs.FLASHCARD_GENERATION}`,
  },
  {
    label: "Mensaje de chat",
    help: "Costo fijo por mensaje enviado",
    value: (c) => `${c.costs.CHAT_MESSAGE} crédito`,
  },
];

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
      <div className={ui.page}>
        <div className={ui.stateBox}>
          <AlertTriangle size={28} className={ui.stateIconDanger} />
          <h3>Los créditos son de tu cuenta</h3>
          <p>Regístrate y recibe créditos gratis cada día.</p>
          <div className={ui.btnRow} style={{ justifyContent: "center" }}>
            <Link href="/auth" className={ui.btnPrimary}>
              <LogIn size={16} />
              Iniciar sesión
            </Link>
            <Link href="/study/flashcards" className={ui.btnSecondary}>
              Explorar público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !credits) {
    return (
      <div className={ui.page}>
        <header className={ui.pageHeader}>
          <h1 className={ui.pageTitle}>Mis créditos</h1>
        </header>
        {loading ? (
          <div className={ui.stateBox}>
            <RefreshCw size={20} className={ui.spinner} />
            <p>Cargando…</p>
          </div>
        ) : (
          <div className={ui.stateBox}>
            <AlertTriangle size={28} className={ui.stateIconDanger} />
            <h3>No se pudo cargar</h3>
            <p>Inténtalo de nuevo en un momento.</p>
            <button className={ui.btnSecondary} onClick={loadCredits} type="button">
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        )}
      </div>
    );
  }

  const maxUse = Math.max(
    ...USAGE_ROWS.map((r) => credits.breakdown[r.key]),
    1,
  );

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <h1 className={ui.pageTitle}>Mis créditos</h1>
        <p className={ui.pageDesc}>
          Gratuitos y se renuevan cada día a medianoche. No se acumulan.
        </p>
      </header>

      <section className={ui.section} aria-labelledby="cr-bal-title">
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle} id="cr-bal-title">
            Balance de hoy
          </h2>
        </div>
        <div className={ui.panel}>
          <div className={ui.row}>
            <div className={ui.statRow}>
              <div className={ui.stat}>
                <span className={ui.statValue}>{credits.remaining}</span>
                <span className={ui.statLabel}>
                  disponibles de {credits.total}
                </span>
              </div>
              <div className={ui.stat}>
                <span className={ui.statValue}>{credits.percentageUsed}%</span>
                <span className={ui.statLabel}>usado hoy</span>
              </div>
            </div>
          </div>
          <div className={ui.row}>
            <div style={{ flex: 1 }}>
              <div className={ui.meter}>
                <div
                  className={ui.meterFill}
                  style={{
                    width: `${Math.min(credits.percentageUsed, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="cr-use-title">
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle} id="cr-use-title">
            Uso de hoy
          </h2>
        </div>
        <div className={ui.panel}>
          {USAGE_ROWS.map((r) => {
            const count = credits.breakdown[r.key];
            return (
              <div className={ui.row} key={r.key}>
                <div className={ui.rowText}>
                  <span className={ui.rowLabel}>{r.label}</span>
                </div>
                <div
                  className={ui.rowControl}
                  style={{ gap: 12, minWidth: 120, justifyContent: "flex-end" }}
                >
                  <div className={ui.meter} style={{ width: 72 }}>
                    <div
                      className={ui.meterFill}
                      style={{ width: `${(count / maxUse) * 100}%` }}
                    />
                  </div>
                  <span className={ui.mono} style={{ fontSize: 14 }}>
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={ui.section} aria-labelledby="cr-cost-title">
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle} id="cr-cost-title">
            Costos
          </h2>
          <p className={ui.sectionHelp}>
            El costo final se calcula según cantidad, dificultad y longitud
            del tema.
          </p>
        </div>
        <div className={ui.panel}>
          {COST_ROWS.map((r) => (
            <div className={ui.row} key={r.label}>
              <div className={ui.rowText}>
                <span className={ui.rowLabel}>{r.label}</span>
                <span className={ui.rowHelp}>{r.help}</span>
              </div>
              <div className={ui.rowControl}>
                <span className={ui.mono} style={{ fontSize: 13.5 }}>
                  {r.value(credits)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className={ui.note}>
        <Info size={15} />
        El contenido público tiene 50% de descuento. Subir archivos al chat:
        30/día; generar desde archivo: 10/día.
      </p>
    </div>
  );
}
