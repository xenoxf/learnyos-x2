"use client";

import React from "react";
import { X, UserX, ArrowBigLeft, ArrowLeft } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/guestBanner.module.css";

export function GuestBanner() {
  const router = useRouter();

  const handleDismiss = async () => {
    try {
      await apiService.logout();
      toast.info("Sesión de invitado cerrada", "Puedes iniciar sesión o continuar como invitado");
      router.push("/auth");
    } catch {
      toast.error("Error", "No se pudo cerrar la sesión");
    }
  };

  return (
    <div className={styles.guestBanner}>
      <UserX size={16} className={styles.guestBannerIcon} />
      <span className={styles.guestBannerText}>
        <p className={styles["mode-text"]} >Modo invitado · </p>  inicia sesión para participar en nuestra comunidad
      </span>
      <button
        className={styles.guestBannerClose}
        onClick={handleDismiss}
        aria-label="Cerrar banner de invitado"
        type="button"
      >
        <ArrowLeft size={19} />
      </button>
    </div>
  );
}
