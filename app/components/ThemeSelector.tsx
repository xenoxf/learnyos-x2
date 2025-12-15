"use client"

import React from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/themes';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const getPreviewStyle = (themeName: string) => {
    switch (themeName) {
      case 'original':
        return 'bg-gradient-to-br from-[#0f0e17] via-[#1a1a2e] to-[#16213e] border-[#16f4d0]/30';
      case 'light':
        return 'bg-gradient-to-br from-gray-50 to-white border-gray-200';
      case 'dark':
        return 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700';
      case 'ocean':
        return 'bg-gradient-to-br from-cyan-200 to-blue-300 border-cyan-400';
      case 'coffee':
        return 'bg-gradient-to-br from-amber-200 to-orange-200 border-amber-400';
      case 'forest':
        return 'bg-gradient-to-br from-green-200 to-emerald-200 border-green-400';
      case 'sunset':
        return 'bg-gradient-to-br from-purple-200 to-pink-200 border-purple-400';
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-200';
    }
  };

  const getAccentColors = (themeName: string) => {
    switch (themeName) {
      case 'original':
        return ['#16f4d0', '#7b2cbf', '#ff006e'];
      case 'light':
        return ['#3b82f6', '#8b5cf6', '#06b6d4'];
      case 'dark':
        return ['#60a5fa', '#a78bfa', '#22d3ee'];
      case 'ocean':
        return ['#06b6d4', '#0891b2', '#164e63'];
      case 'coffee':
        return ['#d97706', '#92400e', '#451a03'];
      case 'forest':
        return ['#22c55e', '#16a34a', '#14532d'];
      case 'sunset':
        return ['#a855f7', '#ec4899', '#7c3aed'];
      default:
        return ['#6b7280', '#9ca3af', '#d1d5db'];
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Elige tu tema</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {themes.map((themeOption) => {
          const isSelected = theme === themeOption.name;
          const accentColors = getAccentColors(themeOption.name);
          
          return (
            <Card 
              key={themeOption.name}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setTheme(themeOption.name as Theme)}
            >
              <CardContent className="p-3 space-y-2">
                {/* Preview */}
                <div 
                  className={`relative w-full h-16 rounded-lg border ${getPreviewStyle(themeOption.name)}`}
                >
                  {/* Accent dots */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {accentColors.map((color, idx) => (
                      <div 
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <div className="text-center">
                  <h4 className="font-medium text-sm">{themeOption.label}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{themeOption.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
