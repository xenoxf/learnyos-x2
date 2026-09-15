"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import styles from "../styles/sidebar.module.css";
import { aiService } from "@/services/aiService";
import { authService } from "@/services/authService";

interface AiStatusWidgetProps {
  collapsed?: boolean;
}

/**
 * Muestra el proveedor de IA activo y su estado en el sidebar principal.
 * Si algo falla (invitado, backend caído), no se renderiza: nunca revienta.
 */
export function AiStatusWidget({ collapsed = false }: AiStatusWidgetProps) {
  const pathname = usePathname();
  const [label, setLabel] = useState<string | null>(null);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (authService.isGuest()) return;
    let alive = true;
    (async () => {
      try {
        const [providers, config] = await Promise.all([
          aiService.getProviders(),
          aiService.getConfig().catch(() => null),
        ]);
        if (!alive) return;
        const saved = config?.provider;
        const active =
          saved === "groq" || saved === "gemini" ? saved : "groq";
        const available =
          providers.find((p) => p.id === active)?.available !== false;
        setLabel(active === "groq" ? "Groq" : "Gemini");
        setReady(available);
      } catch {
        // Silencio total: sin widget antes que un sidebar roto
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!label) return null;

  const isActive =
    pathname === "/study/settings" ||
    pathname?.startsWith("/study/settings/");

  return (
    <div className={styles.navList}>
      {!collapsed && (
        <div className={styles.navLabel} aria-hidden="true">
          MI IA
        </div>
      )}
      <Link
        href="/study/settings?tab=ia"
        className={`
          ${styles.navItem}
          ${isActive ? styles.navItemActive : styles.navItemInactive}
          ${collapsed ? styles.navItemCollapsed : styles.navItemExpanded}
        `}
        title={ready ? `Mi IA: ${label} listo` : `Mi IA: ${label} sin API key`}
        aria-label="Mi IA"
      >
        <div className={styles.navItemIconWrapper}>
          <Sparkles size={20} className={styles.navItemIcon} aria-hidden="true" />
        </div>
        {!collapsed && (
          <span className={styles.navItemText}>Mi IA: {label}</span>
        )}
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            flexShrink: 0,
            backgroundColor: ready ? "#22c55e" : "#f59e0b",
          }}
        />
      </Link>
    </div>
  );
}
