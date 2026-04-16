import React, { useEffect, useCallback, useState } from "react";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className = "",
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.closing : ""}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modal} ${styles[size]} ${isClosing ? styles.modalClosing : ""} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>
  );
};
