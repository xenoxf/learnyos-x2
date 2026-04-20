export interface User {
  id: number;
  email: string;
  name: string;
  picture?: string;
  provider: "local" | "google";
  googleId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;

  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface TokenVerificationResult {
  isValid: boolean;
  user?: User;
  isLoading: boolean;
  error?: string;
}
