"use client";

import React from "react";
import { X, UserX, ArrowBigLeft, ArrowLeft } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/guestBanner.module.css";

export function GuestBanner() {
  const router = useRouter();
  const { toast } = useToast();

  const handleDismiss = async () => {
    try {
      await apiService.logout();
      toast({
        title: "Sesión de invitado cerrada",
        description: "Puedes iniciar sesión o continuar como invitado.",
      });
      router.push("/auth");
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={styles.guestBanner}>
      <UserX size={16} className={styles.guestBannerIcon} />
      <span className={styles.guestBannerText}>
        Modo invitado · Inicia sesión para guardar tu progreso y crear contenido
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
