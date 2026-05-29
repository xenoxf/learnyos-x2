export type DifficultyLevel =
  | "very_easy"
  | "easy"
  | "medium"
  | "hard"
  | "very_hard"
  | "expert";

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
  contextId?: string;
  contextContent?: string;
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
  type?: "quiz" | "icfes";
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
  type?: "quiz" | "icfes";
  totalQuestions: number;
  questions: ExamQuestion[];
  creatorName?: string;
  canDelete?: boolean;
  code?: string;
  createdAt?: string;
}

export interface GenerateExamData {
  reference: string;
  numberOfQuestions: number;
  difficulty: string;
  type?: "quiz" | "icfes";
  acceso?: string;
  file?: File;
  files?: File[];
}

export interface GenerateQuickQuizData {
  topic: string;
  numberOfQuestions: number;
  difficulty: string;
  type?: "quiz" | "icfes";
  acceso?: string;
}

export interface QuickQuizDeck extends ExamDeck {}
export interface QuickQuizKlek extends ExamKlek {}
export interface QuickQuizQuestion extends ExamQuestion {}
export interface QuickQuizOption extends ExamOption {}
