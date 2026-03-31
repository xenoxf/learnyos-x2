import {
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
  type User,
  type NoteDeck,
  type NoteKlek,
  type CardsDeck,
  type CardKlek,
  type ExamDeck,
  type ExamKlek,
  type GenerateExamData,
  type GenerateFlashCardData,
  type Chat,
  type ChatMessage,
  type SendMessageData,
  type SendMessageResponse,
  type GetChatMessagesResponse,
  type GenerateNoteData,
  type GenerateNotesResponse,
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
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken && storedToken !== this.token) {
        this.token = storedToken;
      }
    }
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
      const errorMessage =
        (error as Record<string, unknown>).message ||
        (error as Record<string, unknown>).error ||
        `Error: ${response.status} ${response.statusText}`;
      throw new Error(String(errorMessage));
    }

    // Endpoints DELETE/PUT pueden devolver 204 sin body
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return undefined as T;
    }

    // the only cast we keep is here, once, inside request
    return (await response.json()) as T;
  }

  private async requestWithFallback<T>(
    endpoints: string[],
    options: RequestInit = {},
  ): Promise<T> {
    let lastError: unknown = null;
    for (const endpoint of endpoints) {
      try {
        return await this.request<T>(endpoint, options);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("No se pudo completar la solicitud");
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
    // Backend only supports updating name via /users/name endpoint
    if (data.name) {
      const response = await this.request<User>("/users/name", {
        method: "PUT",
        body: JSON.stringify(data.name),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response));
      }
      return response;
    }
    // If no name provided, return current user without making API call
    return this.getUser() as User;
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

  async getNotes(): Promise<NoteDeck[]> {
    return this.request<NoteDeck[]>("/notes", { method: "GET" });
  }

  async getNotesPublic(): Promise<NoteDeck[]> {
    return this.request<NoteDeck[]>("/notes/public", { method: "GET" });
  }

  async getNotesPrivate(): Promise<NoteDeck[]> {
    return this.request<NoteDeck[]>("/notes/private", { method: "GET" });
  }

  async getNote(id: number): Promise<NoteKlek> {
    return this.request<NoteKlek>(`/notes/${id}`, { method: "GET" });
  }

  async generateNote(data: GenerateNoteData): Promise<GenerateNotesResponse> {
    const reference =
      [data.reference, data.referenceText, data.topic]
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .find((s) => s.length > 0) ?? "";
    if (!reference) {
      throw new Error("Debes enviar reference, referenceText o topic");
    }
    const payload = {
      reference,
      numberOfNotes: data.numberOfNotes,
      levelOfDetail: data.levelOfDetail,
      acceso: data.acceso,
    };
    const raw = await this.request<{
      success?: boolean;
      notes?: NoteDeck[];
      data?: NoteDeck[];
      message?: string;
    }>("/notes/generate/topic_or_reference", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const notes = raw.notes ?? raw.data ?? [];
    return {
      success: raw.success ?? true,
      notes,
      message: raw.message,
      data: raw.data,
    };
  }

  async deleteNote(id: number): Promise<void> {
    await this.request<void>(`/notes/${id}`, { method: "DELETE" });
  }

  async createNote(data: Partial<NoteKlek>): Promise<NoteKlek> {
    return this.requestWithFallback<NoteKlek>(["/notes", "/notes/create"], {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateNote(id: number, data: Partial<NoteKlek>): Promise<NoteKlek> {
    return this.requestWithFallback<NoteKlek>(
      [`/notes/${id}`, `/notes/update/${id}`],
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  }

  // ==================== FLASHCARDS ====================

  async getFlashcards(): Promise<CardsDeck[]> {
    return this.request<CardsDeck[]>("/flash-cards", { method: "GET" });
  }

  async getFlashcardsPublic(): Promise<CardsDeck[]> {
    return this.request<CardsDeck[]>("/flash-cards/public", { method: "GET" });
  }

  async getFlashcardsPrivate(): Promise<CardsDeck[]> {
    return this.request<CardsDeck[]>("/flash-cards/private", { method: "GET" });
  }

  async getFlashcard(id: number): Promise<CardKlek> {
    return this.request<CardKlek>(`/flash-cards/${id}`, { method: "GET" });
  }

  async getCardKlek(id: number): Promise<CardKlek> {
    return this.request<CardKlek>(`/flash-cards/klek/${id}`, { method: "GET" });
  }

  async generateFlashcards(data: GenerateFlashCardData): Promise<string[]> {
    const payload: Record<string, unknown> = {
      reference: data.reference,
      quantity: data.quantity,
    };

    if (data.acceso) {
      payload.acceso = data.acceso;
    }

    return this.request<string[]>("/flash-cards/generate/topic_or_reference", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getCardsPublic(): Promise<CardsDeck[]> {
    return await this.request<CardsDeck[]>("/flash-cards/public", {
      method: "GET",
    });
  }

  async getCardsPrivates(): Promise<CardsDeck[]> {
    return await this.request<CardsDeck[]>("/flash-cards/private", {
      method: "GET",
    });
  }

  async createCard(data: Partial<CardKlek>): Promise<CardKlek> {
    return this.requestWithFallback<CardKlek>(["/flash-cards", "/flash-cards/create"], {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCard(id: number, data: Partial<CardKlek>): Promise<CardKlek> {
    return this.requestWithFallback<CardKlek>(
      [`/flash-cards/${id}`, `/flash-cards/update/${id}`],
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  }

  async deleteCard(id: number): Promise<void> {
    await this.request<void>(`/flash-cards/${id}`, { method: "DELETE" });
  }

  // ==================== EXAMS ====================

  async getExams(): Promise<ExamDeck[]> {
    return this.request<ExamDeck[]>("/exams", { method: "GET" });
  }

  async getExamsPublic(): Promise<ExamDeck[]> {
    return this.request<ExamDeck[]>("/exams/public", { method: "GET" });
  }

  async getExamsPrivate(): Promise<ExamDeck[]> {
    return this.request<ExamDeck[]>("/exams/private", { method: "GET" });
  }

  async getExamsOnly(): Promise<ExamDeck[]> {
    return this.request<ExamDeck[]>("/exams/deck", { method: "GET" });
  }

  async getExam(id: number): Promise<ExamKlek> {
    return this.request<ExamKlek>(`/exams/${id}`, { method: "GET" });
  }

  /**
   * Get exam for playing (klek format) - includes questions
   * Use this when opening a quiz to play, not for deck listing
   */
  async getExamForPlay(id: number): Promise<ExamKlek> {
    return this.request<ExamKlek>(`/exams/play/${id}`, { method: "GET" });
  }

  async generateExam(data: GenerateExamData): Promise<ExamKlek> {
    return this.request<ExamKlek>("/exams/generate/topic_or_reference", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateExamScore(id: number, score: number): Promise<ExamDeck[]> {
    const params = new URLSearchParams({
      id: String(id),
      score: String(score),
    });
    return this.request<ExamDeck[]>(`/exams/score?${params}`, {
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

  // ==================== GLOBAL CHAT ====================

  async getGlobalChatMessages(limit?: number): Promise<import("@/types/globalChat").GlobalChatMessage[]> {
    const url = limit ? `/global-chat/messages?limit=${limit}` : '/global-chat/messages';
    return this.request<import("@/types/globalChat").GlobalChatMessage[]>(url, {
      method: "GET",
    });
  }

  async sendGlobalChatMessage(content: string): Promise<import("@/types/globalChat").GlobalChatMessage> {
    return this.request<import("@/types/globalChat").GlobalChatMessage>("/global-chat/message", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async deleteGlobalChatMessage(id: number): Promise<void> {
    await this.request<void>(`/global-chat/message/${id}`, { method: "DELETE" });
  }

  // ==================== HELPER METHODS ====================
}

export const apiService = new ApiService();
