"use client";
import React, { useState, useEffect } from "react";
import { useTheme, Theme } from "@/contexts/ThemeContext";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Themes available for LandingPage (excludes 'original')
const landingThemes = [
  {
    name: "light",
    label: "Claro",
  },
  {
    name: "dark",
    label: "Oscuro",
  },
  {
    name: "ocean",
    label: "Océano",
  },
  {
    name: "coffee",
    label: "Café",
  },
  {
    name: "forest",
    label: "Bosque",
  },
  {
    name: "sunset",
    label: "Atardecer",
  },
];
export const LandingThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // Always set light theme as default for landing page on load
  useEffect(() => {
    setTheme("light");
  }, []);
  const getPreviewGradient = (themeName: string) => {
    switch (themeName) {
      case "light":
        return "from-blue-400 to-purple-400";
      case "dark":
        return "from-blue-500 to-purple-600";
      case "ocean":
        return "from-cyan-400 to-blue-500";
      case "coffee":
        return "from-amber-400 to-orange-500";
      case "forest":
        return "from-green-400 to-emerald-500";
      case "sunset":
        return "from-purple-400 to-pink-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 rounded-xl transition-all duration-300",
            "hover:scale-105 hover:bg-primary/10",
            "group",
          )}
        >
          <div
            className={cn(
              "absolute inset-1 rounded-lg bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity",
              getPreviewGradient(theme),
            )}
          />
          <Palette className="h-4 w-4 relative z-10 drop-shadow-md " />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-3 bg-popover/95 backdrop-blur-xl border-border/50"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Seleccionar tema
          </p>
          <div className="grid grid-cols-2 gap-2">
            {landingThemes.map((t) => {
              const isSelected = theme === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => {
                    setTheme(t.name as Theme);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
                    "hover:bg-muted/50",
                    isSelected && "bg-primary/10 ring-1 ring-primary/30",
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md bg-gradient-to-br shadow-sm flex items-center justify-center",
                      getPreviewGradient(t.name),
                    )}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-white drop-shadow-md" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
