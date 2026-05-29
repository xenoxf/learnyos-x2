/**
 * CardsService - Handles flashcards CRUD and generation
 */
import { httpClient } from "./client";
import type { CardsDeck, CardKlek, GenerateFlashCardData } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const API_KEY = String(process.env.NEXT_PUBLIC_BACKEND_API_KEY || "");

export const cardsService = {
  getFlashcards(): Promise<CardsDeck[]> {
    return httpClient.request<CardsDeck[]>("/flash-cards", { method: "GET" });
  },

  getFlashcardsPublic(): Promise<CardsDeck[]> {
    const cached = httpClient.getCache<CardsDeck[]>("flashcards_public");
    if (cached) return Promise.resolve(cached);
    return httpClient.request<CardsDeck[]>("/flash-cards/public", { method: "GET" }).then(data => {
      httpClient.setCache("flashcards_public", data);
      return data;
    });
  },

  getFlashcardsPrivate(): Promise<CardsDeck[]> {
    return httpClient.request<CardsDeck[]>("/flash-cards/private", { method: "GET" });
  },

  searchFlashcards(query: string, limit = 30, offset = 0, searchInCards = true): Promise<CardsDeck[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset), searchInCards: String(searchInCards) });
    return httpClient.debounceSearch<CardsDeck[]>(`/flash-cards/search?${params}`, { method: "GET" });
  },

  getFlashcard(id: number): Promise<CardKlek> {
    return httpClient.request<CardKlek>(`/flash-cards/${id}`, { method: "GET" });
  },

  getCardKlek(id: number): Promise<CardKlek> {
    return httpClient.request<CardKlek>(`/flash-cards/klek/${id}`, { method: "GET" });
  },

  generateFlashcards(data: GenerateFlashCardData): Promise<any> {
    if (data.files && data.files.length > 0) {
      return this.generateFlashcardsFromFile(data);
    }
    if (data.file) {
      return this.generateFlashcardsFromFile(data);
    }
    const payload: Record<string, unknown> = { reference: data.reference, quantity: data.quantity };
    if (data.acceso) payload.acceso = data.acceso;
    return httpClient.request<any>("/flash-cards/generate/topic_or_reference", { method: "POST", body: JSON.stringify(payload) });
  },

  async generateFlashcardsFromFile(data: GenerateFlashCardData): Promise<any> {
    const token = httpClient.getToken();
    const formData = new FormData();
    const files = data.files && data.files.length > 0 ? data.files : (data.file ? [data.file] : []);
    files.forEach(f => formData.append("files", f));
    formData.append("reference", data.reference || "");
    formData.append("quantity", String(data.quantity || 5));
    formData.append("acceso", data.acceso || "public");

    const headers: Record<string, string> = {};
    if (API_KEY) headers["x-api-key"] = API_KEY;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/flash-cards/generate/from-file`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Error: ${response.status}`);
    }

    return response.json();
  },

  getCardsPublic(): Promise<CardsDeck[]> {
    return httpClient.request<CardsDeck[]>("/flash-cards/public", { method: "GET" });
  },

  /** @deprecated Use getFlashcardsPrivate instead */
  getCardsPrivates(): Promise<CardsDeck[]> {
    return this.getFlashcardsPrivate();
  },

  createCard(data: Partial<CardKlek>): Promise<CardKlek> {
    return httpClient.requestWithFallback<CardKlek>(["/flash-cards", "/flash-cards/create"], { method: "POST", body: JSON.stringify(data) });
  },

  updateCard(id: number, data: Partial<CardKlek>): Promise<CardKlek> {
    return httpClient.requestWithFallback<CardKlek>([`/flash-cards/${id}`, `/flash-cards/update/${id}`], { method: "PATCH", body: JSON.stringify(data) });
  },

  deleteCard(id: number): Promise<void> {
    return httpClient.request<void>(`/flash-cards/${id}`, { method: "DELETE" });
  },

  deleteAllCards(): Promise<void> {
    return httpClient.request<void>("/flash-cards/all", { method: "DELETE" });
  },

  getCardLocked(id: number): Promise<CardKlek> {
    return httpClient.request<CardKlek>(`/flash-cards/locked/${id}`, { method: "GET" });
  },
};
