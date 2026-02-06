/**
 * GUÍA DE COMPONENTES PARA DASHBOARD
 * ==================================
 * 
 * Los siguientes componentes están diseñados para funcionar
 * dentro de la página de dashboard y deben ser correctamente importados
 */

// Componentes que pertenecen a Dashboard:
// =========================================

// 1. OptimizedStatsCards
//    - Muestra estadísticas del usuario
//    - No requiere props
//    - Ubicación: app/components/OptimizedStatsCards.tsx

// 2. PomodoroTimer  
//    - Temporizador Pomodoro
//    - Props: ninguna requerida (usa localStorage)
//    - Ubicación: app/components/PomodoroTimer.tsx
//    - NOTA: Arreglado el error de duplicación de settings

// 3. PomodoroSettings
//    - Panel de configuración para Pomodoro
//    - Props: onClose (función)
//    - Ubicación: app/components/PomodoroSettings.tsx

// 4. StudyTimer
//    - Temporizador de estudio general
//    - Props: onTimeUpdate?, onComplete?
//    - Ubicación: app/components/StudyTimer.tsx

// 5. StudyTechniques
//    - Muestra técnicas de estudio
//    - Props: ninguna
//    - Ubicación: app/components/StudyTechniques.tsx

// 6. MemoryGame
//    - Juego de memoria para descansos
//    - Props: ninguna
//    - Ubicación: app/components/MemoryGame.tsx

// ERRORES CORREGIDOS:
// ==================
// ✅ PomodoroTimer.tsx (línea 39):
//    Problema: 'workTime' is specified more than once
//    Solución: Usar coalescencia nula (??) para evitar sobrescritura
//    
//    ANTES:
//    settings: {
//      workTime: 25,
//      ...
//    }
//    
//    DESPUÉS:
//    settings: recovered.settings?.workTime ?? 25,
//    ...

// INSTRUCCIONES DE USO:
// ====================
// En dashboard/page.tsx:
//
// import PomodoroTimer from '@/components/PomodoroTimer';
// import PomodoroSettings from '@/components/PomodoroSettings';
// import StudyTechniques from '@/components/StudyTechniques';
// import OptimizedStatsCards from '@/components/OptimizedStatsCards';
//
// export default function Dashboard() {
//   return (
//     <div>
//       <OptimizedStatsCards />
//       <PomodoroTimer />
//       <StudyTechniques />
//     </div>
//   );
// }

export const DASHBOARD_COMPONENTS = {
  OptimizedStatsCards: 'app/components/OptimizedStatsCards.tsx',
  PomodoroTimer: 'app/components/PomodoroTimer.tsx',
  PomodoroSettings: 'app/components/PomodoroSettings.tsx',
  StudyTimer: 'app/components/StudyTimer.tsx',
  StudyTechniques: 'app/components/StudyTechniques.tsx',
  MemoryGame: 'app/components/MemoryGame.tsx',
} as const;
