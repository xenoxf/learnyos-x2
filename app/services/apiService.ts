import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  Exam,
  GenerateExamInput,
  GenerateExamResponse,
  Card,
  FlashCard,
  GenerateFlashcardsInput,
  GenerateFlashcardsResponse,
  Note,
  GenerateNoteInput,
  Chat,
  Message,
  SendMessageInput,
  SendMessageResponse,
  User,
} from "@/types";
import { ApiError, parseErrorResponse } from "@/lib/apiErrors";

// ==================== CONFIGURATION ====================

//const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
//const API_KEY = import.meta.env.VITE_API_KEY;
const API_BASE_URL = process.env.VITE_BACKEND_URL;
const API_KEY = process.env.VITE_API_KEY;

// ==================== API SERVICE ====================

export class ApiService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken) {
      this.token = storedToken;
    }

    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("auth_user");
      }
    }
  }

  // ==================== AUTH METHODS ====================

  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      if (!input.email || !input.password) {
        throw new Error("Email y contraseña son requeridos");
      }

      const response = await this.fetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });

      const data: AuthResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      // Validar que la respuesta tenga los datos necesarios
      if (data?.token && data?.user) {
        this.saveAuth(data.token, data.user);
      }

      return data;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      if (!input.email || !input.password || !input.name) {
        throw new Error("Email, contraseña y nombre son requeridos");
      }

      const response = await this.fetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });

      const data: AuthResponse = await response.json();

      // Validar que la respuesta tenga los datos necesarios
      if (data?.token && data?.user) {
        this.saveAuth(data.token, data.user);
      }
      if (!response.ok) {
        throw new Error(data.message || "login failed");
      }

      return data;
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(error.message || "Registration failed");
    }
  }

  async verifyToken(token: string): Promise<{ valid: boolean }> {
    try {
      const response = await this.fetch(`/auth/verify-token/${token}`, {
        method: "GET",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Token verification failed");
    }
  }
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      if (!idToken) {
        throw new Error("ID token es requerido");
      }

      const response = await this.fetch("/auth/google/callback", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });

      const data: AuthResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Google login failed");
      }
      // Validar que la respuesta tenga los datos necesarios
      if (data?.token && data?.user) {
        this.saveAuth(data.token, data.user);
      }

      return data;
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(error.message || "Google login failed");
    }
  }


  // ==================== USER METHODS ====================

  async getProfile(): Promise<User> {
    try {
      return await this.fetchAuth("/users/profile");
    } catch (error: any) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      if (!data || Object.keys(data).length === 0) {
        throw new Error("Debe proporcionar datos para actualizar");
      }
      const response = await this.fetchAuth("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      const datax = await response.json();
      if (!response.ok) {
        throw new Error(datax.message);
      }
      return datax;
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  async deleteAccount(): Promise<{ success: boolean }> {
    try {
      const response = await this.fetchAuth("/users/delete", {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Delete account error:", error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de usuario inválido");
      }
      const response = await this.fetchAuth(`/users/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get user by id error:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.fetchAuth("/users");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get all users error:", error);
      throw error;
    }
  }

  // ==================== PERFIL METHODS ====================

  async getPerfilData(userId?: number): Promise<any> {
    const endpoint = userId ? `/perfil/${userId}` : "/perfil";
    return this.fetchAuth(endpoint);
  }

  async updatePerfilData(data: any): Promise<any> {
    return this.fetchAuth("/perfil", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async createPerfilData(data: any): Promise<any> {
    return this.fetchAuth("/perfil", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== EXAM METHODS ====================

  async getExams(): Promise<Exam[]> {
    try {
      const response = await this.fetchAuth("/exams");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get exams error:", error);
      throw error;
    }
  }

  async getExamById(id: number): Promise<Exam> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de examen inválido");
      }
      const response = await this.fetchAuth(`/exams/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get exam by id error:", error);
      throw error;
    }
  }

  async createExam(data: Partial<Exam>): Promise<Exam> {
    try {
      if (!data || !data.title) {
        throw new Error("Título del examen es requerido");
      }
      const response = await this.fetchAuth("/exams", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const datar = await response.json();
      if (!response.ok) {
        throw new Error(datar.message);
      }
      return datar;
    } catch (error: any) {
      console.error("Create exam error:", error);
      throw error;
    }
  }

  async updateExam(id: number, data: Partial<Exam>): Promise<Exam> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de examen inválido");
      }
      if (!data || Object.keys(data).length === 0) {
        throw new Error("Debe proporcionar datos para actualizar");
      }
      const response = await this.fetchAuth(`/exams/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      const datar = await response.json();
      if (!response.ok) {
        throw new Error(datar.message);
      }
      return datar;
    } catch (error: any) {
      console.error("Update exam error:", error);
      throw error;
    }
  }

  async deleteExam(id: number): Promise<{ success: boolean }> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de examen inválido");
      }
      const response = await this.fetchAuth(`/exams/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Delete exam error:", error);
      throw error;
    }
  }

  async generateExam(input: GenerateExamInput): Promise<GenerateExamResponse> {
    try {
      if (!input.topic && !input.referenceText) {
        throw new Error(
          'Debe proporcionar un "topic" o "referenceText" para generar el examen.',
        );
      }
      const response = await this.fetchAuth(
        "/exams/generate/topic_or_reference",
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Generate exam error:", error);
      throw error;
    }
  }

  // ==================== CARD METHODS ====================

  async createCard(data: {
    title: string;
    description?: string;
  }): Promise<Card> {
    try {
      if (!data || !data.title) {
        throw new Error("Título de la tarjeta es requerido");
      }
      const response = await this.fetchAuth("/flash-cards/cards", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const datar = await response.json();
      if (!response.ok) {
        throw new Error(datar.message);
      }
      return datar;
    } catch (error: any) {
      console.error("Create card error:", error);
      throw error;
    }
  }

  async getCards(filters?: Record<string, any>): Promise<Card[]> {
    try {
      const query = this.buildQuery(filters);
      const response = await this.fetchAuth(`/flash-cards/cards${query}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get cards error:", error);
      throw error;
    }
  }

  async getCardById(id: number): Promise<Card> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de tarjeta inválido");
      }
      const response = await this.fetchAuth(`/flash-cards/cards/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get card by id error:", error);
      throw error;
    }
  }

  async updateCard(id: number, datae: Partial<Card>): Promise<Card> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de tarjeta inválido");
      }
      const response = await this.fetchAuth(`/flash-cards/cards/${id}`, {
        method: "PATCH",
        body: JSON.stringify(datae),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Update card error:", error);
      throw error;
    }
  }

  async deleteCard(id: number): Promise<{ success: boolean }> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de tarjeta inválido");
      }
      const response = await this.fetchAuth(`/flash-cards/cards/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Delete card error:", error);
      throw error;
    }
  }

  // ==================== FLASHCARD METHODS ====================

  async createFlashcard(data: Partial<FlashCard>): Promise<FlashCard> {
    try {
      if (!data || !(data as any).front || !(data as any).back) {
        throw new Error("Front y back son requeridos");
      }
      const response = await this.fetchAuth("/flash-cards/flashcards", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const datar = await response.json();
      if (!response.ok) {
        throw new Error(datar.message);
      }
      return datar;
    } catch (error: any) {
      console.error("Create flashcard error:", error);
      throw error;
    }
  }

  async getFlashcardsByCard(
    cardId: number,
    filters?: Record<string, any>,
  ): Promise<FlashCard[]> {
    try {
      if (!cardId || cardId <= 0) {
        throw new Error("ID de tarjeta inválido");
      }
      const query = this.buildQuery(filters);
      return await this.fetchAuth(
        `/flash-cards/cards/${cardId}/flashcards${query}`,
      );
    } catch (error: any) {
      console.error("Get flashcards by card error:", error);
      throw error;
    }
  }

  async getFlashcardById(id: number): Promise<FlashCard> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de flashcard inválido");
      }
      return await this.fetchAuth(`/flash-cards/flashcards/${id}`);
    } catch (error: any) {
      console.error("Get flashcard by id error:", error);
      throw error;
    }
  }

  async updateFlashcard(
    id: number,
    data: Partial<FlashCard>,
  ): Promise<FlashCard> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de flashcard inválido");
      }
      const response = await this.fetchAuth(`/flash-cards/flashcards/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      const datat = await response.json();
      if (!response.ok) {
        throw new Error(datat.message);
      }
      return datat;
    } catch (error: any) {
      console.error("Update flashcard error:", error);
      throw error;
    }
  }

  async deleteFlashcard(id: number): Promise<{ success: boolean }> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de flashcard inválido");
      }
      const response = await this.fetchAuth(`/flash-cards/flashcards/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Delete flashcard error:", error);
      throw error;
    }
  }

  async markFlashcardAsReviewed(id: number): Promise<FlashCard> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de flashcard inválido");
      }
      const response = await this.fetchAuth(
        `/flash-cards/flashcards/${id}/review`,
        {
          method: "PATCH",
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Mark flashcard as reviewed error:", error);
      throw error;
    }
  }

  async generateFlashcards(
    input: GenerateFlashcardsInput,
  ): Promise<GenerateFlashcardsResponse> {
    try {
      if (!input.topic && !input.referenceText) {
        throw new Error(
          'Debe proporcionar un "topic" o "referenceText" para generar flashcards.',
        );
      }
      const response = await this.fetchAuth(
        "/flash-cards/generate/topic_or_reference",
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Generate flashcards error:", error);
      throw error;
    }
  }

  // ==================== NOTE METHODS ====================

  async getNotes(): Promise<Note[]> {
    try {
      const response = await this.fetchAuth("/notes");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get notes error:", error);
      throw error;
    }
  }

  async getNoteById(id: number): Promise<Note> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de nota inválido");
      }
      const response = await this.fetchAuth(`/notes/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get note by id error:", error);
      throw error;
    }
  }

  async generateNote(input: GenerateNoteInput): Promise<Note> {
    try {
      if (!input.topic && !input.referenceText) {
        throw new Error(
          'Debe proporcionar un "topic" o "referenceText" para generar notas.',
        );
      }
      const response = await this.fetchAuth(
        "/notes/generate/topic_or_reference",
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Generate note error:", error);
      throw error;
    }
  }

  async deleteNote(id: number): Promise<{ success: boolean }> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de nota inválido");
      }
      const response = await this.fetchAuth(`/notes/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Delete note error:", error);
      throw error;
    }
  }

  // ==================== CHAT METHODS ====================

  async getChats(): Promise<Chat[]> {
    try {
      const response = await this.fetchAuth("/messages/chats");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get chats error:", error);
      throw error;
    }
  }

  async getChatById(id: number): Promise<Chat> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de chat inválido");
      }
      const response = await this.fetchAuth(`/messages/chats/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get chat by id error:", error);
      throw error;
    }
  }

  async createChat(datar: { title?: string }): Promise<Chat> {
    try {
      const response = await this.fetchAuth("/messages/chats", {
        method: "POST",
        body: JSON.stringify(datar),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Create chat error:", error);
      throw error;
    }
  }

  async getMessages(chatId: number): Promise<Message[]> {
    try {
      if (!chatId || chatId <= 0) {
        throw new Error("ID de chat inválido");
      }
      const response = await this.fetchAuth(
        `/messages/chats/${chatId}/messages`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Get messages error:", error);
      throw error;
    }
  }

  async sendMessage(input: SendMessageInput): Promise<SendMessageResponse> {
    try {
      if (!input || !input.chatId || !(input as any).content) {
        throw new Error("Chat ID y contenido del mensaje son requeridos");
      }
      const response = await this.fetchAuth("/messages/send", {
        method: "POST",
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Send message error:", error);
      throw error;
    }
  }

  async deleteChat(id: number): Promise<{ success: boolean }> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de chat inválido");
      }
      const response = await this.fetchAuth(`/messages/chats/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Delete chat error:", error);
      throw error;
    }
  }

  async deleteMessage(id: number): Promise<{ success: boolean }> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de mensaje inválido");
      }
      const response = await this.fetchAuth(`/messages/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error: any) {
      console.error("Delete message error:", error);
      throw error;
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async fetch(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(API_KEY && { "x-api-key": API_KEY }),
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Si la respuesta no es ok (status no está en rango 200-299)
      if (!response.ok) {
        let errorData: any = { message: `HTTP ${response.status}` };

        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          }
        } catch (parseError) {
          // Si no se puede parsear JSON, usar datos por defecto
          console.warn("Could not parse error response as JSON:", parseError);
        }

        // Manejo específico por código de estado
        if (response.status === 401) {
          this.clearAuth();
          const { message } = parseErrorResponse(errorData);
          throw new ApiError(
            message || "No autorizado - por favor inicia sesión nuevamente",
            401,
            "UNAUTHORIZED",
          );
        }

        if (response.status === 403) {
          const { message } = parseErrorResponse(errorData);
          throw new ApiError(
            message || "Acceso denegado - no tienes permisos para esta acción",
            403,
            "FORBIDDEN",
          );
        }

        if (response.status === 404) {
          const { message } = parseErrorResponse(errorData);
          throw new ApiError(
            message || "Recurso no encontrado",
            404,
            "NOT_FOUND",
          );
        }

        if (response.status >= 500) {
          const { message } = parseErrorResponse(errorData);
          throw new ApiError(
            message || "Error del servidor - intenta más tarde",
            response.status,
            "SERVER_ERROR",
          );
        }

        // Error genérico del cliente
        const { message, code, details } = parseErrorResponse(errorData);
        throw new ApiError(
          message || `Error ${response.status}: ${response.statusText}`,
          response.status,
          code || "API_ERROR",
          details,
        );
      }

      return response;
    } catch (error: any) {
      // Si ya es un ApiError, re-lanzar
      if (error instanceof ApiError) {
        throw error;
      }

      // Si es un error de conexión (TypeError)
      if (error instanceof TypeError) {
        throw new ApiError(
          "Error de conexión con el servidor. Por favor verifica tu conexión a internet.",
          0,
          "NETWORK_ERROR",
        );
      }

      // Para otros errores
      throw new ApiError(
        error?.message || "Error desconocido",
        500,
        "UNKNOWN_ERROR",
      );
    }
  }

  private async fetchAuth(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const response = await this.fetch(endpoint, options);

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return {};
    } catch (error: any) {
      throw new ApiError(
        `Error al procesar respuesta del servidor: ${error.message}`,
        500,
        "PARSE_ERROR",
      );
    }
  }

  private buildQuery(params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) return "";
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
    return query.toString() ? `?${query.toString()}` : "";
  }

  // ==================== STORAGE METHODS ====================

  private saveAuth(token: string, user: User): void {
    this.saveToken(token);
    this.saveUser(user);
  }

  decodeJwt(token: string) {
    try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding JWT:", error)
    return {}
  }
  }

  saveToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      this.token = token;
      localStorage.setItem("auth_token", token);
    } catch (error) {
      console.error("Error saving token to localStorage:", error);
    }
  }

  saveUser(user: User): void {
    if (typeof window === 'undefined') return;
    try {
      this.user = user;
      localStorage.setItem("auth_user", JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
    }
  }

  updateToken(token: string): void {
    this.saveToken(token);
  }

  // ==================== AUTH STATE ====================

  /**
   * Verifica si el usuario está autenticado
   * @returns true si hay un token válido y un usuario válido
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar que el token tenga el formato correcto de JWT
    if (!this.isValidToken(token)) return false;
    
    // Verificar que haya un usuario válido
    if (!this.hasValidUser()) return false;
    
    return true;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  hasValidToken(): boolean {
    return !!this.token && this.token.length > 0;
  }

  hasValidUser(): boolean {
    return !!this.user && !!this.user.id && !!this.user.email;
  }

  // ==================== LOGOUT & CLEAR ====================

  clearAuth(): void {
    this.token = null;
    this.user = null;
    this.clearStorage();
  }

  logout(): void {
    this.clearAuth();
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }

  clearToken(): void {
    if (typeof window === 'undefined') return;
    try {
      this.token = null;
      localStorage.removeItem("auth_token");
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  }

  clearUser(): void {
    if (typeof window === 'undefined') return;
    try {
      this.user = null;
      localStorage.removeItem("auth_user");
    } catch (error) {
      console.error("Error clearing user:", error);
    }
  }

  clearAllStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
      this.token = null;
      this.user = null;
    } catch (error) {
      console.error("Error clearing all storage:", error);
    }
  }

  // ==================== VALIDATORS ====================

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidToken(token: string): boolean {
    if (!token || typeof token !== "string") return false;
    return token.split(".").length === 3;
  }

  isValidUser(user: any): user is User {
    return (
      !!user &&
      typeof user === "object" &&
      typeof user.id === "number" &&
      typeof user.email === "string" &&
      typeof user.name === "string"
    );
  }
}

export const apiService = new ApiService();
export type { User };
