"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Wifi,
  Zap,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  LogIn,
  Info,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/espacio/ia.module.css";
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

const pickUsableProvider = (provs: AiProvider[], preferred?: string): string => {
  const known = preferred === "groq" || preferred === "gemini" ? preferred : "groq";
  const usable = (id: string) =>
    provs.length === 0 ||
    provs.find((p) => p.id === id)?.available !== false;
  if (usable(known)) return known;
  // El guardado no tiene keys: mostrar el primero disponible (el backend
  // igual hace fallback solo, esto es solo para la UI)
  return provs.find((p) => p.available)?.id || known;
};

export default function EspacioIaPage() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("groq");
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    model?: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGuest(authService.isGuest());
    }
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
      setSelectedProvider(pickUsableProvider(provs, cfg?.provider));
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

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await aiService.updateConfig({
        provider: selectedProvider,
        mode: "ahorro",
        fallbackEnabled: true,
      });
      toast.success("Guardado", "Configuración de IA actualizada");
    } catch {
      toast.error("Error", "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  }, [selectedProvider]);

  const handleTest = useCallback(async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await aiService.testConnection({
        provider: selectedProvider,
        model:
          selectedProvider === "gemini"
            ? "gemini-2.5-flash-lite"
            : "openai/gpt-oss-20b",
      });
      setTestResult(res);
      if (res.ok) {
        toast.success("Conexión", `${res.model} responde correctamente`);
      } else {
        toast.error("Error", res.error || "Conexión fallida");
      }
    } catch {
      toast.error("Error", "Error al probar conexión");
    } finally {
      setTesting(false);
    }
  }, [selectedProvider]);

  if (isGuest) {
    return (
      <div className={styles.guestMessage}>
        <AlertTriangle size={48} />
        <h3>Función Premium</h3>
        <p>Para configurar tu IA necesitas una cuenta registrada.</p>
        <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          Regístrate y recibe créditos gratis cada día.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <Link href="/auth" className={styles.retryButton}>
            <LogIn size={16} />
            <span>Iniciar Sesión</span>
          </Link>
          <Link
            href="/study/flashcards"
            className={`${styles.retryButton} ${styles.secondaryButton}`}
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
          <h1 className={styles.espacioPageTitle}>Mi IA</h1>
        </header>
        <div className={styles.loadingState}>
          <RefreshCw size={24} className={styles.spinner} />
          <p>Cargando proveedores...</p>
        </div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <header className={styles.espacioPageHeader}>
          <h1 className={styles.espacioPageTitle}>Mi IA</h1>
        </header>
        <div className={styles.errorState}>
          <AlertTriangle size={32} />
          <p>No se pudieron cargar los proveedores</p>
          <button className={styles.retryButton} onClick={load} type="button">
            <RefreshCw size={16} />
            <span>Reintentar</span>
          </button>
        </div>
      </>
    );
  }

  const noneAvailable =
    providers.length > 0 && providers.every((p) => p.available === false);

  return (
    <>
      <header className={styles.espacioPageHeader}>
        <h1 className={styles.espacioPageTitle}>Mi IA</h1>
      </header>

      <div className={styles.tabContent}>
        <section className={styles.iaHero}>
          <Sparkles size={32} />
          <h2>Configuración de IA</h2>
          <p>
            Siempre modo ahorro activo. Si un proveedor no tiene key o falla,
            se usa el otro automáticamente.
          </p>
        </section>

        <section className={styles.iaCard}>
          <h3>
            <Wifi size={20} />
            Proveedor de IA
          </h3>
          {noneAvailable && (
            <p className={styles.iaWarning}>
              ⚠️ Ningún proveedor tiene API key en el backend. El chat y el
              agente no pueden responder hasta configurarla.
            </p>
          )}
          <div className={styles.iaGrid}>
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProvider(p.id)}
                className={`${styles.iaProvider} ${selectedProvider === p.id ? styles.iaProviderSelected : ""}`}
                aria-pressed={selectedProvider === p.id}
              >
                <span className={styles.iaProviderName}>
                  {p.id === "groq" ? "🦎 Groq" : "🟢 Gemini"}
                </span>
                <span className={styles.iaProviderModels}>
                  {(p.models || []).map((m) => m.label).join(" · ")}
                </span>
                <span
                  className={`${styles.iaBadge} ${p.available === false ? styles.iaBadgeMissing : styles.iaBadgeOk}`}
                >
                  {p.available === false ? "sin API key" : "listo"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.iaCard}>
          <h3>
            <Zap size={20} />
            Modo de ahorro
          </h3>
          <p className={styles.iaNote}>
            Siempre activo. Usa los modelos más rápidos y baratos (GPT-OSS 20B
            en Groq, Flash Lite en Gemini).
          </p>
          <span className={styles.iaAhorroPill}>
            <Check size={16} />
            Ahorro siempre activo
          </span>
        </section>

        <div className={styles.iaActions}>
          <button
            className={styles.retryButton}
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            className={`${styles.retryButton} ${styles.secondaryButton}`}
            onClick={handleTest}
            disabled={testing}
            type="button"
          >
            <Wifi size={16} />
            <span>{testing ? "Probando..." : "Probar conexión"}</span>
          </button>
        </div>

        {testResult && (
          <section className={styles.iaCard}>
            <h3>
              {testResult.ok ? <Check size={20} /> : <X size={20} />}
              {testResult.ok ? "Conexión exitosa" : "Conexión fallida"}
            </h3>
            <div
              className={`${styles.iaResult} ${testResult.ok ? styles.iaResultOk : styles.iaResultFail}`}
            >
              <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <p>
                {testResult.ok
                  ? `✅ ${testResult.model} respondió en ${testResult.latencyMs}ms`
                  : `❌ ${testResult.error || "Error desconocido"}`}
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
