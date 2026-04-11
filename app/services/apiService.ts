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
const API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY;

// Cache for GET requests to reduce API calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class ApiService {
  private token: string | null = null;
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private searchTimeouts = new Map<string, NodeJS.Timeout>();

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

  // Cache management
  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(key: string, data: T, expiresIn: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // Debounced search for specific endpoints
  private debounceSearch<T>(
    endpoint: string, 
    options: RequestInit,
    delay: number = 500
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Clear existing timeout
      const existingTimeout = this.searchTimeouts.get(endpoint);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(async () => {
        try {
          this.searchTimeouts.delete(endpoint);
          const result = await this.request<T>(endpoint, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);

      this.searchTimeouts.set(endpoint, timeout);
    });
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
      // Intentar parsear el error como JSON
      const errorData = await response.json().catch(() => ({}));
      
      // Si el error tiene estructura de ApiErrorResponse, lo propagamos completo
      if (errorData.message || errorData.details || errorData.errorCode) {
        const error = new Error(errorData.message || 'Error en la solicitud');
        (error as any).response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        };
        throw error;
      }
      
      // Fallback para errores tradicionales
      const errorMessage =
        (errorData as Record<string, unknown>).message ||
        (errorData as Record<string, unknown>).error ||
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
      // Ensure user object has isGuest explicitly set to false
      const userWithGuestFlag = { ...user, isGuest: false };
      localStorage.setItem("user", JSON.stringify(userWithGuestFlag));
      localStorage.removeItem("isGuest");
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
      // Ensure user object has isGuest explicitly set to false
      const userWithGuestFlag = { ...user, isGuest: false };
      localStorage.setItem("user", JSON.stringify(userWithGuestFlag));
      localStorage.removeItem("isGuest");
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
      localStorage.removeItem("isGuest");
    }
  }

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const pass = await this.verifyToken();
    return pass;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }
      
      const result = await this.request<{ valid: boolean }>(
        "/auth/verify_token",
        {
          method: "GET",
        },
      );
      return result.valid === true;
    } catch (error) {
      // If token is invalid or expired, clear it
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isGuest");
        this.token = null;
      }
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
        const userWithGuestFlag = { ...response.user, isGuest: false };
        localStorage.setItem("user", JSON.stringify(userWithGuestFlag));
        localStorage.removeItem("isGuest");
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
        const userWithGuestFlag = { ...response.user, isGuest: false };
        localStorage.setItem("user", JSON.stringify(userWithGuestFlag));
        localStorage.removeItem("isGuest");
      }
    }
    return response;
  }

  async loginAsGuest(): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/guest", {
      method: "POST",
    });
    if (response.token && response.user) {
      this.setToken(response.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("isGuest", "true");
      }
    }
    return response;
  }

  isGuest(): boolean {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) return true;
    try {
      const user = JSON.parse(userStr);
      return user?.isGuest === true;
    } catch {
      return true;
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  // ==================== NOTES ====================

  async getNotes(): Promise<NoteDeck[]> {
    return this.request<NoteDeck[]>("/notes", { method: "GET" });
  }

  async getNotesPublic(): Promise<NoteDeck[]> {
    const cacheKey = 'notes_public';
    const cached = this.getCache<NoteDeck[]>(cacheKey);
    if (cached) return cached;
    
    const data = await this.request<NoteDeck[]>("/notes/public", { method: "GET" });
    this.setCache(cacheKey, data, 120000); // Cache for 2 minutes
    return data;
  }

  async getNotesPrivate(): Promise<NoteDeck[]> {
    return this.request<NoteDeck[]>("/notes/private", { method: "GET" });
  }

  async searchNotes(
    query: string,
    limit: number = 30,
    offset: number = 0,
    searchInContent: boolean = true,
  ): Promise<NoteDeck[]> {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      offset: String(offset),
      searchInContent: String(searchInContent),
    });
    const endpoint = `/notes/search?${params.toString()}`;
    return this.debounceSearch<NoteDeck[]>(endpoint, { method: "GET" }, 500);
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

  async deleteAllNotes(): Promise<void> {
    await this.request<void>('/notes/all', {
      method: 'DELETE'
    });
  }

  // ==================== FLASHCARDS ====================

  async getFlashcards(): Promise<CardsDeck[]> {
    return this.request<CardsDeck[]>("/flash-cards", { method: "GET" });
  }

  async getFlashcardsPublic(): Promise<CardsDeck[]> {
    const cacheKey = 'flashcards_public';
    const cached = this.getCache<CardsDeck[]>(cacheKey);
    if (cached) return cached;
    
    const data = await this.request<CardsDeck[]>("/flash-cards/public", { method: "GET" });
    this.setCache(cacheKey, data, 120000); // Cache for 2 minutes
    return data;
  }

  async getFlashcardsPrivate(): Promise<CardsDeck[]> {
    return this.request<CardsDeck[]>("/flash-cards/private", { method: "GET" });
  }

  async searchFlashcards(
    query: string,
    limit: number = 30,
    offset: number = 0,
    searchInCards: boolean = true,
  ): Promise<CardsDeck[]> {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      offset: String(offset),
      searchInCards: String(searchInCards),
    });
    const endpoint = `/flash-cards/search?${params.toString()}`;
    return this.debounceSearch<CardsDeck[]>(endpoint, { method: "GET" }, 500);
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

  /** @deprecated Use getFlashcardsPrivate instead */
  async getCardsPrivates(): Promise<CardsDeck[]> {
    return this.getFlashcardsPrivate();
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

  async deleteAllCards(): Promise<void> {
    await this.request<void>('/flash-cards/all', {method: 'DELETE'});
  }

  // ==================== EXAMS ====================

  async getExams(): Promise<ExamDeck[]> {
    return this.request<ExamDeck[]>("/exams", { method: "GET" });
  }

  async getExamsPublic(): Promise<ExamDeck[]> {
    const cacheKey = 'exams_public';
    const cached = this.getCache<ExamDeck[]>(cacheKey);
    if (cached) return cached;
    
    const data = await this.request<ExamDeck[]>("/exams/public", { method: "GET" });
    this.setCache(cacheKey, data, 120000); // Cache for 2 minutes
    return data;
  }

  async getExamsPrivate(): Promise<ExamDeck[]> {
    return this.request<ExamDeck[]>("/exams/private", { method: "GET" });
  }

  async getExamsOnly(): Promise<ExamDeck[]> {
    return this.request<ExamDeck[]>("/exams/deck", { method: "GET" });
  }

  async searchExams(
    query: string,
    limit: number = 30,
    offset: number = 0,
    searchInQuestions: boolean = true,
  ): Promise<ExamDeck[]> {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      offset: String(offset),
      searchInQuestions: String(searchInQuestions),
    });
    const endpoint = `/exams/search?${params.toString()}`;
    return this.debounceSearch<ExamDeck[]>(endpoint, { method: "GET" }, 500);
  }

  async getExam(id: number): Promise<ExamKlek> {
    return this.request<ExamKlek>(`/exams/${id}`, { method: "GET" });
  }

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

  async deleteAllExams():Promise<void> {
    await this.request<void>('/exams/all', {method: 'DELETE'});
  }

  // ==================== EXAMS LOCKED ====================

  async getExamLocked(id: number): Promise<ExamKlek> {
    return this.request<ExamKlek>(`/exams/locked/${id}`, { method: "GET" });
  }

  // ==================== FLASHCARDS LOCKED ====================

  async getCardLocked(id: number): Promise<CardKlek> {
    return this.request<CardKlek>(`/flash-cards/locked/${id}`, { method: "GET" });
  }

  // ==================== NOTES LOCKED ====================

  async getNoteLocked(id: number): Promise<NoteKlek> {
    return this.request<NoteKlek>(`/notes/locked/${id}`, { method: "GET" });
  }

  // ==================== LIKES ====================

  async toggleExamLike(id: number): Promise<{ liked: boolean; count: number }> {
    return this.request<{ liked: boolean; count: number }>(`/likes/exams/${id}`, { method: "POST" });
  }

  async toggleFlashcardLike(id: number): Promise<{ liked: boolean; count: number }> {
    return this.request<{ liked: boolean; count: number }>(`/likes/flashcards/${id}`, { method: "POST" });
  }

  async toggleNoteLike(id: number): Promise<{ liked: boolean; count: number }> {
    return this.request<{ liked: boolean; count: number }>(`/likes/notes/${id}`, { method: "POST" });
  }

  async getExamLikes(id: number): Promise<{ count: number; userLiked: boolean }> {
    return this.request<{ count: number; userLiked: boolean }>(`/likes/exams/${id}`, { method: "GET" });
  }

  async getFlashcardLikes(id: number): Promise<{ count: number; userLiked: boolean }> {
    return this.request<{ count: number; userLiked: boolean }>(`/likes/flashcards/${id}`, { method: "GET" });
  }

  async getNoteLikes(id: number): Promise<{ count: number; userLiked: boolean }> {
    return this.request<{ count: number; userLiked: boolean }>(`/likes/notes/${id}`, { method: "GET" });
  }

  // ==================== EXAM ATTEMPTS ====================

  async recordExamAttempt(data: { examId: number; correctAnswers: number; totalQuestions: number; examTitle: string }): Promise<void> {
    await this.request<void>("/exam-attempts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getExamAttempts(): Promise<any[]> {
    return this.request<any[]>("/exam-attempts", { method: "GET" });
  }

  async getExamAttemptStats(): Promise<{ totalAttempts: number; avgCorrect: number; bestScore: number; totalQuestions: number }> {
    return this.request("/exam-attempts/stats", { method: "GET" });
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

  /**
   * Send message with streaming response (SSE)
   * Returns an AsyncIterable of StreamChunk objects
   */
  async *sendMessageStream(data: SendMessageData): AsyncIterable<import("@/types").StreamChunk> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };
    if (API_KEY) {
      (headers as Record<string, string>)["x-api-key"] = API_KEY;
    }
    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/messages/send/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Streaming not soportado en este navegador");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              yield parsed as import("@/types").StreamChunk;
            } catch {
              // Ignore malformed SSE events
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async deleteChat(chatId: number): Promise<void> {
    await this.request<void>(`/messages/chat/${chatId}`, { method: "DELETE" });
  }

  async deleteAllChats(): Promise<void> {
    await this.request<void>('/messages/chat/all', {method: 'DELETE'});
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

  // ==================== CREDITS ====================

  async getCreditsStatus(): Promise<{
    remaining: number;
    total: number;
    used: number;
    percentageUsed: number;
    breakdown: {
      examGenerations: number;
      noteGenerations: number;
      flashcardGenerations: number;
      chatMessages: number;
    };
    costs: {
      EXAM_GENERATION: number;
      NOTE_GENERATION: number;
      FLASHCARD_GENERATION: number;
      CHAT_MESSAGE: number;
    };
  }> {
    return this.request("/credits/status", {
      method: "GET",
    });
  }

  /**
   * Estimate credit cost for generating content (preview before generation)
   */
  estimateExamCost(numberOfQuestions: number, difficulty: string, reference: string): number {
    const base = 3;
    const questionCost = numberOfQuestions * 0.5;
    const diffMult: Record<string, number> = { easy: 1.0, medium: 1.3, hard: 1.7 };
    const topicExtra = reference.length > 100 ? 1 : 0;
    return Math.ceil((base + questionCost) * (diffMult[difficulty] || 1.3) + topicExtra);
  }

  estimateNoteCost(levelOfDetail: string, reference: string): number {
    const base = 2;
    const detailMult: Record<string, number> = { breve: 1.0, medio: 1.4, detallado: 1.9 };
    const topicExtra = reference.length > 100 ? 1 : 0;
    return Math.ceil(base * (detailMult[levelOfDetail] || 1.4) + topicExtra);
  }

  estimateFlashcardCost(quantity: number, reference: string): number {
    const base = 2;
    const cardCost = quantity * 0.4;
    const topicExtra = reference.length > 100 ? 1 : 0;
    return Math.ceil(base + cardCost + topicExtra);
  }

  // ==================== HELPER METHODS ====================
}

export const apiService = new ApiService();
