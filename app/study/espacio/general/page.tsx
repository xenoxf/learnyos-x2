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
  Loader2,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/espacio/general.module.css";

export default function GeneralPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; picture?: string; isGuest?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = apiService.getUser();
    setUser(userData);
    setLoading(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiService.logout();
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>General</h1>
        <div className={styles.userBadge}>
          {user?.picture ? (
            <Image src={user.picture} alt="" className={styles.userAvatar} width={36} height={36} unoptimized />
          ) : (
            <div className={styles.userAvatarPlaceholder}>{initial}</div>
          )}
          <span className={styles.userName}>{user?.name || "Usuario"}</span>
        </div>
      </header>

      {/* Account Info Card */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <User size={20} className={styles.cardIcon} />
          <h2 className={styles.cardTitle}>Información de Cuenta</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <User size={16} className={styles.infoIcon} />
              <span className={styles.infoLabel}>Nombre</span>
            </div>
            <span className={styles.infoValue}>{user?.name || "Sin nombre"}</span>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <Mail size={16} className={styles.infoIcon} />
              <span className={styles.infoLabel}>Correo</span>
            </div>
            <span className={styles.infoValue}>{user?.email || "Sin correo"}</span>
          </div>
        </div>
      </section>

      {/* Session Card */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <LogOut size={20} className={styles.cardIcon} />
          <h2 className={styles.cardTitle}>Sesión</h2>
        </div>
        <div className={styles.cardBody}>
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </section>

      {/* About Card */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <Info size={20} className={styles.cardIcon} />
          <h2 className={styles.cardTitle}>Acerca de</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Versión</span>
            <span className={styles.infoValue}>1.0.0</span>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <Shield size={16} className={styles.infoIcon} />
              <span className={styles.infoLabel}>Plataforma</span>
            </div>
            <span className={styles.infoValue}>LearnYos</span>
          </div>
        </div>
      </section>
    </div>
  );
}
