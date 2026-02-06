"use client";

import styles from "@/styles/AuthFG.module.css";
import { GoogleAuthButton } from "./GoogleAuthButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface AuthFGProps {
  onClose?: () => void;
}

export const AuthFG: React.FC<AuthFGProps> = ({ onClose }) => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>("");

  // Detectar tema actual
  useEffect(() => {
    const detectTheme = () => {
      const html = document.documentElement;

      // Revisar clases del tema
      if (html.classList.contains("dark")) {
        setTheme("dark");
      } else if (html.classList.contains("theme-cereso")) {
        setTheme("theme-cereso");
      } else if (html.classList.contains("theme-ocean")) {
        setTheme("theme-ocean");
      } else if (html.classList.contains("theme-coffee")) {
        setTheme("theme-coffee");
      } else if (html.classList.contains("theme-forest")) {
        setTheme("theme-forest");
      } else if (html.classList.contains("theme-sunset")) {
        setTheme("theme-sunset");
      } else {
        setTheme("light");
      }
    };

    detectTheme();

    // Observar cambios de tema
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleGoogleSuccess = (user: any) => {
    router.push("/(protected)/dashboard");
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
    <div onClick={handleClose} className={styles.containerTransparente}>
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
          <h1 className={styles.appName}>LearnyOS</h1>
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
              <Link href="/terms" className={styles.footerLink}>
                términos de servicio
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
