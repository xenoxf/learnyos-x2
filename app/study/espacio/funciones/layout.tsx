"use client";

import React, { useState } from "react";
import { AlertTriangle, LogIn } from "lucide-react";
import LoadingModal from "@/components/loadingModal";
import styles from "@/styles/espacio/espacioPages.module.css";
import Link from "next/link";
import { authService } from "@/services/authService";

export default function FuncionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isGuest = authService.isGuest();
  const [isLoading, setIsLoading] = useState(false);

  if (isGuest) {
    if (isLoading) {
      return <LoadingModal />;
    }

    return (
      <div className={styles.guestMessage}>
        <AlertTriangle size={48} />
        <h3>Función Premium</h3>
        <p>
          Para gestionar tus flashcards, notas y quizzes necesitas una cuenta
          registrada.
        </p>
        <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          Puedes explorar el contenido público en cada sección.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <Link
            href="/auth"
            className={styles.retryButton}
            onClick={() => setIsLoading(true)}
          >
            <LogIn size={16} />
            <span>Iniciar Sesión</span>
          </Link>
          <Link
            href="/study/flashcards"
            className={`${styles.retryButton} ${styles.secondaryButton}`}
            onClick={() => setIsLoading(true)}
          >
            <span>Explorar público</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
