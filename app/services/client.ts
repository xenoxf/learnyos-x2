/**
 * Base HTTP Client
 * Handles auth tokens, refresh, caching, and error handling
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class HttpClient {
  private token: string | null = null;

  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private searchTimeouts = new Map<string, NodeJS.Timeout>();
  private refreshPromise: Promise<boolean> | null = null;

  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  /**
   * Sync tokens from localStorage (call on page load or tab switch)
   */
  syncFromStorage(): void {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken && storedToken !== this.token) this.token = storedToken;

    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }


  /**
   * Get the current token (for authService usage)
   */
  getToken(): string | null {
    if (typeof window !== "undefined") {
      this.syncFromStorage();
    }
    return this.token;
  }
  clearAuth(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isGuest");
    }
  }

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  setCache<T>(key: string, data: T, expiresIn = 120000): void {
    this.cache.set(key, { data, timestamp: Date.now(), expiresIn });
  }

  clearCache(): void {
    this.cache.clear();
  }

  debounceSearch<T>(endpoint: string, options: RequestInit, delay = 500): Promise<T> {
    return new Promise((resolve, reject) => {
      const existing = this.searchTimeouts.get(endpoint);
      if (existing) clearTimeout(existing);
      const timeout = setTimeout(async () => {
        try {
          this.searchTimeouts.delete(endpoint);
          resolve(await this.request<T>(endpoint, options));
        } catch (error) {
          reject(error);
        }
      }, delay);
      this.searchTimeouts.set(endpoint, timeout);
    });
  }

  async request<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json", ...options.headers };
    if (this.apiKey) (headers as Record<string, string>)["x-api-key"] = this.apiKey;
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.message || errorData.error || `Error: ${response.status}`;
      throw new Error(String(msg));
    }

    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return undefined as T;
    return (await response.json()) as T;
  }

  async requestWithFallback<T>(endpoints: string[], options: RequestInit = {}): Promise<T> {
    let lastError: unknown = null;
    for (const ep of endpoints) {
      try {
        return await this.request<T>(ep, options);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("No se pudo completar la solicitud");
  }

  async requestStream(endpoint: string, body: unknown): Promise<AsyncIterable<any>> {
    const headers: HeadersInit = { "Content-Type": "application/json", Accept: "text/event-stream" };
    if (this.apiKey) (headers as Record<string, string>)["x-api-key"] = this.apiKey;
    const token = this.getToken();
    if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, { method: "POST", headers, body: JSON.stringify(body) });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Streaming no soportado");
    const decoder = new TextDecoder();
    let buffer = "";

    return {
      async *[Symbol.asyncIterator]() {
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
                  yield JSON.parse(line.slice(6));
                } catch { /* ignore */ }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    };
  }
}

export const httpClient = new HttpClient(
  process.env.NEXT_PUBLIC_BACKEND_URL || "",
  process.env.NEXT_PUBLIC_BACKEND_API_KEY
);

