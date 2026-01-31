"use client";

/**
 * ============================================
 * HEADER THEME SELECTOR
 * ============================================
 * 
 * Selector de temas mejorado para el header.
 * Permite cambiar entre los diferentes temas disponibles
 * con una interfaz visual atractiva y responsive.
 * 
 * Características:
 * - Botón con preview del tema actual
 * - Popover con grid de temas
 * - Animaciones suaves
 * - Diseño responsive
 * - CSS puro (sin Tailwind)
 */

import React, { useState } from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';
import styles from '@/styles/headerThemeSelector.module.css';

const themes = [
  { id: 'light', label: '☀️ Claro' },
  { id: 'dark', label: '🌙 Oscuro' },
  { id: 'original', label: '✨ Original' },
  { id: 'ocean', label: '🌊 Ocean' },
  { id: 'coffee', label: '☕ Coffee' },
  { id: 'forest', label: '🌲 Forest' },
  { id: 'sunset', label: '🌅 Sunset' },
];

export const HeaderThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`${styles.themeSelector} ${styles.group}`}>
  <button className={styles.trigger}>
    <Palette size={20} />
    <span>Tema</span>
  </button>

  <div className={styles.dropdown}>
    <div className={styles.dropdownContent}>
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id as any)}
          className={styles.themeButton}
        >
          {t.label}
        </button>
      ))}
    </div>
  </div>
</div>

  );
}
