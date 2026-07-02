"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import styles from "@/styles/restricted.module.css";

interface ProtectedContentProps {
  isGuest: boolean;
  message?: string;
  children: React.ReactNode;
}

export default function ProtectedContent({
  isGuest,
  message = "Debes iniciar sesión para acceder a esta sección",
  children,
}: ProtectedContentProps) {
  const router = useRouter();

  if (!isGuest) return <>{children}</>;

  return (
    <div className={styles.restrictedContainer}>
      <div className={styles.restrictedContent}>
        <div className={styles.iconWrapper}>
          <Lock size={48} className={styles.lockIcon} />
        </div>
        <h2 className={styles.title}>Acceso Restringido</h2>
        <p className={styles.message}>{message}</p>
        <button
          onClick={() => router.push("/auth")}
          className={styles.loginButton}
          aria-label="Ir a iniciar sesión"
        >
          Iniciar Sesión
        </button>
        <p className={styles.subtitle}>
          ¿No tienes cuenta? Puedes crear una de forma gratuita
        </p>
      </div>
    </div>
  );
}
