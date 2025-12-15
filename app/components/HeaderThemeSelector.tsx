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
import { themes } from '@/lib/themes';
import { Palette, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const HeaderThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  /**
   * Obtiene el gradiente de preview para cada tema
   */
  const getPreviewGradient = (themeName: string): string => {
    switch (themeName) {
      case 'light':
        return 'linear-gradient(to bottom right, #60a5fa, #a78bfa)';
      case 'dark':
        return 'linear-gradient(to bottom right, #3b82f6, #7c3aed)';
      case 'original':
        return 'linear-gradient(to bottom right, #06b6d4, #7b2cbf, #ec4899)';
      case 'ocean':
        return 'linear-gradient(to bottom right, #06b6d4, #0891b2)';
      case 'coffee':
        return 'linear-gradient(to bottom right, #f59e0b, #ea580c)';
      case 'forest':
        return 'linear-gradient(to bottom right, #22c55e, #16a34a)';
      case 'sunset':
        return 'linear-gradient(to bottom right, #a855f7, #ec4899)';
      default:
        return 'linear-gradient(to bottom right, #9ca3af, #6b7280)';
    }
  };

  /**
   * Maneja el cambio de tema
   */
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="theme-selector-button"
            aria-label="Cambiar tema"
          >
            <div 
              className="theme-selector-preview"
              style={{ background: getPreviewGradient(theme) }}
            />
            <Palette className="theme-selector-icon" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="theme-selector-popover"
          align="end"
          sideOffset={8}
        >
          <div className="theme-selector-content">
            <p className="theme-selector-label">Seleccionar tema</p>
            <div className="theme-selector-grid">
              {themes.map((t) => {
                const isSelected = theme === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => handleThemeChange(t.name as Theme)}
                    className={`theme-option ${isSelected ? 'theme-option-selected' : ''}`}
                    aria-label={`Cambiar a tema ${t.label}`}
                  >
                    <div 
                      className="theme-option-preview"
                      style={{ background: getPreviewGradient(t.name) }}
                    >
                      {isSelected && (
                        <Check className="theme-option-check" />
                      )}
                    </div>
                    <span className="theme-option-label">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <style jsx>{`
        .theme-selector-button {
          position: relative;
          height: 2.25rem;
          width: 2.25rem;
          border-radius: 0.75rem;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
          padding: 0.25rem;
        }

        .theme-selector-button:hover {
          transform: scale(1.05);
          background-color: hsl(var(--primary) / 0.1);
        }

        .theme-selector-preview {
          position: absolute;
          inset: 0.25rem;
          border-radius: 0.5rem;
          opacity: 0.8;
          transition: opacity var(--transition-base);
        }

        .theme-selector-button:hover .theme-selector-preview {
          opacity: 1;
        }

        .theme-selector-icon {
          height: 1rem;
          width: 1rem;
          color: white;
          position: relative;
          z-index: 10;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }

        .theme-selector-popover {
          width: 16rem;
          padding: 0.75rem;
          background-color: hsl(var(--popover) / 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid hsl(var(--border) / 0.5);
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
        }

        .theme-selector-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .theme-selector-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.75rem;
        }

        .theme-selector-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .theme-option {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: var(--radius);
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .theme-option:hover {
          background-color: hsl(var(--muted) / 0.5);
        }

        .theme-option-selected {
          background-color: hsl(var(--primary) / 0.1);
          box-shadow: 0 0 0 1px hsl(var(--primary) / 0.3);
        }

        .theme-option-preview {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: calc(var(--radius) - 2px);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .theme-option-check {
          width: 0.75rem;
          height: 0.75rem;
          color: white;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }

        .theme-option-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: hsl(var(--foreground));
        }

        @media (max-width: 640px) {
          .theme-selector-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
};
