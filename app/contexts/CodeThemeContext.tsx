"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

// Code theme context for syntax highlighting
export type CodeTheme = 'vscDarkPlus' | 'atomOneDark' | 'githubLight' | 'nightOwl';

interface CodeThemeContextType {
  codeTheme: CodeTheme;
  setCodeTheme: (theme: CodeTheme) => void;
}

const CodeThemeContext = createContext<CodeThemeContextType | undefined>(undefined);

export const CodeThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [codeTheme, setCodeThemeState] = useState<CodeTheme>('vscDarkPlus');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('focusos-code-theme');
      if (stored) {
        setCodeThemeState(stored as CodeTheme);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('focusos-code-theme', codeTheme);
    } catch (e) {
      // ignore
    }
  }, [codeTheme, mounted]);

  const setCodeTheme = (theme: CodeTheme) => {
    setCodeThemeState(theme);
  };

  return (
    <CodeThemeContext.Provider value={{ codeTheme, setCodeTheme }}>
      {children}
    </CodeThemeContext.Provider>
  );
};

export const useCodeTheme = (): CodeThemeContextType => {
  const context = useContext(CodeThemeContext);
  if (context) return context;

  // Fallback when provider is missing
  return {
    codeTheme: 'vscDarkPlus',
    setCodeTheme: () => {},
  };
};
