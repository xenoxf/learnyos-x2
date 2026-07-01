import { httpClient } from "./client";
import type { DashboardStats, SubjectPerformance, WeeklyActivity, StreakInfo } from "@/types";

export const analyticsService = {
  getDashboard(): Promise<DashboardStats> {
    return httpClient.request<DashboardStats>("/analytics/dashboard", { method: "GET" });
  },

  getSubjects(): Promise<SubjectPerformance[]> {
    return httpClient.request<SubjectPerformance[]>("/analytics/subjects", { method: "GET" });
  },

  getWeeklyActivity(): Promise<WeeklyActivity[]> {
    return httpClient.request<WeeklyActivity[]>("/analytics/weekly-activity", { method: "GET" });
  },

  getStreak(): Promise<StreakInfo> {
    return httpClient.request<StreakInfo>("/analytics/streak", { method: "GET" });
  },
};
