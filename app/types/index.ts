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
  feedback?: string;
}

export interface ExamQuestion {
  id?: number;
  question: string;
  explanation?: string;
  options: ExamOption[];
  correctAnswer?: string;
}

/**
 * Exam DECK - Solo metadata para listar en grids
 * NO incluye: questions, code, userId, score, createdAt
 */
export interface ExamDeck {
  id: number;
  title: string;
  description: string;
  area?: string;
  tema?: string;
  difficulty?: string;
  totalQuestions: number;
  estimatedTime?: string;
  code?: string;
  creatorName: string;
  likesCount: number;
  userLiked: boolean;
  canDelete?: boolean;
}

/**
 * Exam KLEK - Datos completos para jugar/responder
 * NO incluye: code, userId, score (datos internos)
 */
export interface ExamKlek {
  id: number;
  title: string;
  description?: string;
  area?: string;
  tema?: string;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  questions: ExamQuestion[];
  creatorName?: string;
  canDelete?: boolean;
}

export interface GenerateExamData {
  reference: string;
  numberOfQuestions: number;
  difficulty: string;
  acceso?: string;
}

// ==================== FLASHCARDS ====================

export interface FlashCardKlek {
  id: number;
  front: string;
  back: string;
  hint?: string;
}

/**
 * FlashCard DECK - Solo metadata para listar en grids
 * NO incluye: code, userId, createdAt
 */
export interface CardsDeck {
  id: number;
  title: string;
  description: string;
  code?: string;
  area?: string;
  tema?: string;
  totalCards?: number;
  flashcards?: FlashCardKlek[];
  creatorName: string;
  likesCount: number;
  userLiked: boolean;
  canDelete?: boolean;
}

/**
 * FlashCard KLEK - Datos completos para estudiar
 * NO incluye: code, userId, createdAt (datos internos)
 */
export interface CardKlek {
  id: number;
  title: string;
  area?: string;
  description?: string;
  tema?: string;
  flashcards: FlashCardKlek[];
}

export interface GenerateFlashCardData {
  reference: string;
  quantity: number;
  acceso?: string;
}

/** Mensaje de chat (entidad Message del backend) */
export interface Message {
  id: number;
  prompt: string;
  response: string;
  chatId?: number;
  userId?: number;
  createdAt: string;
}

// ==================== NOTES ====================

export type LevelOfDetail = "breve" | "medio" | "detallado" | "alto";

/**
 * Contenido de nota DECK - Solo metadata
 * NO incluye: content completo, userId
 */
export interface NoteContentDeck {
  id: number;
  tema?: string;
}

/**
 * Contenido de nota KLEK - Contenido completo para leer
 * NO incluye: userId (datos internos)
 */
export interface NoteContentKlek {
  id: number;
  tema?: string;
  title?: string;
  content: string;
  order?: number;
}

/**
 * Note DECK - Solo metadata para listar en grids
 * NO incluye: noteContents completo, userId, levelOfDetail, createdAt
 */
export interface NoteDeck {
  id: number;
  title: string;
  description: string;
  area?: string;
  tema?: string;
  acceso?: string;
  code?: string;
  contentsCount?: number;
  creatorName: string;
  likesCount: number;
  userLiked: boolean;
  canDelete?: boolean;
}

/**
 * Note KLEK - Contenido completo para leer
 * NO incluye: code, userId, levelOfDetail (datos internos)
 */
export interface NoteKlek {
  id: number;
  title: string;
  description?: string;
  area?: string;
  tema?: string;
  acceso?: string;
  noteContents: NoteContentKlek[];
  canDelete?: boolean;
}
/** Payload para POST /notes/generate/topic_or_reference - alineado con backend */
export interface GenerateNoteData {
  /** Texto de referencia (prioritario si viene) */
  reference?: string;
  topic?: string;
  referenceText?: string;
  numberOfNotes: number;
  levelOfDetail: "breve" | "medio" | "detallado";
  acceso?: string;
}

/** Respuesta del backend POST /notes/generate/topic_or_reference */
export interface GenerateNotesResponse {
  success: boolean;
  notes: NoteDeck[];
  message?: string;
  data?: NoteDeck[];
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

// ==================== API ERROR RESPONSES ====================

/**
 * Estructura de errores del backend con respuestas detalladas
 * Usado para manejar errores de la IA y otros errores del servidor
 */
export interface ApiErrorResponse {
  message: string;
  details?: string;
  errorCode?: string;
  rawResponse?: any;
}

// ==================== STREAMING ====================

export interface StreamChunk {
  type: "credits" | "chunk" | "done";
  content?: string;
  remaining?: number;
  total?: number;
  messageId?: number;
}

/**
 * Códigos de error conocidos del backend
 */
export enum ApiErrorCodes {
  // Exams
  INVALID_AI_RESPONSE = "INVALID_AI_RESPONSE",
  NO_QUESTIONS_GENERATED = "NO_QUESTIONS_GENERATED",
  MISSING_METADATA = "MISSING_METADATA",
  INCOMPLETE_METADATA = "INCOMPLETE_METADATA",
  INVALID_QUESTION_FORMAT = "INVALID_QUESTION_FORMAT",
  EXAM_GENERATION_ERROR = "EXAM_GENERATION_ERROR",
  // Notes
  NO_CONTENT_GENERATED = "NO_CONTENT_GENERATED",
  NOTE_GENERATION_ERROR = "NOTE_GENERATION_ERROR",
  // Flashcards
  NO_CARDS_GENERATED = "NO_CARDS_GENERATED",
  INVALID_CARD_FORMAT = "INVALID_CARD_FORMAT",
  FLASHCARDS_GENERATION_ERROR = "FLASHCARDS_GENERATION_ERROR",
}

// Analizando backend para seguridad y ownership
// flash-cards.controller.ts - POST generate devuelve {message}
// flash-cards.service.ts - remove() valida userId
// Necesito verificar si getFlashcard() devuelve el userId para validar ownership

// CREDITS

export interface CreditsStatus {
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
}
