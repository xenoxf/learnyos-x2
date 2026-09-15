"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wifi, Check, X, AlertTriangle, RefreshCw, LogIn, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/useLocalToast";
import ui from "@/styles/espacio/ui.module.css";
import { aiService } from "@/services/aiService";
import { authService } from "@/services/authService";

interface AiProvider {
  id: string;
  label: string;
  available: boolean;
  models: Array<{ id: string; label: string; tier: string }>;
  supportsVision: boolean;
  defaultModel: string;
}

const PROVIDER_META: Record<string, { name: string; model: string }> = {
  groq: { name: "Groq", model: "GPT-OSS 20B" },
  gemini: { name: "Gemini", model: "Flash Lite" },
};

function pickUsableProvider(provs: AiProvider[], preferred?: string): string {
  const known = preferred === "groq" || preferred === "gemini" ? preferred : "groq";
  const usable = (id: string) =>
    provs.length === 0 ||
    provs.find((p) => p.id === id)?.available !== false;
  if (usable(known)) return known;
  return provs.find((p) => p.available)?.id || known;
}

export default function EspacioIaPage() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [selected, setSelected] = useState("groq");
  const [dirty, setDirty] = useState(false);
  const [test, setTest] = useState<{
    ok: boolean;
    model?: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setIsGuest(authService.isGuest());
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const [provs, cfg] = await Promise.all([
        aiService.getProviders(),
        aiService.getConfig().catch(() => null),
      ]);
      setProviders(provs);
      setSelected(pickUsableProvider(provs, cfg?.provider));
      setDirty(false);
      setTest(null);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) load();
    else setLoading(false);
  }, [isGuest, load]);

  const choose = (id: string) => {
    setSelected(id);
    setDirty(true);
    setTest(null);
  };

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await aiService.updateConfig({
        provider: selected,
        mode: "ahorro",
        fallbackEnabled: true,
      });
      setDirty(false);
      toast.success("Guardado", "Proveedor actualizado");
    } catch {
      toast.error("Error", "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }, [selected]);

  const handleTest = useCallback(async () => {
    try {
      setTesting(true);
      setTest(null);
      const res = await aiService.testConnection({
        provider: selected,
        model:
          selected === "gemini"
            ? "gemini-2.5-flash-lite"
            : "openai/gpt-oss-20b",
      });
      setTest(res);
    } catch {
      setTest({ ok: false, error: "No se pudo completar la prueba" });
    } finally {
      setTesting(false);
    }
  }, [selected]);

  if (isGuest) {
    return (
      <div className={ui.page}>
        <div className={ui.stateBox}>
          <AlertTriangle size={28} className={ui.stateIconDanger} />
          <h3>Inicia sesión para configurar tu IA</h3>
          <p>El proveedor de IA es una opción de tu cuenta.</p>
          <Link href="/auth" className={ui.btnPrimary}>
            <LogIn size={16} />
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={ui.page}>
        <header className={ui.pageHeader}>
          <h1 className={ui.pageTitle}>Mi IA</h1>
        </header>
        <div className={ui.stateBox}>
          <RefreshCw size={20} className={ui.spinner} />
          <p>Cargando proveedores…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={ui.page}>
        <header className={ui.pageHeader}>
          <h1 className={ui.pageTitle}>Mi IA</h1>
        </header>
        <div className={ui.stateBox}>
          <AlertTriangle size={28} className={ui.stateIconDanger} />
          <h3>No se pudo cargar</h3>
          <p>Revisa que el backend esté en línea e inténtalo de nuevo.</p>
          <button className={ui.btnSecondary} onClick={load} type="button">
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const noneAvailable =
    providers.length > 0 && providers.every((p) => p.available === false);

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <h1 className={ui.pageTitle}>Mi IA</h1>
        <p className={ui.pageDesc}>
          Qué modelo responde en el chat y genera tu contenido. Siempre en
          modo ahorro.
        </p>
      </header>

      <section className={ui.section} aria-labelledby="ia-prov-title">
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle} id="ia-prov-title">
            Proveedor
          </h2>
          <p className={ui.sectionHelp}>
            Si el elegido no tiene clave o falla, se usa el otro sin que
            tengas que hacer nada.
          </p>
        </div>
        <div className={ui.panel}>
          <div className={ui.row}>
            <div className={ui.rowText}>
              <span className={ui.rowLabel}>Modelo activo</span>
              <span className={ui.rowHelp}>
                Chat, agente, títulos y generación de contenido.
              </span>
            </div>
            <div className={ui.rowControl}>
              <div
                className={ui.segmented}
                role="group"
                aria-label="Proveedor de IA"
              >
                {providers.map((p) => {
                  const meta = PROVIDER_META[p.id] ?? {
                    name: p.label,
                    model: "",
                  };
                  const active = selected === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={ui.segment}
                      aria-pressed={active}
                      onClick={() => choose(p.id)}
                    >
                      <span
                        className={ui.pillDot}
                        style={{
                          background: p.available
                            ? "hsl(142 60% 40%)"
                            : "hsl(38 90% 48%)",
                        }}
                        aria-hidden="true"
                      />
                      <span>
                        <span className={ui.segmentName}>{meta.name}</span>
                        {meta.model && (
                          <>
                            {" · "}
                            <span className={ui.segmentSub}>{meta.model}</span>
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={ui.row}>
            <div className={ui.rowText}>
              <span className={ui.rowLabel}>Estado</span>
              <span className={ui.rowHelp}>
                {noneAvailable
                  ? "Ningún proveedor tiene clave en el backend."
                  : "Disponibilidad según las claves del backend."}
              </span>
            </div>
            <div className={ui.rowControl}>
              {noneAvailable ? (
                <span className={`${ui.pill} ${ui.pillWarn}`}>
                  <span className={ui.pillDot} />
                  Sin claves
                </span>
              ) : (
                <span className={`${ui.pill} ${ui.pillOk}`}>
                  <span className={ui.pillDot} />
                  Operativo
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="ia-mode-title">
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle} id="ia-mode-title">
            Consumo
          </h2>
        </div>
        <div className={ui.panel}>
          <div className={ui.row}>
            <div className={ui.rowText}>
              <span className={ui.rowLabel}>Modo ahorro</span>
              <span className={ui.rowHelp}>
                Modelos baratos y rápidos. No se puede desactivar.
              </span>
            </div>
            <div className={ui.rowControl}>
              <span className={`${ui.pill} ${ui.pillNeutral}`}>
                <span className={ui.pillDot} />
                Siempre activo
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={ui.btnRow}>
        <button
          className={ui.btnPrimary}
          onClick={handleSave}
          disabled={saving || !dirty}
          type="button"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          className={ui.btnSecondary}
          onClick={handleTest}
          disabled={testing}
          type="button"
        >
          <Wifi size={16} />
          {testing ? "Probando…" : "Probar conexión"}
        </button>
      </div>

      {test && (
        <p className={ui.note} role="status">
          {test.ok ? (
            <Check size={15} style={{ color: "hsl(142 60% 40%)" }} />
          ) : (
            <X size={15} style={{ color: "hsl(var(--destructive))" }} />
          )}
          {test.ok
            ? `${PROVIDER_META[selected]?.name ?? selected} responde (${test.latencyMs} ms).`
            : (test.error ?? "La prueba falló.")}
        </p>
      )}

      <p className={ui.note}>
        <Info size={15} />
        Lo que el agente crea (exámenes, flashcards, notas) se guarda en tu
        biblioteca aunque cambies de proveedor después.
      </p>
    </div>
  );
}
