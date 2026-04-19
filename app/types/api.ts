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
