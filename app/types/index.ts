/**
 * Tipos globales para LearnYos Frontend
 * Sincronizados 100% con DTOs del Backend Klerk (NestJS)
 * SIN DISFRACES - Tipos exactos, nada de casting innecesario
 */

// ==================== AUTHENTICATION ====================

export interface User {
  id: number;
  email: string;
  name: string;
  picture?: string;
  provider: "local" | "google";
  googleId?: string;
  createdAt: string;
  updatedAt: string;
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

// ==================== EXAMS ====================

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface ExamOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  id?: number;
  question: string;
  explanation?: string;
  options: ExamOption[];
  correctAnswer?: string;
}

export interface Exam {
  id: number;
  title: string;
  description?: string;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  questions: ExamQuestion[];
  score?: number;
  estimatedTime?: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateExamData {
  topic?: string;
  reference?: string;
  numberOfQuestions: number;
  difficulty: string;
}

// ==================== FLASHCARDS ====================

/** Una sola tarjeta (respuesta del backend GET /flash-cards y dentro de generate) */
export interface FlashCard {
  id: number;
  front: string;
  back: string;
  difficulty?: DifficultyLevel;
  hint?: string;
  reviewDate?: string;
  cardId?: number;
  userId?: number;
  createdAt?: string;
}

export interface GenerateFlashCardData {
  topic?: string;
  referenceText?: string;
  quantity: number;
  level?: string;
}

/** Respuesta del backend POST /flash-cards/generate/topic_or_reference */
export interface GenerateFlashcardsResponse {
  success: boolean;
  card: { id: number; title: string; description?: string; totalCards: number };
  totalCreated: number;
  flashcards: FlashCard[];
}

/** Mazo (entidad Card del backend) para validación */
export interface Card {
  id: number;
  title: string;
  description: string;
  totalCards: number;
  reviewedCards?: number;
  lastReviewDate?: string;
  flashcards: FlashCard[];
  userId?: number;
  createdAt: string;
}

/** Alias para Card cuando se usa en contexto de UI de mazo */
export type FlashCardDeck = Card;

/** Mensaje de chat (entidad Message del backend) */
export interface Message {
  id: number;
  prompt: string;
  response: string;
  chatId?: number;
  userId?: number;
  createdAt: string;
  updatedAt?: string;
}

// ==================== NOTES ====================

export type LevelOfDetail = "breve" | "medio" | "detallado" | "alto";

/** Contenido de nota (entidad note_contents del backend) */
export interface NoteContent {
  id: number;
  noteId: number;
  title?: string;
  content: string;
  order: number;
  userId?: number;
  createdAt: string;
}

/** Entidad Note del backend */
export interface Note {
  id: number;
  title: string;
  description?: string;
  levelOfDetail?: LevelOfDetail;
  noteContents?: NoteContent[];
  userId?: number;
  createdAt: string;
}

/** Payload para POST /notes/generate/topic_or_reference - alineado con backend */
export interface GenerateNoteData {
  topic?: string;
  referenceText?: string;
  numberOfNotes: number;
  levelOfDetail: "breve" | "medio" | "detallado";
}

/** Respuesta del backend POST /notes/generate/topic_or_reference */
export interface GenerateNotesResponse {
  success: boolean;
  notes: Note[];
}

// ==================== CHAT & MESSAGES ====================

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: number;
  chatId?: number | null;
  content: string;
  role: MessageRole;
  createdAt: string;
}

export interface Chat {
  id: number;
  title: string;
  messages?: ChatMessage[];
  messageCount?: number;
  userId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SendMessageData {
  prompt: string;
  chatId?: number;
}

/** Respuesta del backend POST /messages/send - devuelve la entidad Message */
export interface SendMessageResponse {
  id: number;
  chatId?: number;
  response: string;
  prompt: string;
  createdAt: string;
}

/** Respuesta del backend GET /messages/chat/:chatId */
export interface GetChatMessagesResponse {
  chatId: number;
  title?: string;
  messages: Array<{
    id: number;
    prompt: string;
    response: string;
    createdAt: string;
  }>;
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ==================== OTHER ====================

export interface TokenVerificationResult {
  isValid: boolean;
  user?: User;
  isLoading: boolean;
  error?: string;
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
