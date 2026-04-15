/**
 * AuthService - Handles authentication
 */
import type { AuthResponse, LoginInput, RegisterInput, User } from "@/types";
import { httpClient } from "./client";

export const authService = {
  async login(credentials: LoginInput): Promise<AuthResponse> {
    const response = await httpClient.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (!response.token || !response.user)
      throw new Error("Invalid login response");
    httpClient.setToken(response.token, (response as any).refreshToken);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...response.user, isGuest: false }),
      );
      localStorage.removeItem("isGuest");
    }
    return response;
  },

  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await httpClient.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.token || !response.user)
      throw new Error("Invalid register response");
    httpClient.setToken(response.token, (response as any).refreshToken);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...response.user, isGuest: false }),
      );
      localStorage.removeItem("isGuest");
    }
    return response;
  },

  async updateUser(data: Partial<User>): Promise<User> {
    if (data.name) {
      const response = await httpClient.request<User>("/users/name", {
        method: "PUT",
        body: JSON.stringify(data.name),
      });
      if (typeof window !== "undefined")
        localStorage.setItem("user", JSON.stringify(response));
      return response;
    }
    return this.getUser() as User;
  },

  async logout(): Promise<void> {
    try {
      const token = httpClient["getToken"]();
      if (token)
        await httpClient.request<void>("/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    httpClient.clearAuth();
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  async isAuthenticated(): Promise<boolean> {
    return this.verifyToken();
  },

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  async verifyToken(): Promise<boolean> {
    try {
      const token = httpClient["getToken"]();
      if (!token) return false;
      const result = await httpClient.request<{ valid: boolean }>(
        "/auth/verify_token",
        { method: "GET" },
      );
      return result.valid === true;
    } catch (err: any) {
      // If 401, the auto-refresh in client.ts should have kicked in.
      // Don't clear localStorage here — let the caller decide.
      if (err?.message?.includes("Sesión expirada")) {
        return false;
      }
      // Network error or other — assume valid to avoid false logout
      return true;
    }
  },

  /**
   * Attempt to refresh the session using the stored refresh token.
   * Returns true if refresh was successful, false otherwise.
   * This runs silently without blocking the UI.
   */
  async refreshSession(): Promise<boolean> {
    try {
      const refreshToken = httpClient.refreshTokenValue || localStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const response = await httpClient.request<{
        token: string;
        refreshToken: string;
        user: User;
      }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });

      if (response.token) {
        httpClient.setToken(response.token, response.refreshToken);
        if (typeof window !== "undefined" && response.user) {
          localStorage.setItem(
            "user",
            JSON.stringify({ ...response.user, isGuest: false }),
          );
          localStorage.removeItem("isGuest");
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  async getGoogleAuthUrl(): Promise<{ url: string }> {
    return httpClient.request("/auth/google/url", { method: "GET" });
  },

  async googleAuthWithCode(code: string): Promise<AuthResponse> {
    const response = await httpClient.request<AuthResponse>(
      "/auth/google/callback",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
    );
    if (response.token && response.user) {
      httpClient.setToken(response.token);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...response.user, isGuest: false }),
        );
        localStorage.removeItem("isGuest");
      }
    }
    return response;
  },

  async loginWithGoogle(googleToken: {
    idToken: string;
    email: string;
    name: string;
    googleId: string;
  }): Promise<AuthResponse> {
    const response = await httpClient.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify(googleToken),
    });
    if (response.token) {
      httpClient.setToken(response.token);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...response.user, isGuest: false }),
        );
        localStorage.removeItem("isGuest");
      }
    }
    return response;
  },

  async loginAsGuest(): Promise<AuthResponse> {
    const response = await httpClient.request<AuthResponse>("/auth/guest", {
      method: "POST",
    });
    if (response.token && response.user) {
      httpClient.setToken(response.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("isGuest", "true");
      }
    }
    return response;
  },

  isGuest(): boolean {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) return true;
    try {
      return JSON.parse(userStr)?.isGuest === true;
    } catch {
      return true;
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  },
};
