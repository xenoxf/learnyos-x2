/**
 * Theme Manager Utility
 * Manejo centralizado de temas para toda la aplicación
 */

export const THEME_COLORS = {
  sakura: {
    primary: "#60a5fa",
    secondary: "#a855f7",
    accent: "#ec4899",
    background: "#0f172a",
    surface: "#1e293b",
    border: "#475569",
    text: "#f1f5f9",
    muted: "#94a3b8",
  },
  dark: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#d946ef",
    background: "#0a0e27",
    surface: "#1a1f35",
    border: "#334155",
    text: "#f8fafc",
    muted: "#cbd5e1",
  },
  light: {
    primary: "#0284c7",
    secondary: "#7c3aed",
    accent: "#db2777",
    background: "#f8fafc",
    surface: "#f1f5f9",
    border: "#cbd5e1",
    text: "#0f172a",
    muted: "#64748b",
  },
  ocean: {
    primary: "#0369a1",
    secondary: "#06b6d4",
    accent: "#0ea5e9",
    background: "#0c2a3d",
    surface: "#164e63",
    border: "#06b6d4",
    text: "#cffafe",
    muted: "#7dd3fc",
  },
  coffee: {
    primary: "#92400e",
    secondary: "#b45309",
    accent: "#d97706",
    background: "#1f1410",
    surface: "#3f2817",
    border: "#78350f",
    text: "#fef3c7",
    muted: "#fbbf24",
  },
  forest: {
    primary: "#15803d",
    secondary: "#059669",
    accent: "#10b981",
    background: "#051e16",
    surface: "#134e4a",
    border: "#047857",
    text: "#d1fae5",
    muted: "#6ee7b7",
  },
  sunset: {
    primary: "#ea580c",
    secondary: "#dc2626",
    accent: "#f97316",
    background: "#1f0f0a",
    surface: "#3f1f1a",
    border: "#7c2d12",
    text: "#fef3c7",
    muted: "#fdba74",
  },
} as const;

export const THEME_GRADIENTS = {
  sakura: "linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)",
  dark: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
  light: "linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)",
  ocean: "linear-gradient(135deg, #0369a1 0%, #06b6d4 100%)",
  coffee: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
  forest: "linear-gradient(135deg, #15803d 0%, #10b981 100%)",
  sunset: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
} as const;

export type ThemeName = keyof typeof THEME_COLORS;

/**
 * Obtiene los colores del tema especificado
 */
export function getThemeColors(themeName: ThemeName) {
  return THEME_COLORS[themeName];
}

/**
 * Obtiene el gradiente del tema especificado
 */
export function getThemeGradient(themeName: ThemeName) {
  return THEME_GRADIENTS[themeName];
}

/**
 * Aplica variables CSS para el tema
 */
export function applyTheme(themeName: ThemeName) {
  const root = document.documentElement;
  const colors = THEME_COLORS[themeName];

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });

  // Guardar en localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("theme", themeName);
  }
}

/**
 * Obtiene el tema guardado o por defecto
 */
export function getSavedTheme(): ThemeName {
  if (typeof window === "undefined") return "sakura";

  const saved = localStorage.getItem("theme");
  if (saved && saved in THEME_COLORS) {
    return saved as ThemeName;
  }

  // Detectar preferencia del sistema
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "sakura";
}

/**
 * Hook para manejo de temas
 */
export function useThemeManager() {
  const currentTheme = getSavedTheme();

  const setTheme = (themeName: ThemeName) => {
    applyTheme(themeName);
  };

  const getColors = () => getThemeColors(currentTheme);

  const getGradient = () => getThemeGradient(currentTheme);

  return {
    currentTheme,
    setTheme,
    getColors,
    getGradient,
    availableThemes: Object.keys(THEME_COLORS) as ThemeName[],
  };
}

/**
 * Convierte colores hexadecimales a RGB
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convierte RGB a hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Ajusta luminosidad de un color hex
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.min(
    255,
    Math.max(0, Math.round(rgb.r + rgb.r * (percent / 100))),
  );
  const g = Math.min(
    255,
    Math.max(0, Math.round(rgb.g + rgb.g * (percent / 100))),
  );
  const b = Math.min(
    255,
    Math.max(0, Math.round(rgb.b + rgb.b * (percent / 100))),
  );

  return rgbToHex(r, g, b);
}

/**
 * Obtiene colores con transparencia (RGBA)
 */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Determina si un color es claro u oscuro
 */
export function isColorLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  // Fórmula de luminancia relativa
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

/**
 * Obtiene color de texto contrastante
 */
export function getContrastingTextColor(bgHex: string): string {
  return isColorLight(bgHex) ? "#000000" : "#ffffff";
}

/**
 * CSS Variables manager
 */
export function setCSSVariable(name: string, value: string) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty(`--${name}`, value);
  }
}

export function getCSSVariable(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
}

export function getAllCSSVariables(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const styles = getComputedStyle(document.documentElement);
  const variables: Record<string, string> = {};

  for (let i = 0; i < styles.length; i++) {
    const name = styles[i];
    if (name.startsWith("--")) {
      variables[name] = styles.getPropertyValue(name);
    }
  }

  return variables;
}
