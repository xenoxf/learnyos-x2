"use client";

import {
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
  type User,
  type Note,
  type FlashCard,
  type GenerateFlashCardData,
  type Card,
  type Exam,
  type GenerateExamData,
  type Chat,
  type ChatMessage,
  type SendMessageData,
  type SendMessageResponse,
  type GetChatMessagesResponse,
  type GenerateNoteData,
  type GenerateNotesResponse,
  type ExamDeck,
  CardsDeck,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_KEY = process.env.NEXT_BACKEND_API_KEY;

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  private getToken(): string | null {
    return this.token;
  }

  // make the request method generic so callers get a typed return value without casting
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (API_KEY) {
      (headers as Record<string, string>)["x-api-key"] = API_KEY;
    }

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        ((error as Record<string, unknown>).message as string) ||
          `API Error: ${response.statusText}`,
      );
    }

    // the only cast we keep is here, once, inside request
    return (await response.json()) as T;
  }

  // ==================== AUTH ====================

  async login(credentials: LoginInput): Promise<AuthResponse> {
    const { token, user } = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!token || !user) {
      throw new Error("Invalid login response: missing token or user");
    }

    this.setToken(token);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { token, user };
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const { token, user } = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!token || !user) {
      throw new Error("Invalid register response: missing token or user");
    }

    this.setToken(token);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { token, user };
  }

  async updateUser(data: Partial<User>): Promise<User> {
    const response = await this.request<User>("/users", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(response));
    }
    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async verifyToken(): Promise<boolean> {
    try {
      const result = await this.request<{ valid: boolean }>(
        "/auth/verify_token",
        {
          method: "GET",
        },
      );
      return result.valid === true;
    } catch (error) {
      return false;
    }
  }

  async getGoogleAuthUrl(): Promise<{ url: string }> {
    return this.request<{ url: string }>("/auth/google/url", { method: "GET" });
  }

  async googleAuthWithCode(code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/google/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    if (response.token && response.user) {
      this.setToken(response.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    }
    return response;
  }

  async loginWithGoogle(googleToken: {
    idToken: string;
    email: string;
    name: string;
    googleId: string;
  }): Promise<AuthResponse> {
    const response = (await this.request("/auth/google", {
      method: "POST",
      body: JSON.stringify(googleToken),
    })) as AuthResponse;

    if (response.token) {
      this.setToken(response.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    }
    return response;
  }

  // ==================== NOTES ====================

  async getNotes(): Promise<Note[]> {
    return this.request<Note[]>("/notes", { method: "GET" });
  }

  async getNote(id: number): Promise<Note> {
    return this.request<Note>(`/notes/${id}`, { method: "GET" });
  }

  async generateNote(data: GenerateNoteData): Promise<GenerateNotesResponse> {
    return this.request<GenerateNotesResponse>(
      "/notes/generate/topic_or_reference",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async deleteNote(id: number): Promise<void> {
    await this.request<void>(`/notes/${id}`, { method: "DELETE" });
  }

  // ==================== FLASHCARDS ====================

  async getFlashcards(): Promise<Card[]> {
    return this.request<Card[]>("/flash-cards", { method: "GET" });
  }

  async getFlashcard(id: number): Promise<Card> {
    return this.request<Card>(`/flash-cards/${id}`, { method: "GET" });
  }

  async generateFlashcards(data: GenerateFlashCardData): Promise<Card> {
    const payload: Record<string, unknown> = {
      topic: data.topic,
      referenceText: data.referenceText,
      quantity: data.quantity,
    };

    if (data.level) {
      payload.level = data.level;
    }

    return this.request<Card>("/flash-cards/generate/topic_or_reference", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getCardsOnly(): Promise<CardsDeck[]> {
    return await this.request<CardsDeck[]>("/flash-cards/only", {
      method: "GET",
    });
  }

  async deleteFlashcard(id: number): Promise<void> {
    await this.request<void>(`/flash-cards/${id}`, { method: "DELETE" });
  }

  async deleteCard(id: number): Promise<void> {
    await this.request<void>(`/flash-cards/card/${id}`, { method: "DELETE" });
  }

  // ==================== EXAMS ====================

  async getExams(): Promise<Exam[]> {
    return this.request<Exam[]>("/exams", { method: "GET" });
  }

  async getExamsOnly(): Promise<ExamDeck[]> {
    return this.request<ExamDeck[]>("/exams/deck", { method: "GET" });
  }

  async getExam(id: number): Promise<Exam> {
    return this.request<Exam>(`/exams/${id}`, { method: "GET" });
  }

  async generateExam(data: GenerateExamData): Promise<Exam> {
    return this.request<Exam>("/exams/generate/topic_or_reference", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExamScore(id: number, score: number): Promise<Exam[]> {
    const params = new URLSearchParams({
      id: String(id),
      score: String(score),
    });
    return this.request<Exam[]>(`/exams/score?${params}`, {
      method: "GET",
    });
  }

  async deleteExam(id: number): Promise<void> {
    await this.request<void>(`/exams/${id}`, { method: "DELETE" });
  }

  // ==================== CHATS ====================

  async getChats(): Promise<Chat[]> {
    return this.request<Chat[]>("/messages/chats", { method: "GET" });
  }

  async getChat(id: number): Promise<Chat> {
    return this.request<Chat>(`/messages/chat/${id}`, { method: "GET" });
  }

  async createChat(data: { title: string }): Promise<Chat> {
    return this.request<Chat>("/messages/chats", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getChatMessages(chatId: number): Promise<GetChatMessagesResponse> {
    return this.request<GetChatMessagesResponse>(`/messages/chat/${chatId}`, {
      method: "GET",
    });
  }

  async sendMessage(data: SendMessageData): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>("/messages/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteChat(chatId: number): Promise<void> {
    await this.request<void>(`/messages/chat/${chatId}`, { method: "DELETE" });
  }

  // ==================== GROQ (AI) ====================

  async generateWithGroq(prompt: string): Promise<{ content: string }> {
    return this.request<{ content: string }>("/groq/generate", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
  }
}

export const apiService = new ApiService();
