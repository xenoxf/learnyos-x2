export type Theme =
  | "light"
  | "dark"
  | "sakura"
  | "ocean"
  | "coffee"
  | "forest"
  | "sunset";
export const themes = [
  {
    name: "light",
    label: "Claro",
    description: "Tema claro y minimalista",
    colors: ["#3b82f6", "#8b5cf6", "#ffffff"],
    preview: "from-gray-50 to-white",
  },
  {
    name: "dark",
    label: "Oscuro",
    description: "Tema oscuro elegante",
    colors: ["#60a5fa", "#a78bfa", "#1f2937"],
    preview: "from-gray-900 to-gray-800",
  },
  {
    name: "sakura",
    label: "Sakura",
    description: "Cerezos en flor rosados", // Cambiado
    colors: ["#ffb6c1", "#ff85a2", "#ff6b8b"], // Cambiado
    preview: "from-pink-100 to-pink-50", // Cambiado
  },
  {
    name: "ocean",
    label: "Océano",
    description: "Azul profundo relajante",
    colors: ["#06b6d4", "#0891b2", "#164e63"],
    preview: "from-cyan-200 to-blue-300",
  },
  {
    name: "coffee",
    label: "Café",
    description: "Cálido y acogedor",
    colors: ["#d97706", "#92400e", "#451a03"],
    preview: "from-amber-200 to-orange-200",
  },
  {
    name: "forest",
    label: "Bosque",
    description: "Verde natural tranquilo",
    colors: ["#22c55e", "#16a34a", "#14532d"],
    preview: "from-green-200 to-emerald-200",
  },
  {
    name: "sunset",
    label: "Atardecer",
    description: "Púrpura y rosa vibrante",
    colors: ["#a855f7", "#ec4899", "#7c3aed"],
    preview: "from-purple-200 to-pink-200",
  },
] as const;
export const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("learnyos-theme") as Theme) || "light";
};
