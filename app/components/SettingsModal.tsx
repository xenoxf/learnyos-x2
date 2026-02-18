"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "../styles/Settings.module.css";
import type { SettingsFormData } from "@/types";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeSelector } from "./ThemeSelector";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [settings, setSettings] = useState<SettingsFormData>({
    notifications: true,
    theme: "auto",
    language: "es",
    dailyGoal: 180,
    emailUpdates: false,
  });

  const handleChange = (key: keyof SettingsFormData, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem("settings", JSON.stringify(settings));
    onClose();
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className={styles.modalFondo} onClick={onClose}>
      {/* Botón cerrar flotante (opcional, como en AuthFG) */}
      <button
        className={styles.closeButton}
        onClick={onClose}
        title="Cerrar"
        type="button"
      >
        <X size={20} />
      </button>

      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Configuración</h2>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  handleChange("notifications", e.target.checked)
                }
              />
              <span>Activar notificaciones</span>
            </label>
          </div>

          <ThemeToggle />


          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Idioma</label>
            <select
              value={settings.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className={styles.select}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Meta diaria (minutos)</label>
            <input
              type="number"
              value={settings.dailyGoal}
              onChange={(e) =>
                handleChange("dailyGoal", parseInt(e.target.value))
              }
              className={styles.input}
              min="15"
              max="600"
              step="15"
            />
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              <input
                type="checkbox"
                checked={settings.emailUpdates}
                onChange={(e) => handleChange("emailUpdates", e.target.checked)}
              />
              <span>Recibir actualizaciones por correo</span>
            </label>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            onClick={onClose}
            className={styles.buttonSecondary}
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={styles.buttonPrimary}
            type="button"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
