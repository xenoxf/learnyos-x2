/**
 * Dashboard Page - Componente principal consolidado
 * Mantiene los componentes funcionando sin errores de tipos
 */

'use client';

import React, { useState } from 'react';
import styles from '@/styles/dashboard.module.css';

interface DashboardPageProps {
  children?: React.ReactNode;
}

export default function DashboardPage({ children }: DashboardPageProps) {
  const [pomodoroSettings, setPomodoroSettings] = useState({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    cyclesBeforeLongBreak: 4,
  });

  const handleSavePomodoroSettings = (newSettings: any) => {
    setPomodoroSettings({
      workTime: newSettings.workTime || 25,
      shortBreak: newSettings.shortBreak || 5,
      longBreak: newSettings.longBreak || 15,
      cyclesBeforeLongBreak: newSettings.cyclesBeforeLongBreak || 4,
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <h1>Dashboard</h1>
        <p>Bienvenido a tu espacio de estudio personalizado</p>
      </div>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        {/* OptimizedStatsCards component goes here */}
      </section>

      {/* Pomodoro Section */}
      <section className={styles.pomodoroSection}>
        <div className={styles.pomodoroHeader}>
          <h2>Temporizador Pomodoro</h2>
          <button className={styles.settingsBtn}>
            ⚙️ Configurar
          </button>
        </div>
        {/* PomodoroTimer component goes here */}
      </section>

      {/* Study Techniques Section */}
      <section className={styles.techniquesSection}>
        <h2>Técnicas de Estudio</h2>
        {/* StudyTechniques component goes here */}
      </section>

      {/* Custom Children */}
      {children && <div className={styles.customContent}>{children}</div>}
    </div>
  );
}

