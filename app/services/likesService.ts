/**
 * LikesService - Handles likes for exams, flashcards, and notes
 */
import { httpClient } from "./client";

export const likesService = {
  toggleExamLike(id: number): Promise<{ liked: boolean; count: number }> {
    return httpClient.request(`/likes/exams/${id}`, { method: "POST" });
  },
  toggleFlashcardLike(id: number): Promise<{ liked: boolean; count: number }> {
    return httpClient.request(`/likes/flashcards/${id}`, { method: "POST" });
  },
  toggleNoteLike(id: number): Promise<{ liked: boolean; count: number }> {
    return httpClient.request(`/likes/notes/${id}`, { method: "POST" });
  },
  getExamLikes(id: number): Promise<{ count: number; userLiked: boolean }> {
    return httpClient.request(`/likes/exams/${id}`, { method: "GET" });
  },
  getFlashcardLikes(id: number): Promise<{ count: number; userLiked: boolean }> {
    return httpClient.request(`/likes/flashcards/${id}`, { method: "GET" });
  },
  getNoteLikes(id: number): Promise<{ count: number; userLiked: boolean }> {
    return httpClient.request(`/likes/notes/${id}`, { method: "GET" });
  },
};
