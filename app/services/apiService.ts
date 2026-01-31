'use client';

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    picture?: string;
  };
}

interface User {
  id: number;
  email: string;
  name: string;
  picture?: string;
  provider: 'local' | 'google';
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = String(process.env.NEXT_PUBLIC_API_URL);
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private getHeaders() {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== AUTH ====================

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      this.setToken(response.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    return response;
  }

  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      this.setToken(response.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    return response;
  }

  async googleAuthWithCode(code: string): Promise<AuthResponse> {
    const response = await this.request('/auth/google/callback', {
      method: 'GET',
      body: JSON.stringify({ code }),
    });
    if (response.token) {
      this.setToken(response.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    return response;
  }

  async getGoogleAuthUrl(): Promise<{ url: string }> {
    return this.request('/auth/google/url');
  }

  // ==================== USER ====================

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  async updateUser(data: { name?: string }): Promise<User> {
    const response = await this.request('/users/name', {
      method: 'PUT',
      body: JSON.stringify(data.name),
    });
    if (response && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response));
    }
    return response;
  }

  async deleteUser(): Promise<void> {
    await this.request('/users', {
      method: 'DELETE',
    });
    this.logout();
  }

  async isValidEmail(email: string) {
    const valid = email.match(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    );
    return valid !== null;
  }

  // ==================== MESSAGES (CHAT) ====================

  async getUserChats() {
    return this.request('/messages/chats');
  }

  async getChatMessages(chatId: number) {
    return this.request(`/messages/chat/${chatId}`);
  }

  async sendMessage(prompt: string, chatId?: number) {
    return this.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ prompt, chatId }),
    });
  }

  async deleteChat(chatId: number) {
    return this.request(`/messages/chat/${chatId}`, {
      method: 'DELETE',
    });
  }

  // ==================== NOTES ====================

  async getNotes() {
    return this.request('/notes');
  }

  async getNote(id: number) {
    return this.request(`/notes/${id}`);
  }

  async createNote(data: { topic?: string; referenceText?: string; quantity?: number; level?: string }) {
    return this.request('/notes/generate/topic_or_reference', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteNote(id: number) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== FLASHCARDS ====================

  async getFlashcards() {
    return this.request('/flash-cards');
  }

  async getFlashcard(id: number) {
    return this.request(`/flash-cards/${id}`);
  }

  async generateFlashcards(data: { topic?: string; referenceText?: string; quantity?: number; level?: string }) {
    return this.request('/flash-cards/generate/topic_or_reference', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteFlashcard(id: number) {
    return this.request(`/flash-cards/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== EXAMS ====================

  async getExams() {
    return this.request('/exams');
  }

  async getExam(id: number) {
    return this.request(`/exams/${id}`);
  }

  async generateExam(data: { topic?: string; reference?: string; quantity?: number; level?: string }) {
    return this.request('/exams/generate/topic_or_referencia', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteExam(id: number) {
    return this.request(`/exams/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== GROQ (AI) ====================

  async generateWithGroq(prompt: string, model: string = 'mixtral-8x7b-32768') {
    return this.request('/groq/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, model }),
    });
  }

  async getGroqHealth() {
    return this.request('/groq/health');
  }

  async getGroqImplementationStatus() {
    return this.request('/groq/implementation-status');
  }

  // ==================== UTILS ====================

  isAuthenticated(): boolean {
    return !!this.token && !!this.getUser();
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}

export const apiService = new ApiService();
