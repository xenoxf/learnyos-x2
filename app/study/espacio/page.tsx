"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LogOut,
  ChevronRight,
  Coins,
  TrendingUp,
  Sparkles,
  Layers,
  BadgeCheck,
} from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import ui from "@/styles/espacio/ui.module.css";
import { authService } from "@/services/authService";
import { ThemeToggleSidebr } from "@/components/ThemeToogleSidebr";

const NAV_ROWS = [
  {
    label: "Mis créditos",
    help: "Balance, uso y costos",
    icon: Coins,
    href: "/study/espacio/creditos",
  },
  {
    label: "Mi IA",
    help: "Proveedor del chat y del agente",
    icon: Sparkles,
    href: "/study/espacio/ia",
  },
  {
    label: "Mi rendimiento",
    help: "Estadísticas de estudio",
    icon: TrendingUp,
    href: "/study/espacio/rendimiento",
  },
  {
    label: "Mis funciones",
    help: "Flashcards, notas y quizzes",
    icon: Layers,
    href: "/study/espacio/funciones/flashcards",
  },
];

export default function GeneralPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    picture?: string;
    isGuest?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    setLoading(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      toast.success("Sesión cerrada", "Has cerrado sesión exitosamente");
      router.push("/auth");
    } catch {
      toast.error("Error", "No se pudo cerrar la sesión.");
    }
  }, [router]);

  if (loading) {
    return (
      <div className={ui.page}>
        <div className={ui.stateBox}>
          <p>Cargando…</p>
        </div>
      </div>
    );
  }

  const initial = user?.name?.[0]?.toUpperCase() || "U";
  const isGuest = user?.isGuest === true;

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <h1 className={ui.pageTitle}>Mi espacio</h1>
        <p className={ui.pageDesc}>Tu cuenta y tus ajustes en un solo lugar.</p>
      </header>

      <section className={ui.section} aria-label="Perfil">
        <div className={ui.panel}>
          <div className={ui.row}>
            <div className={ui.profileRow}>
              <div className={ui.avatar} aria-hidden="true">
                {user?.picture ? (
                  <Image
                    src={user.picture}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                  />
                ) : (
                  initial
                )}
              </div>
              <div>
                <p className={ui.profileName}>
                  {user?.name || "Usuario"}{" "}
                  {!isGuest && (
                    <BadgeCheck
                      size={15}
                      style={{
                        display: "inline",
                        verticalAlign: "-2px",
                        color: "hsl(var(--primary))",
                      }}
                      aria-label="Cuenta verificada"
                    />
                  )}
                </p>
                <p className={ui.profileMail}>
                  {user?.email || "Sin correo"}
                </p>
              </div>
            </div>
            <div className={ui.rowControl}>
              {isGuest && (
                <span className={`${ui.pill} ${ui.pillNeutral}`}>
                  <span className={ui.pillDot} />
                  Invitado
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="esp-nav-title">
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle} id="esp-nav-title">
            Secciones
          </h2>
        </div>
        <nav className={ui.panel} aria-label="Secciones de Mi espacio">
          {NAV_ROWS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                className={ui.rowLink}
                onClick={() => router.push(item.href)}
              >
                <div className={ui.rowText}>
                  <span className={ui.rowLabel}>{item.label}</span>
                  <span className={ui.rowHelp}>{item.help}</span>
                </div>
                <div className={ui.rowControl}>
                  <Icon
                    size={16}
                    style={{ color: "hsl(var(--muted-foreground))" }}
                    aria-hidden="true"
                  />
                  <ChevronRight
                    size={16}
                    className={ui.rowChevron}
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </section>

      <section className={ui.section} aria-labelledby="esp-legal-title">
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle} id="esp-legal-title">
            Legal
          </h2>
        </div>
        <div className={ui.panel}>
          <a
            href="/privacy.html"
            className={ui.rowLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={ui.rowText}>
              <span className={ui.rowLabel}>Política de privacidad</span>
              <span className={ui.rowHelp}>Cómo protegemos tus datos</span>
            </div>
            <ChevronRight
              size={16}
              className={ui.rowChevron}
              aria-hidden="true"
            />
          </a>
          <a
            href="/terms.html"
            className={ui.rowLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={ui.rowText}>
              <span className={ui.rowLabel}>Términos de uso</span>
              <span className={ui.rowHelp}>Reglas del servicio</span>
            </div>
            <ChevronRight
              size={16}
              className={ui.rowChevron}
              aria-hidden="true"
            />
          </a>
          <div className={ui.row}>
            <div className={ui.rowText}>
              <span className={ui.rowLabel}>LearnYos</span>
              <span className={ui.rowHelp}>Versión 1.0.0</span>
            </div>
          </div>
        </div>
      </section>

      <div className={ui.btnRow}>
        <button className={ui.btnDanger} onClick={handleLogout} type="button">
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
      <ThemeToggleSidebr isCollapse={false} />
    </div>
  );
}
