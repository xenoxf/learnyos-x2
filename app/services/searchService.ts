import { httpClient } from "./client";

export interface GlobalSearchResponse {
  q: string;
  exams: Array<{ id: number; title: string; description?: string; acceso?: string; updatedAt?: string | null }>;
  notes: Array<{ id: number; title: string; description?: string; topic?: string; acceso?: string; updatedAt?: string | null }>;
  flashcards: Array<{ id: number; title: string; description?: string; acceso?: string; updatedAt?: string | null }>;
  chats: Array<{ id: number; title: string; updatedAt?: string | null }>;
}

const EMPTY: GlobalSearchResponse = { q: "", exams: [], notes: [], flashcards: [], chats: [] };

export const searchService = {
  globalSearch(q: string, limit = 6): Promise<GlobalSearchResponse> {
    if (!q || q.trim().length < 2) return Promise.resolve(EMPTY);
    const params = new URLSearchParams({ q: q.trim(), limit: String(limit) });
    return httpClient.debounceSearch<GlobalSearchResponse>(
      `/search/global?${params}`,
      { method: "GET" },
      300,
    );
  },
};
