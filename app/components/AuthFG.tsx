"use client";

import styles from "@/styles/AuthFG.module.css";
import Image from "next/image";
import { GoogleAuthButton } from "./GoogleAuthButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface AuthFGProps {
  onClose?: () => void;
}

export const AuthFG: React.FC<AuthFGProps> = ({ onClose }) => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const handleGoogleSuccess = () => {
    router.push("/study");
    router.refresh();
  };

  const handleGoogleError = (errorMessage: string) => {
    setFormError(errorMessage);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div onDoubleClick={handleClose} className={styles.containerTransparente}>
      <Button
        className={styles["btnClose"]}
        onClick={handleClose}
        title="Cerrar"
      >
        <X size={24} />
      </Button>

      <main className={styles["main-"]}>
        {/* Section 1 - Brand */}
        <div className={styles["section-1"]}>
          <div className={styles.logoContainer}>
            <Image
              src="/logo-100x100.png"
              alt="LearnYos Logo"
              width={100}
              height={100}
              className={styles.logoImage}
            />
          </div>
          <h1 className={styles.appName}>LearnYos</h1>
          <p className={styles.sectionSubtitle}>
            Tu plataforma de aprendizaje con IA
          </p>
        </div>

        {/* Section 2 - Auth Options */}
        <div className={styles["section-2"]}>
          <h2 className={styles.title}>Selecciona tu método de acceso</h2>

          <div className={styles.opciones}>
            {/* Google Auth Option */}
            <div className={styles.googleContainer}>
              <GoogleAuthButton
                onError={handleGoogleError}
                onSuccess={handleGoogleSuccess}
              />
              {formError && <p className={styles.errorMessage}>{formError}</p>}
            </div>

            {/* Local Auth Option */}
            <div className={styles.localContainer}>
              <h3 className={styles.localTitle}>Correo y Contraseña</h3>
              <Link href="/auth" className={styles.link} onClick={handleClose}>
                Acceder
              </Link>
            </div>
          </div>

          {/* Footer Info */}
          <div className={styles.authFooter}>
            <p className={styles.authFooterText}>
              Al continuar, aceptas nuestros{" "}
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                términos de servicio
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
