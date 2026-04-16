/**
 * AttemptsService - Handles exam attempts tracking
 */
import { StatsHeroProps } from "@/types";
import { httpClient } from "./client";

export const attemptsService = {
  recordAttempt(data: { 
    examId: number
    correctAnswers: number
    totalQuestions: number
    examTitle: string 
  }): Promise<void> {
    return httpClient.request<void>("/exam-attempts", { 
      method: "POST", 
      body: JSON.stringify(data) 
    });
  },

  getAttempts(): Promise<any[]> {
    return httpClient.request<any[]>("/exam-attempts", { method: "GET" });
  },

  getAttemptsDeck(): Promise<any[]> {
    return httpClient.request<any[]>("/exam-attempts/deck", { method: "GET" });
  },

  getStats(): Promise<StatsHeroProps> {
    return httpClient.request("/exam-attempts/stats", { method: "GET" });
  },
};
