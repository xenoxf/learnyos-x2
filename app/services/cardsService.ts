/**
 * CardsService - Handles flashcards CRUD and generation
 */
import { httpClient } from "./client";
import type { CardsDeck, CardKlek, GenerateFlashCardData, ReviewResult, DueReviewDeck, ReviewStats } from "@/types";

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
    const payload: Record<string, unknown> = { reference: data.reference, quantity: data.quantity };
    if (data.acceso) payload.acceso = data.acceso;
    return httpClient.request<any>("/flash-cards/generate/topic_or_reference", { method: "POST", body: JSON.stringify(payload) });
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

  reviewFlashcard(flashcardId: number, quality: number): Promise<ReviewResult> {
    return httpClient.request<ReviewResult>(`/flash-cards/${flashcardId}/review`, { method: "POST", body: JSON.stringify({ quality }) });
  },

  getDueReviews(): Promise<DueReviewDeck[]> {
    return httpClient.request<DueReviewDeck[]>("/flash-cards/reviews/today", { method: "GET" });
  },

  getReviewStats(): Promise<ReviewStats> {
    return httpClient.request<ReviewStats>("/flash-cards/reviews/stats", { method: "GET" });
  },

  addFlashcardsToDeck(deckId: number, flashcards: Array<{ front: string; back: string; hint?: string }>): Promise<any> {
    return httpClient.request<any>(`/flash-cards/${deckId}/cards`, { method: "POST", body: JSON.stringify({ flashcards }) });
  },
};
