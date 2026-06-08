"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, FileText, Target, Trophy, MessageSquare, ChevronRight } from "lucide-react";
import styles from "@/styles/klerk.module.css";
import { attemptsService } from "@/services/attemptsService";
import type { StatsHeroProps } from "@/types";

export function StatsOverview({ onSeeDetails }: { onSeeDetails: () => void }) {
  const [stats, setStats] = useState<StatsHeroProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await attemptsService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.statsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><BarChart3 size={20} /> Tu Progreso</h2>
        </div>
        <div className={styles.statsGrid}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.skeletonStat} style={{ width: '60%', height: '20px', marginBottom: '8px' }} />
              <div className={styles.skeletonStat} style={{ width: '40%', height: '28px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: "Exámenes", value: stats.totalAttempts || 0, icon: FileText, color: "hsl(var(--primary))" },
    { label: "Promedio", value: stats.avgCorrect ? `${stats.avgCorrect.toFixed(1)}%` : "0%", icon: Target, color: "#10b981" },
    { label: "Mejor", value: stats.bestScore ? `${stats.bestScore.toFixed(1)}%` : "0%", icon: Trophy, color: "#f59e0b" },
    { label: "Preguntas", value: stats.totalQuestions || 0, icon: MessageSquare, color: "#7c3aed" },
  ];

  return (
    <div className={styles.statsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><BarChart3 size={20} /> Tu Progreso</h2>
        <button className={styles.seeMoreBtn} onClick={onSeeDetails}>Ver detalles <ChevronRight size={16} /></button>
      </div>
      <div className={styles.statsGrid}>
        {statItems.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={styles.statIconWrap} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={18} />
              </div>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
