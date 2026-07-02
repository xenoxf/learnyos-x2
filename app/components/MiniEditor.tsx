"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Bold, Italic, Heading, List, Code, ImageIcon, Link, Eye, Edit3 } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import styles from "@/styles/miniEditor.module.css";

interface MiniEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  label?: string;
}

const wrapSelection = (before: string, after: string, textarea: HTMLTextAreaElement): string => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const newText = textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end);
  return newText;
};

const insertAtCursor = (text: string, textarea: HTMLTextAreaElement): string => {
  const start = textarea.selectionStart;
  return textarea.value.substring(0, start) + text + textarea.value.substring(textarea.selectionEnd);
};

export function MiniEditor({ value, onChange, placeholder, minRows = 3, label }: MiniEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.max(ta.scrollHeight, minRows * 1.5 * 16)}px`;
    }
  }, [minRows]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const exec = useCallback((fn: (ta: HTMLTextAreaElement) => string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const newVal = fn(ta);
    onChange(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = ta.value.length;
    });
  }, [onChange]);

  const handleBold = useCallback(() => {
    exec(ta => wrapSelection("**", "**", ta));
  }, [exec]);

  const handleItalic = useCallback(() => {
    exec(ta => wrapSelection("_", "_", ta));
  }, [exec]);

  const handleHeading = useCallback(() => {
    exec(ta => {
      const start = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
      return ta.value.substring(0, lineStart) + "### " + ta.value.substring(lineStart);
    });
  }, [exec]);

  const handleList = useCallback(() => {
    exec(ta => {
      const val = ta.value;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = val.substring(start, end);
      if (selected) {
        const lines = selected.split("\n").map(l => l.trim() ? `- ${l}` : l).join("\n");
        return val.substring(0, start) + lines + val.substring(end);
      }
      return insertAtCursor("- ", ta);
    });
  }, [exec]);

  const handleCode = useCallback(() => {
    exec(ta => wrapSelection("`", "`", ta));
  }, [exec]);

  const handleLink = useCallback(() => {
    exec(ta => {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = ta.value.substring(start, end) || "texto";
      return ta.value.substring(0, start) + `[${selected}](url)` + ta.value.substring(end);
    });
  }, [exec]);

  const handleImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilePicked = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      exec(ta => insertAtCursor(`![${file.name}](${dataUrl})`, ta));
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [exec]);

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={`${styles.editorBox} ${preview ? styles.withPreview : ""}`}>
        <div className={styles.toolbar}>
          <button onClick={handleBold} className={styles.toolBtn} type="button" title="Negrita (Ctrl+B)" aria-label="Negrita">
            <Bold size={14} />
          </button>
          <button onClick={handleItalic} className={styles.toolBtn} type="button" title="Cursiva (Ctrl+I)" aria-label="Cursiva">
            <Italic size={14} />
          </button>
          <button onClick={handleHeading} className={styles.toolBtn} type="button" title="Encabezado" aria-label="Encabezado">
            <Heading size={14} />
          </button>
          <button onClick={handleList} className={styles.toolBtn} type="button" title="Lista" aria-label="Lista">
            <List size={14} />
          </button>
          <button onClick={handleCode} className={styles.toolBtn} type="button" title="Código" aria-label="Código">
            <Code size={14} />
          </button>
          <button onClick={handleLink} className={styles.toolBtn} type="button" title="Enlace" aria-label="Enlace">
            <Link size={14} />
          </button>
          <button onClick={handleImage} className={styles.toolBtn} type="button" title="Imagen" aria-label="Imagen">
            <ImageIcon size={14} />
          </button>
          <div className={styles.toolbarSpacer} />
          <button
            onClick={() => setPreview(p => !p)}
            className={`${styles.toolBtn} ${preview ? styles.toolBtnActive : ""}`}
            type="button"
            title={preview ? "Editar" : "Vista previa"}
            aria-label={preview ? "Editar" : "Vista previa"}
          >
            {preview ? <Edit3 size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div className={styles.editorBody}>
          {preview ? (
            <div className={styles.previewPane}>
              {value ? (
                <MarkdownRenderer content={value} />
              ) : (
                <span className={styles.previewPlaceholder}>Sin contenido</span>
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => {
                onChange(e.target.value);
                adjustHeight();
              }}
              className={styles.textarea}
              placeholder={placeholder || "Escribe aquí..."}
              rows={minRows}
              spellCheck
            />
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFilePicked}
        style={{ display: "none" }}
      />
    </div>
  );
}
