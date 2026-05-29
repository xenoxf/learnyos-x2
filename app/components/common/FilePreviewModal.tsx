"use client";

import React, { useEffect, useCallback } from "react";
import { X, Download } from "lucide-react";
import styles from "./FilePreviewModal.module.css";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName = "",
  fileType = "",
}: FilePreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const isImage = fileType.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.fileName}>{fileName}</span>
          <div className={styles.headerActions}>
            <a
              href={fileUrl}
              download={fileName}
              className={styles.downloadBtn}
              title="Descargar"
            >
              <Download size={18} />
            </a>
            <button className={styles.closeBtn} onClick={onClose} title="Cerrar">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.previewArea}>
          {isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className={styles.image}
            />
          ) : (
            <div className={styles.filePlaceholder}>
              <span className={styles.fileIcon}>📄</span>
              <span className={styles.fileLabel}>{fileName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
