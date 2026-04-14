/**
 * NotesService - Handles notes CRUD and generation
 */
import { httpClient } from "./client";
import type { NoteDeck, NoteKlek, GenerateNoteData, GenerateNotesResponse } from "@/types";

export const notesService = {
  getNotes(): Promise<NoteDeck[]> {
    return httpClient.request<NoteDeck[]>("/notes", { method: "GET" });
  },

  getNotesPublic(): Promise<NoteDeck[]> {
    const cached = httpClient.getCache<NoteDeck[]>("notes_public");
    if (cached) return Promise.resolve(cached);
    return httpClient.request<NoteDeck[]>("/notes/public", { method: "GET" }).then(data => {
      httpClient.setCache("notes_public", data);
      return data;
    });
  },

  getNotesPrivate(): Promise<NoteDeck[]> {
    return httpClient.request<NoteDeck[]>("/notes/private", { method: "GET" });
  },

  searchNotes(query: string, limit = 30, offset = 0, searchInContent = true): Promise<NoteDeck[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset), searchInContent: String(searchInContent) });
    return httpClient.debounceSearch<NoteDeck[]>(`/notes/search?${params}`, { method: "GET" });
  },

  getNote(id: number): Promise<NoteKlek> {
    return httpClient.request<NoteKlek>(`/notes/${id}`, { method: "GET" });
  },

  async generateNote(data: GenerateNoteData): Promise<GenerateNotesResponse> {
    const reference = [data.reference, data.referenceText, data.topic].map(s => typeof s === "string" ? s.trim() : "").find(s => s.length > 0) ?? "";
    if (!reference) throw new Error("Debes enviar reference, referenceText o topic");
    const raw = await httpClient.request<{ success?: boolean; notes?: NoteDeck[]; data?: NoteDeck[]; message?: string }>("/notes/generate/topic_or_reference", {
      method: "POST",
      body: JSON.stringify({ reference, numberOfNotes: data.numberOfNotes, levelOfDetail: data.levelOfDetail, acceso: data.acceso }),
    });
    return { success: raw.success ?? true, notes: raw.notes ?? raw.data ?? [], message: raw.message, data: raw.data };
  },

  deleteNote(id: number): Promise<void> {
    return httpClient.request<void>(`/notes/${id}`, { method: "DELETE" });
  },

  createNote(data: Partial<NoteKlek>): Promise<NoteKlek> {
    return httpClient.requestWithFallback<NoteKlek>(["/notes", "/notes/create"], { method: "POST", body: JSON.stringify(data) });
  },

  updateNote(id: number, data: Partial<NoteKlek>): Promise<NoteKlek> {
    return httpClient.requestWithFallback<NoteKlek>([`/notes/${id}`, `/notes/update/${id}`], { method: "PATCH", body: JSON.stringify(data) });
  },

  deleteAllNotes(): Promise<void> {
    return httpClient.request<void>("/notes/all", { method: "DELETE" });
  },

  getNoteLocked(id: number): Promise<NoteKlek> {
    return httpClient.request<NoteKlek>(`/notes/locked/${id}`, { method: "GET" });
  },
};
