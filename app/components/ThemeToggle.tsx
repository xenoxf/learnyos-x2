"use client"

import React from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const currentTheme = themes.find(t => t.name === theme);

  const getThemePreview = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300';
      case 'dark':
        return 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-500';
      case 'ocean':
        return 'bg-gradient-to-br from-blue-400 to-cyan-500 border-blue-500';
      case 'coffee':
        return 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-600';
      default:
        return 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background border-border hover:bg-accent">
          <div className="flex items-center gap-2">
            <div 
              className={`w-4 h-4 rounded-full border-2 ${getThemePreview(theme)}`}
            />
            <span className="hidden sm:inline text-foreground font-medium">{currentTheme?.label}</span>
            <svg
              className="w-4 h-4 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border shadow-lg">
        <div className="p-2">
          <h3 className="font-semibold mb-2 text-sm text-foreground px-2">Seleccionar Tema</h3>
          <div className="space-y-1">
            {themes.map((themeOption) => (
              <DropdownMenuItem
                key={themeOption.name}
                onClick={() => setTheme(themeOption.name as Theme)}
                className={`cursor-pointer p-2 rounded-lg transition-all ${
                  theme === themeOption.name 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent text-foreground'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div 
                    className={`w-5 h-5 rounded-md flex-shrink-0 border ${getThemePreview(themeOption.name)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{themeOption.label}</div>
                  </div>
                  {theme === themeOption.name && (
                    <div className="text-primary text-sm font-bold">✓</div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
