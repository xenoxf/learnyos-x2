"use client";

import React, { useState } from "react";
import { UserX, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/useLocalToast";
import LoadingModal from "@/components/loadingModal";
import styles from "@/styles/guestBanner.module.css";
import { authService } from "@/services/authService";

export function GuestBanner() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDismiss = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await authService.logout();
      toast.info(
        "Sesión de invitado cerrada",
        "Puedes iniciar sesión o continuar como invitado",
      );
      router.push("/auth");
    } catch {
      toast.error("Error", "No se pudo cerrar la sesión");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingModal />;
  }

  return (
    <div className={styles.guestBanner}>
      <UserX size={16} className={styles.guestBannerIcon} />
      <span className={styles.guestBannerText}>
        <p className={styles["mode-text"]}>Modo invitado · </p> inicia sesión
        para participar en nuestra comunidad
      </span>
      <button
        className={styles.guestBannerClose}
        onClick={handleDismiss}
        aria-label="Cerrar banner de invitado"
        type="button"
        disabled={isLoading}
      >
        <ArrowLeft size={19} />
      </button>
    </div>
  );
}
