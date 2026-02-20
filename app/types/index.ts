/**
 * Tipos globales para la aplicación LearnYos
 * Sincronizados con Backend Klerk (NestJS)
 */

// ==================== USER ====================

export interface User {
  id?: number;
  email: string;
  name: string;
  picture?: string;
  provider?: "local" | "google";
  googleId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string | null;
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

// ==================== EXAM ====================

export interface ExamOption {
  id?: number;
  text: string;
  isCorrect?: boolean;
  correct_answer?: boolean;
}

export interface ExamQuestion {
  id?: number;
  question: string;
  explanation?: string;
  options: ExamOption[] | string[];
  correctAnswer?: string;
  correct_answer?: string;
}

export interface Exam {
  id: number;
  title: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  totalQuestions: number;
  questions?: ExamQuestion[];
  score?: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== FLASHCARD ====================

export interface FlashCard {
  id: number;
  question: string;
  answer: string;
  difficulty?: "easy" | "medium" | "hard";
  hint?: string;
  tags?: string[];
  reviewDate?: string;
  cardId?: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  totalCards: number;
  reviewedCards?: number;
  lastReviewDate?: string;
  flashcards?: FlashCard[];
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== NOTE ====================

export interface NoteContent {
  id?: number;
  noteId?: number;
  text: string;
  createdAt?: string;
}

export interface Note {
  id: number;
  title: string;
  content?: string;
  color?: string;
  tags?: string[];
  levelOfDetail?: "breve" | "medio" | "alto";
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  noteContents?: NoteContent[];
}

// ==================== CHAT & MESSAGE ====================

export interface Message {
  id: number;
  prompt: string;
  response: string;
  chatId?: number;
  userId?: number;
  createdAt: string;
}

export interface Chat {
  id: number;
  title?: string;
  messages?: Message[];
  messageCount?: number;
  userId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SendMessageInput {
  prompt: string;
  chatId?: number;
}

// ==================== GENERATION INPUTS ====================

export interface GenerateExamInput {
  topic?: string;
  reference?: string;
  referenceText?: string;
  difficulty?: "easy" | "medium" | "hard";
  numberOfQuestions?: number;
  quantity?: number;
}

export interface GenerateFlashcardsInput {
  topic?: string;
  referenceText?: string;
  reference?: string;
  numberOfCards?: number;
  quantity?: number;
  level?: "easy" | "medium" | "hard";
}

export interface GenerateNoteInput {
  topic?: string;
  referenceText?: string;
  reference?: string;
  quantity?: number;
  level?: "breve" | "medio" | "alto";
}

// ==================== COMMON TYPES ====================

export type Difficulty = "easy" | "medium" | "hard";
export type NoteLevel = "breve" | "medio" | "alto";

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== SETTINGS AND CONFIGURATION ====================

export interface SettingsFormData {
  notifications: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
  dailyGoal: number;
  emailUpdates: boolean;
}

export interface PomodoroConfig {
  workDuration: number;
  breakDuration: number;
  sessionsBeforeLongBreak: number;
  longBreakDuration: number;
  autoStartBreak: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

// ============= TOKEN & AUTH =============

export interface TokenVerificationResult {
  isValid: boolean;
  user?: User;
  isLoading: boolean;
  error?: string;
}
