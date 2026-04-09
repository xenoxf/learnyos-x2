"use client";

import React from "react";
import { AlertTriangle, LogIn } from "lucide-react";
import { apiService } from "@/services/apiService";
import styles from "@/styles/espacio/espacioPages.module.css";
import Link from "next/link";

export default function FuncionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isGuest = apiService.isGuest();

  if (isGuest) {
    return (
      <div className={styles.guestMessage}>
        <AlertTriangle size={48} />
        <h3>Acceso Restringido</h3>
        <p>Esta sección requiere una cuenta registrada. Inicia sesión o regístrate para gestionar tus flashcards, notas y quizzes.</p>
        <Link
          href="/auth"
          className={styles.retryButton}
        >
          <LogIn size={18} />
          <span>Iniciar Sesión / Registrarse</span>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
