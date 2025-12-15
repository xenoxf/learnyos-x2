"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'original' | 'ocean' | 'coffee' | 'forest' | 'sunset';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('learnyos-theme') as Theme;
      if (stored) {
        setTheme(stored);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    try {
      localStorage.setItem('learnyos-theme', theme);
    } catch (e) {
      // ignore
    }
    
    const root = document.documentElement;
    root.classList.remove(
      'light', 'dark',
      'theme-original', 'theme-ocean', 'theme-coffee',
      'theme-forest', 'theme-sunset'
    );
    
    switch (theme) {
      case 'dark':
        root.classList.add('dark');
        break;
      case 'original':
        root.classList.add('theme-original');
        break;
      case 'ocean':
        root.classList.add('theme-ocean');
        break;
      case 'coffee':
        root.classList.add('theme-coffee');
        break;
      case 'forest':
        root.classList.add('theme-forest');
        break;
      case 'sunset':
        root.classList.add('theme-sunset');
        break;
      default:
        // Light theme - no class needed
        break;
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;

  return {
    theme: 'light',
    setTheme: () => {},
    toggleTheme: () => {},
  };
};

export default ThemeProvider;
