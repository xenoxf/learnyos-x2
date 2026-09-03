export interface UserAnswer {
  questionId: number;
  selectedOptionId: number;
  isCorrect: boolean;
}

export interface Attempt {
  id: number;
  examId: number;
  userId: number;
  correctAnswers: number;
  totalQuestions: number;
  examTitle: string;
  attemptedAt: string;
  percentage: number;
  userAnswers: UserAnswer[] | null;
  // Información del exam (del formatter del backend)
  examCode: string;
  examArea: string;
  examTema: string;
  examDifficulty: string;
  examCreatorName: string;
  examDescription: string;
  examType: string;
  timeSpent?: number;
  isAutoSubmitted?: boolean;
}

export type StatsHeroProps = {
  totalAttempts: number;
  avgCorrect: number;
  bestScore: number;
  totalQuestions: number;
};
