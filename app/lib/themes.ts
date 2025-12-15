export type Theme = 'light' | 'dark' | 'original' | 'ocean' | 'coffee' | 'forest' | 'sunset';

export const themes = [
  {
    name: 'light',
    label: 'Claro',
    description: 'Tema claro y minimalista',
    colors: ['#3b82f6', '#8b5cf6', '#ffffff'],
    preview: 'from-gray-50 to-white'
  },
  {
    name: 'dark',
    label: 'Oscuro',
    description: 'Tema oscuro elegante',
    colors: ['#60a5fa', '#a78bfa', '#1f2937'],
    preview: 'from-gray-900 to-gray-800'
  },
  {
    name: 'original',
    label: 'Original',
    description: 'Futurista con neón',
    colors: ['#16f4d0', '#7b2cbf', '#ff006e'],
    preview: 'from-cyan-400 via-purple-500 to-pink-500'
  },
  {
    name: 'ocean',
    label: 'Océano',
    description: 'Azul profundo relajante',
    colors: ['#06b6d4', '#0891b2', '#164e63'],
    preview: 'from-cyan-200 to-blue-300'
  },
  {
    name: 'coffee',
    label: 'Café',
    description: 'Cálido y acogedor',
    colors: ['#d97706', '#92400e', '#451a03'],
    preview: 'from-amber-200 to-orange-200'
  },
  {
    name: 'forest',
    label: 'Bosque',
    description: 'Verde natural tranquilo',
    colors: ['#22c55e', '#16a34a', '#14532d'],
    preview: 'from-green-200 to-emerald-200'
  },
  {
    name: 'sunset',
    label: 'Atardecer',
    description: 'Púrpura y rosa vibrante',
    colors: ['#a855f7', '#ec4899', '#7c3aed'],
    preview: 'from-purple-200 to-pink-200'
  }
] as const;

export const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove(
    'light', 'dark', 
    'theme-original', 'theme-ocean', 'theme-coffee', 
    'theme-forest', 'theme-sunset'
  );
  
  // Apply new theme
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
  
  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('learnyos-theme', theme);
  }
};

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('learnyos-theme') as Theme) || 'light';
};
