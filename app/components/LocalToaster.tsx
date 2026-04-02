/**
 * ============================================
 * LocalToaster - Componente de Notificaciones
 * ============================================
 * 
 * Componente que renderiza las notificaciones/toasts
 * usando CSS puro y variables globales para soporte de temas.
 */

"use client";

import React, { useCallback } from "react";
import { useLocalToast, Toast, ToastType } from "@/hooks/useLocalToast";
import styles from "./LocalToaster.module.css";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

interface LocalToasterProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

interface ToastIconProps {
  type: ToastType;
  className?: string;
}

const ToastIcon: React.FC<ToastIconProps> = ({ type, className }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];
  return <Icon className={className} aria-hidden="true" />;
};

export const LocalToaster: React.FC<LocalToasterProps> = ({
  position = "top-right",
}) => {
  const { toasts, removeToast } = useLocalToast();

  const getPositionClasses = useCallback(() => {
    switch (position) {
      case "top-right":
        return styles.topRight;
      case "top-left":
        return styles.topLeft;
      case "bottom-right":
        return styles.bottomRight;
      case "bottom-left":
        return styles.bottomLeft;
      default:
        return styles.topRight;
    }
  }, [position]);

  const getTypeClasses = useCallback((type: ToastType): string => {
    const classes = {
      success: styles.toastSuccess,
      error: styles.toastError,
      warning: styles.toastWarning,
      info: styles.toastInfo,
    };
    return classes[type] || styles.toastInfo;
  }, []);

  const getIconColorClasses = useCallback((type: ToastType): string => {
    const classes = {
      success: styles.iconSuccess,
      error: styles.iconError,
      warning: styles.iconWarning,
      info: styles.iconInfo,
    };
    return classes[type] || styles.iconInfo;
  }, []);

  return (
    <div className={`${styles.container} ${getPositionClasses()}`}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${getTypeClasses(toast.type)}`}
          role="alert"
          aria-live="polite"
        >
          <div className={styles.toastContent}>
            <div className={`${styles.toastIcon} ${getIconColorClasses(toast.type)}`}>
              <ToastIcon type={toast.type} />
            </div>
            <div className={styles.toastText}>
              {toast.title && (
                <div className={styles.toastTitle}>{toast.title}</div>
              )}
              {toast.description && (
                <div className={styles.toastDescription}>{toast.description}</div>
              )}
            </div>
            <button
              className={styles.closeButton}
              onClick={() => removeToast(toast.id)}
              aria-label="Cerrar notificación"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
          <div className={styles.toastProgress}>
            <div
              className={`${styles.progressBar} ${getTypeClasses(toast.type)}`}
              style={{
                animation: `${styles.shrink} ${toast.duration || 5000}ms linear`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocalToaster;
