/**
 * Tipos globales para la aplicación LearnYos
 */

// ==================== AUTH ====================

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
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

export interface GoogleAuthInput {
  idToken: string;
}

export interface GoogleUser extends User {
  googleId?: string;
  picture?: string;
}

// ==================== EXAM ====================

export interface ExamOption {
  id: number;
  questionId: number;
  option: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  id: number;
  examId: number;
  question: string;
  options: ExamOption[];
  correctAnswer: string;
  createdAt: Date;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  questions?: ExamQuestion[];
  score?: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== GENERATE INPUTS ====================

export interface GenerateExamInput {
  topic?: string;
  referenceText?: string;
  reference?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  numberOfQuestions?: number;
  language?: string;
}

export interface GenerateFlashcardsInput {
  topic?: string;
  referenceText?: string;
  reference?: string;
  numberOfCards?: number;
  language?: string;
}

export interface GenerateNoteInput {
  topic?: string;
  referenceText?: string;
  reference?: string;
  language?: string;
}

// ==================== RESPONSE TYPES ====================

export interface GenerateExamResponse {
  exam: Exam;
  questions: ExamQuestion[];
}

export interface GenerateFlashcardsResponse {
  card: Card;
  flashcards: FlashCard[];
}

// ==================== FLASHCARD ====================

export interface FlashCard {
  id: number;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  tags: string[];
  reviewDate?: string;
  cardId: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  totalCards: number;
  reviewedCards: number;
  lastReviewDate?: string;
  flashcards?: FlashCard[];
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== NOTE ====================

export interface NoteContent {
  id: number;
  noteId: number;
  text: string;
  createdAt: Date;
}

export interface Perfil {
  id: number;
  userId: number;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  color?: string;
  tags: string[];
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== MESSAGE ====================

export interface Message {
  id: number;
  prompt: string;
  response: string;
  chatId: number;
  userId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Chat {
  id: number;
  title?: string;
  messages: Message[];
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageInput {
  prompt: string;
  chatId?: number;
}

export interface SendMessageResponse {
  messages: Message[];
  aiResponse: string;
}

// ==================== API ERROR ====================

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// ==================== COMMON ====================

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
