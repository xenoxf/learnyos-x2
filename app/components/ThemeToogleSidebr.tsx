"use client";

import React from "react";
import { useTheme, Theme } from "@/contexts/ThemeContext";
import { themes } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon } from "lucide-react";

import styles from "@/styles/themeToggleSidebar.module.css";

interface ThemeToggleSidebrProps {
  isCollapse?: boolean;
}

export const ThemeToggleSidebr: React.FC<ThemeToggleSidebrProps> = ({
  isCollapse,
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const currentTheme = themes.find((t) => t.name === theme);

  const getThemePreview = (themeName: string) => {
    switch (themeName) {
      case "light":
        return styles.previewLight;
      case "dark":
        return styles.previewDark;
      case "ocean":
        return styles.previewOcean;
      case "coffee":
        return styles.previewCoffee;
      case "forest":
        return styles.previewForest;
      case "sunset":
        return styles.previewSunset;
      case "sakura":
        return styles.previewSakura;
      default:
        return styles.previewLight;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={styles.themeToggle}>
          {/* Preview */}
          <div className={`${styles.preview} ${getThemePreview(theme)}`} />

          {/* Label */}
          <span
            className={`hidden sm:inline ${isCollapse ? styles.none : styles.label}`}
          >
            {currentTheme?.label}
          </span>

          <svg
            className={styles.chevron}
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
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={styles.dropdown}>
        <div className={styles.dropdownHeader}>Temas</div>

        <div className={styles.dropdownList}>
          {themes.map((themeOption) => {
            const active = theme === themeOption.name;

            return (
              <DropdownMenuItem
                key={themeOption.name}
                onClick={() => setTheme(themeOption.name as Theme)}
                className={`${styles.dropdownItem} ${
                  active ? styles.activeItem : ""
                }`}
              >
                <div
                  className={`${styles.previewSmall} ${getThemePreview(
                    themeOption.name,
                  )}`}
                />

                <span className={styles.itemLabel}>{themeOption.label}</span>

                {active && <span className={styles.check}>✓</span>}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
