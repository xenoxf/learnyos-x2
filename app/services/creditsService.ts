/**
 * CreditsService - Handles credits status and cost estimation
 */
import { CreditsStatus } from "@/types";
import { httpClient } from "./client";

export const creditsService = {
  getStatus(): Promise<CreditsStatus> {
    return httpClient.request<CreditsStatus>("/credits/status", { method: "GET" });
  },

  estimateExamCost(numberOfQuestions: number, difficulty: string, reference: string, acceso: string): number {
    const base = 3;
    const questionCost = numberOfQuestions * 0.5;
    const diffMult: Record<string, number> = { easy: 1.0, medium: 1.3, hard: 1.7 };
    let cost = Math.ceil((base + questionCost) * (diffMult[difficulty] || 1.3) + (reference.length > 100 ? 1 : 0));
    if (acceso === 'public') {
      cost = Math.ceil(cost * 0.5);
    }
    return cost;
  },

  estimateNoteCost(levelOfDetail: string, reference: string, acceso: string): number {
    const base = 2;
    const detailMult: Record<string, number> = { breve: 1.0, medio: 1.4, detallado: 1.9 };
    let cost = Math.ceil(base * (detailMult[levelOfDetail] || 1.4) + (reference.length > 100 ? 1 : 0));
    if (acceso === 'public') {
      cost = Math.ceil(cost * 0.5);
    }
    return cost;
  },

  estimateFlashcardCost(quantity: number, reference: string, acceso: string): number {
    const base = 2;
    const cardCost = quantity * 0.4;
    let cost = Math.ceil(base + cardCost + (reference.length > 100 ? 1 : 0));
    if (acceso === 'public') {
      cost = Math.ceil(cost * 0.5);
    }
    return cost;
  },
};
