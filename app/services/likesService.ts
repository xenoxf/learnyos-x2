/**
 * LikesService - Handles likes for exams, flashcards, and notes
 */
import { LikeStatus, LikeInfo } from "@/types";
import { httpClient } from "./client";

export const likesService = {
  toggleExamLike(id: number): Promise<LikeStatus> {
    return httpClient.request<LikeStatus>(`/likes/exams/${id}`, { method: "POST" });
  },
  toggleFlashcardLike(id: number): Promise<LikeStatus> {
    return httpClient.request<LikeStatus>(`/likes/flashcards/${id}`, { method: "POST" });
  },
  toggleNoteLike(id: number): Promise<LikeStatus> {
    return httpClient.request<LikeStatus>(`/likes/notes/${id}`, { method: "POST" });
  },
  getExamLikes(id: number): Promise<LikeInfo> {
    return httpClient.request<LikeInfo>(`/likes/exams/${id}`, { method: "GET" });
  },
  getFlashcardLikes(id: number): Promise<LikeInfo> {
    return httpClient.request<LikeInfo>(`/likes/flashcards/${id}`, { method: "GET" });
  },
  getNoteLikes(id: number): Promise<LikeInfo> {
    return httpClient.request<LikeInfo>(`/likes/notes/${id}`, { method: "GET" });
  },
};
