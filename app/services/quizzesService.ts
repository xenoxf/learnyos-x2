/**
 * QuizzesService - Handles exams/quizzes CRUD and generation
 */
import { httpClient } from "./client";
import type { ExamDeck, ExamKlek, GenerateExamData } from "@/types";

export const quizzesService = {
  getExams(): Promise<ExamDeck[]> {
    return httpClient.request<ExamDeck[]>("/exams", { method: "GET" });
  },

  getExamsPublic(): Promise<ExamDeck[]> {
    const cached = httpClient.getCache<ExamDeck[]>("exams_public");
    if (cached) return Promise.resolve(cached);
    return httpClient.request<ExamDeck[]>("/exams/public", { method: "GET" }).then(data => {
      httpClient.setCache("exams_public", data);
      return data;
    });
  },

  getExamsPrivate(): Promise<ExamDeck[]> {
    return httpClient.request<ExamDeck[]>("/exams/private", { method: "GET" });
  },

  getExamsOnly(): Promise<ExamDeck[]> {
    return httpClient.request<ExamDeck[]>("/exams/deck", { method: "GET" });
  },

  searchExams(query: string, limit = 30, offset = 0, searchInQuestions = true): Promise<ExamDeck[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset), searchInQuestions: String(searchInQuestions) });
    return httpClient.debounceSearch<ExamDeck[]>(`/exams/search?${params}`, { method: "GET" });
  },

  getExam(id: number): Promise<ExamKlek> {
    return httpClient.request<ExamKlek>(`/exams/${id}`, { method: "GET" });
  },

  getExamForPlay(id: number): Promise<ExamKlek> {
    return httpClient.request<ExamKlek>(`/exams/play/${id}`, { method: "GET" });
  },

  generateExam(data: GenerateExamData): Promise<ExamKlek> {
    return httpClient.request<ExamKlek>("/exams/generate/topic_or_reference", { method: "POST", body: JSON.stringify(data) });
  },

  updateExamScore(id: number, score: number): Promise<ExamDeck[]> {
    const params = new URLSearchParams({ id: String(id), score: String(score) });
    return httpClient.request<ExamDeck[]>(`/exams/score?${params}`, { method: "GET" });
  },

  deleteExam(id: number): Promise<void> {
    return httpClient.request<void>(`/exams/${id}`, { method: "DELETE" });
  },

  deleteAllExams(): Promise<void> {
    return httpClient.request<void>("/exams/all", { method: "DELETE" });
  },

  getExamLocked(id: number): Promise<ExamKlek> {
    return httpClient.request<ExamKlek>(`/exams/locked/${id}`, { method: "GET" });
  },
};
