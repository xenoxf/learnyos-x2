export interface DashboardStats {
  totalExams: number;
  totalFlashcards: number;
  totalNotes: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  totalStudyTime: number;
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: { date: string; count: number }[];
  subjectBreakdown: { subject: string; exams: number; averageScore: number; attempts: number }[];
}

export interface SubjectPerformance {
  subject: string;
  totalExams: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  weakAreas: string[];
}

export interface WeeklyActivity {
  date: string;
  count: number;
}

export interface StreakInfo {
  current: number;
  longest: number;
}
