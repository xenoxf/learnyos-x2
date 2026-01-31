/**
 * API Type Validator
 * Valida que los tipos del frontend coincidan con las respuestas del backend
 */

import type {
  User,
  AuthResponse,
  Exam,
  ExamQuestion,
  ExamOption,
  FlashCard,
  Card,
  Note,
  Message,
  Chat,
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
    (user.avatar === undefined || typeof user.avatar === 'string') &&
    typeof user.createdAt === 'string' &&
    typeof user.updatedAt === 'string'
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
    validateUser(response.user) &&
    (response.message === undefined || response.message === null || typeof response.message === 'string')
  );
}

/**
 * Valida estructura de ExamOption
 */
export function validateExamOption(data: unknown): data is ExamOption {
  if (!data || typeof data !== 'object') return false;

  const option = data as Record<string, unknown>;

  return (
    typeof option.id === 'number' &&
    (option.questionId === undefined || typeof option.questionId === 'number') &&
    typeof option.text === 'string' &&
    typeof option.isCorrect === 'boolean'
  );
}

/**
 * Valida estructura de ExamQuestion
 */
export function validateExamQuestion(data: unknown): data is ExamQuestion {
  if (!data || typeof data !== 'object') return false;

  const question = data as Record<string, unknown>;

  return (
    typeof question.id === 'number' &&
    typeof question.examId === 'number' &&
    typeof question.question === 'string' &&
    (question.explanation === undefined || typeof question.explanation === 'string') &&
    Array.isArray(question.options) &&
    question.options.every(validateExamOption) &&
    typeof question.correctAnswer === 'string'
  );
}

/**
 * Valida estructura de Exam
 */
export function validateExam(data: unknown): data is Exam {
  if (!data || typeof data !== 'object') return false;

  const exam = data as Record<string, unknown>;

  return (
    typeof exam.id === 'number' &&
    typeof exam.title === 'string' &&
    typeof exam.description === 'string' &&
    (exam.difficulty === undefined || ['easy', 'medium', 'hard'].includes(exam.difficulty as string)) &&
    typeof exam.totalQuestions === 'number' &&
    (exam.questions === undefined || Array.isArray(exam.questions)) &&
    (exam.score === undefined || typeof exam.score === 'number') &&
    (exam.userId === undefined || typeof exam.userId === 'number') &&
    typeof exam.createdAt === 'string' &&
    typeof exam.updatedAt === 'string'
  );
}

/**
 * Valida estructura de FlashCard
 */
export function validateFlashCard(data: unknown): data is FlashCard {
  if (!data || typeof data !== 'object') return false;

  const card = data as Record<string, unknown>;

  return (
    typeof card.id === 'number' &&
    typeof card.question === 'string' &&
    typeof card.answer === 'string' &&
    (card.difficulty === undefined || ['easy', 'medium', 'hard'].includes(card.difficulty as string)) &&
    (card.hint === undefined || typeof card.hint === 'string') &&
    Array.isArray(card.tags) &&
    (card.reviewDate === undefined || typeof card.reviewDate === 'string') &&
    typeof card.cardId === 'number' &&
    (card.userId === undefined || typeof card.userId === 'number') &&
    typeof card.createdAt === 'string' &&
    typeof card.updatedAt === 'string'
  );
}

/**
 * Valida estructura de Card
 */
export function validateCard(data: unknown): data is Card {
  if (!data || typeof data !== 'object') return false;

  const card = data as Record<string, unknown>;

  return (
    typeof card.id === 'number' &&
    typeof card.title === 'string' &&
    (card.description === undefined || typeof card.description === 'string') &&
    typeof card.totalCards === 'number' &&
    typeof card.reviewedCards === 'number' &&
    (card.lastReviewDate === undefined || typeof card.lastReviewDate === 'string') &&
    (card.flashcards === undefined || Array.isArray(card.flashcards)) &&
    (card.userId === undefined || typeof card.userId === 'number') &&
    typeof card.createdAt === 'string' &&
    typeof card.updatedAt === 'string'
  );
}

/**
 * Valida estructura de Note
 */
export function validateNote(data: unknown): data is Note {
  if (!data || typeof data !== 'object') return false;

  const note = data as Record<string, unknown>;

  return (
    typeof note.id === 'number' &&
    typeof note.title === 'string' &&
    typeof note.content === 'string' &&
    (note.color === undefined || typeof note.color === 'string') &&
    Array.isArray(note.tags) &&
    (note.userId === undefined || typeof note.userId === 'number') &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string'
  );
}

/**
 * Valida estructura de Message
 */
export function validateMessage(data: unknown): data is Message {
  if (!data || typeof data !== 'object') return false;

  const message = data as Record<string, unknown>;

  return (
    typeof message.id === 'number' &&
    typeof message.prompt === 'string' &&
    typeof message.response === 'string' &&
    typeof message.chatId === 'number' &&
    typeof message.userId === 'number' &&
    typeof message.createdAt === 'string' &&
    (message.updatedAt === undefined || typeof message.updatedAt === 'string')
  );
}

/**
 * Valida estructura de Chat
 */
export function validateChat(data: unknown): data is Chat {
  if (!data || typeof data !== 'object') return false;

  const chat = data as Record<string, unknown>;

  return (
    typeof chat.id === 'number' &&
    (chat.title === undefined || typeof chat.title === 'string') &&
    Array.isArray(chat.messages) &&
    chat.messages.every(validateMessage) &&
    (chat.userId === undefined || typeof chat.userId === 'number') &&
    typeof chat.createdAt === 'string' &&
    typeof chat.updatedAt === 'string'
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

    // Proporcionar información de depuración
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      console.warn(`[${context}] Received keys:`, keys);
      console.warn(`[${context}] Data:`, data);
    }

    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Logger para validaciones fallidas
 */
export function logValidationError(context: string, data: unknown, validator: string) {
  console.error(`❌ Validation failed for ${context}`);
  console.error(`   Validator: ${validator}`);
  console.error(`   Data:`, data);

  if (typeof data === 'object' && data !== null) {
    console.error(`   Keys:`, Object.keys(data));
  }
}

/**
 * Batch validator para arrays
 */
export function validateArray<T>(
  data: unknown,
  validator: (data: unknown) => data is T,
  context: string,
): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push(`${context}: Expected array, got ${typeof data}`);
    return { valid: false, errors };
  }

  for (let i = 0; i < data.length; i++) {
    if (!validator(data[i])) {
      errors.push(`${context}[${i}]: Invalid item at index ${i}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Safe type assertion con logging
 */
export function safeAssert<T>(
  data: unknown,
  validator: (data: unknown) => data is T,
  context: string,
  fallback: T,
): T {
  if (validator(data)) {
    return data;
  }

  logValidationError(context, data, validator.name);
  return fallback;
}

/**
 * Schema builder para validaciones custom
 */
export interface FieldValidator {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  custom?: (value: unknown) => boolean;
}

export function createObjectValidator(schema: Record<string, FieldValidator>) {
  return (data: unknown): data is Record<string, any> => {
    if (!data || typeof data !== 'object') return false;

    const obj = data as Record<string, unknown>;

    for (const [key, validator] of Object.entries(schema)) {
      const value = obj[key];

      if (validator.required && (value === null || value === undefined)) {
        return false;
      }

      if (value !== null && value !== undefined) {
        if (typeof value !== validator.type) {
          return false;
        }

        if (validator.custom && !validator.custom(value)) {
          return false;
        }
      }
    }

    return true;
  };
}
