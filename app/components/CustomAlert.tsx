"use client";

import React, { useEffect } from "react";
import { AlertTriangle, AlertCircle, CheckCircle, Info, X } from "lucide-react";
import styles from "@/styles/customAlert.module.css";

export type AlertType = "success" | "error" | "warning" | "info";

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export function CustomAlert({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  showCancel = false,
}: CustomAlertProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={24} className={styles.iconSuccess} />;
      case "error":
        return <AlertCircle size={24} className={styles.iconError} />;
      case "warning":
        return <AlertTriangle size={24} className={styles.iconWarning} />;
      default:
        return <Info size={24} className={styles.iconInfo} />;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.alert}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>{getIcon()}</div>
          <h3 className={styles.title}>{title}</h3>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            type="button"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          {showCancel && onConfirm ? (
            <>
              <button onClick={onClose} className={styles.cancelBtn} type="button">
                {cancelText}
              </button>
              <button onClick={handleConfirm} className={styles.confirmBtn} type="button">
                {confirmText}
              </button>
            </>
          ) : (
            <button onClick={onClose} className={styles.confirmBtn} type="button">
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
