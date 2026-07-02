"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Brain,
  FileText,
  ClipboardList,
  TrendingUp,
  Award,
  Flame,
  BookOpen,
} from "lucide-react";
import { analyticsService } from "@/services/analyticsService";
import type { DashboardStats, SubjectPerformance } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

function Bar({ value, max, label, score }: { value: number; max: number; label: string; score: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 truncate text-right shrink-0" title={label}>
        {label}
      </span>
      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: score >= 80
              ? "hsl(var(--chart-2))"
              : score >= 60
                ? "hsl(var(--chart-3))"
                : "hsl(var(--chart-5))",
          }}
        />
      </div>
      <span className="text-xs font-mono w-10 text-right">{score}%</span>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subjects, setSubjects] = useState<SubjectPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboard, subjectData] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getSubjects(),
      ]);
      setStats(dashboard);
      setSubjects(subjectData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium mb-2">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90"
          type="button"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const maxWeeklyCount = stats?.weeklyActivity && stats.weeklyActivity.length > 0
    ? Math.max(...stats.weeklyActivity.map((d) => d.count))
    : 0;

  const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="space-y-8">
      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardList size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.totalAttempts || 0}</div>
            <div className="text-xs text-muted-foreground">Intentos</div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
            <Award size={20} className="text-chart-2" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.averageScore?.toFixed(0) || 0}%</div>
            <div className="text-xs text-muted-foreground">Promedio</div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
            <Brain size={20} className="text-chart-3" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.totalFlashcards || 0}</div>
            <div className="text-xs text-muted-foreground">Flashcards</div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-chart-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.totalNotes || 0}</div>
            <div className="text-xs text-muted-foreground">Notas</div>
          </div>
        </div>
      </div>

      {/* Streak + Best Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Flame size={24} className="text-orange-500" />
            <h3 className="font-semibold">Racha de estudio</h3>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-4xl font-bold text-orange-500">{stats?.currentStreak || 0}</div>
              <div className="text-xs text-muted-foreground">días actual</div>
            </div>
            <div className="border-l pl-6">
              <div className="text-2xl font-bold text-muted-foreground">{stats?.longestStreak || 0}</div>
              <div className="text-xs text-muted-foreground">récord</div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award size={24} className="text-yellow-500" />
            <h3 className="font-semibold">Mejor puntuación</h3>
          </div>
          <div className="text-4xl font-bold text-yellow-500">{stats?.bestScore || 0}%</div>
          <div className="text-xs text-muted-foreground mt-1">de {stats?.totalExams || 0} exámenes</div>
        </div>
      </div>

      {/* Subject breakdown */}
      {subjects.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={20} className="text-primary" />
            <h3 className="font-semibold">Rendimiento por materia</h3>
          </div>
          <div className="space-y-3">
            {subjects.map((subj) => (
              <Bar
                key={subj.subject}
                label={subj.subject}
                value={subj.averageScore}
                max={100}
                score={subj.averageScore}
              />
            ))}
          </div>
        </div>
      )}

      {/* Weekly activity */}
      {stats?.weeklyActivity && stats.weeklyActivity.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={20} className="text-primary" />
            <h3 className="font-semibold">Actividad semanal</h3>
          </div>
          <div className="flex items-end gap-2 justify-center min-h-[120px]">
            {stats.weeklyActivity.map((day) => {
              const dayDate = new Date(day.date);
              const dayLabel = dayLabels[dayDate.getDay()];
              const heightPct = maxWeeklyCount > 0 ? (day.count / maxWeeklyCount) * 100 : 0;
              return (
                <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-md transition-all duration-500"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      minHeight: "8px",
                      background: day.count > 0
                        ? `hsl(var(--chart-2) / ${0.3 + (day.count / maxWeeklyCount) * 0.7})`
                        : "hsl(var(--muted))",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">{dayLabel}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{day.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
