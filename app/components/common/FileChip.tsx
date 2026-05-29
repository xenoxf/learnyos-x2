"use client";

import React from "react";
import { X, FileText, Image as ImageIcon } from "lucide-react";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
} from "@/lib/file-constants";
import styles from "./FileChip.module.css";

interface FileChipProps {
  file: File;
  index: number;
  onRemove?: (index: number) => void;
  disabled?: boolean;
  variant?: "input" | "message";
  previewUrl?: string;
}

export default function FileChip({
  file,
  index,
  onRemove,
  disabled = false,
  variant = "input",
  previewUrl,
}: FileChipProps) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isImage = ACCEPTED_IMAGE_EXTENSIONS.includes(`.${ext}`);
  const showPreview = isImage && previewUrl;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const chipClass = variant === "input" ? styles.chip : styles.chipMessage;

  return (
    <div className={`${chipClass} ${showPreview ? styles.chipWithPreview : ""}`}>
      {showPreview ? (
        <img src={previewUrl} alt="" className={styles.thumb} />
      ) : (
        <div className={styles.icon}>
          {isImage ? <ImageIcon size={12} /> : <FileText size={12} />}
        </div>
      )}
      {showPreview ? (
        <span className={styles.namePreview}>{file.name}</span>
      ) : (
        <>
          <span className={styles.name}>{file.name}</span>
          <span className={styles.size}>{formatSize(file.size)}</span>
        </>
      )}
      {variant === "input" && onRemove && (
        <button
          className={`${styles.remove} ${showPreview ? styles.removePreview : ""}`}
          onClick={() => onRemove(index)}
          disabled={disabled}
          type="button"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}
