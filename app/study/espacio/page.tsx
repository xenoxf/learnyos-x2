"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Mail,
  LogOut,
  Info,
  Shield,
  FileText,
  Loader2,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/espacio/general.module.css";
import { authService } from "@/services/authService";

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
      toast.error("Error", "No se pudo cerrar la sesión");
    }
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Cargando...</p>
      </div>
    );
  }

  const initial = user?.name?.[0]?.toUpperCase() || "U";
  const isGuest = user?.isGuest === true;

  const quickActions = [
    {
      title: "Mis Créditos",
      description: "Gestiona tu balance",
      icon: Zap,
      href: "/study/espacio/creditos",
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Mi Rendimiento",
      description: "Estadísticas de estudio",
      icon: TrendingUp,
      href: "/study/espacio/rendimiento",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Mis Funciones",
      description: "Flashcards, Notas, Quizzes",
      icon: Sparkles,
      href: "/study/espacio/funciones/flashcards",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Profile Header */}
      <header className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <div className={styles.profileAvatar}>
            {user?.picture ? (
              <Image
                src={user.picture}
                alt=""
                className={styles.userAvatar}
                width={64}
                height={64}
                unoptimized
              />
            ) : (
              <div className={styles.userAvatarPlaceholder}>{initial}</div>
            )}
            {!isGuest && <div className={styles.verifiedBadge}>✓</div>}
          </div>
          <div className={styles.profileDetails}>
            <h1 className={styles.profileName}>{user?.name || "Usuario"}</h1>
            <p className={styles.profileEmail}>{user?.email || "Sin correo"}</p>
            {isGuest && (
              <div className={styles.guestBadge}>
                <Info size={14} />
                <span>Modo Invitado</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.href}
                className={`${styles.actionCard} ${styles[`actionCard${action.color.replace(/\s/g, "")}`]}`}
                onClick={() => router.push(action.href)}
                type="button"
              >
                <div
                  className={`${styles.actionIcon} ${styles[`actionIcon${action.color.replace(/\s/g, "")}`]}`}
                >
                  <Icon size={24} />
                </div>
                <div className={styles.actionInfo}>
                  <h3 className={styles.actionTitle}>{action.title}</h3>
                  <p className={styles.actionDescription}>
                    {action.description}
                  </p>
                </div>
                <ArrowRight size={18} className={styles.actionArrow} />
              </button>
            );
          })}
        </div>
      </section>

      {/* Account Info */}
      <section className={styles.accountSection}>
        <h2 className={styles.sectionTitle}>Cuenta</h2>
        <div className={styles.infoCard}>
          <div className={styles.infoItem}>
            <div className={styles.infoIconWrapper}>
              <User size={18} />
            </div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Nombre</span>
              <span className={styles.infoValue}>
                {user?.name || "Sin nombre"}
              </span>
            </div>
          </div>
          <div className={styles.infoDivider} />
          <div className={styles.infoItem}>
            <div className={styles.infoIconWrapper}>
              <Mail size={18} />
            </div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Correo Electrónico</span>
              <span className={styles.infoValue}>
                {user?.email || "Sin correo"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Legal & About */}
      <section className={styles.legalSection}>
        <h2 className={styles.sectionTitle}>Legal</h2>
        <div className={styles.legalGrid}>
          <a
            href="/privacy.html"
            className={styles.legalCard}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.legalIcon}>
              <Shield size={20} />
            </div>
            <div className={styles.legalInfo}>
              <h3>Política de Privacidad</h3>
              <p>Cómo protegemos tus datos</p>
            </div>
          </a>
          <a
            href="/terms.html"
            className={styles.legalCard}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.legalIcon}>
              <FileText size={20} />
            </div>
            <div className={styles.legalInfo}>
              <h3>Términos de Uso</h3>
              <p>Reglas del servicio</p>
            </div>
          </a>
        </div>
      </section>

      {/* About */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutCard}>
          <Info size={20} className={styles.aboutIcon} />
          <div className={styles.aboutInfo}>
            <h3>LearnYos</h3>
            <p className={styles.version}>Versión 1.0.0</p>
          </div>
        </div>
      </section>

      {/* Logout Button */}
      <button
        className={styles.logoutButton}
        onClick={handleLogout}
        type="button"
      >
        <LogOut size={18} />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
}
