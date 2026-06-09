/**
 * API Type Validator
 * Valida que los tipos del frontend coincidan con las respuestas del backend
 */

import type {
  User,
  AuthResponse,
  ExamDeck,
  ExamKlek,
  CardsDeck,
  NoteDeck,
} from '@/types';

/**
 * Valida estructura de User
 */
export function validateUser(data: unknown): data is User {
  if (!data || typeof data !== 'object') return false;

  const user = data as Record<string, unknown>;

  return (
    typeof user.id === 'number' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    (user.picture === undefined || typeof user.picture === 'string') &&
    typeof user.createdAt === 'string'
  );
}

/**
 * Valida estructura de AuthResponse
 */
export function validateAuthResponse(data: unknown): data is AuthResponse {
  if (!data || typeof data !== 'object') return false;

  const response = data as Record<string, unknown>;

  return (
    typeof response.token === 'string' &&
    validateUser(response.user)
  );
}

/**
 * Valida estructura de ExamDeck
 */
export function validateExamDeck(data: unknown): data is ExamDeck {
  if (!data || typeof data !== 'object') return false;

  const exam = data as Record<string, unknown>;

  return (
    typeof exam.id === 'number' &&
    typeof exam.title === 'string' &&
    (exam.description === undefined || typeof exam.description === 'string') &&
    typeof exam.totalQuestions === 'number' &&
    (exam.difficulty === undefined || ['easy', 'medium', 'hard'].includes(exam.difficulty as string))
  );
}

/**
 * Valida estructura de ExamKlek
 */
export function validateExamKlek(data: unknown): data is ExamKlek {
  if (!data || typeof data !== 'object') return false;

  const exam = data as Record<string, unknown>;

  return (
    validateExamDeck(exam) &&
    Array.isArray(exam.questions)
  );
}

/**
 * Valida estructura de CardsDeck
 */
export function validateCardsDeck(data: unknown): data is CardsDeck {
  if (!data || typeof data !== 'object') return false;

  const card = data as Record<string, unknown>;

  return (
    typeof card.id === 'number' &&
    typeof card.title === 'string' &&
    (card.description === undefined || typeof card.description === 'string') &&
    (card.totalCards === undefined || typeof card.totalCards === 'number')
  );
}

/**
 * Valida estructura de NoteDeck
 */
export function validateNoteDeck(data: unknown): data is NoteDeck {
  if (!data || typeof data !== 'object') return false;

  const note = data as Record<string, unknown>;

  return (
    typeof note.id === 'number' &&
    typeof note.title === 'string' &&
    (note.description === undefined || typeof note.description === 'string') &&
    (note.contentsCount === undefined || typeof note.contentsCount === 'number')
  );
}

/**
 * Validador genérico con manejo de errores
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Valida respuesta de API y retorna resultado con errores
 */
export function validateAPIResponse<T>(
  data: unknown,
  validator: (data: unknown) => data is T,
  context: string,
): ValidationResult {
  const errors: string[] = [];

  if (data === null || data === undefined) {
    errors.push(`${context}: Data is null or undefined`);
    return { valid: false, errors };
  }

  if (!validator(data)) {
    errors.push(`${context}: Data does not match expected type structure`);
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}
