export interface PomodoroConfig {
  workDuration: number;
  breakDuration: number;
  sessionsBeforeLongBreak: number;
  longBreakDuration: number;
  autoStartBreak: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface ManageItem {
  id: number;
  title: string;
  description?: string;
  code?: string;
  lenght?: number;
  difficulty?: string;
  area?: string;
  tema?: string;
  creatorName?: string;
  likesCount?: number;
  userLiked?: boolean;
  createdAt?: string;
  canDelete?: boolean;
  type?: "note" | "exam" | "flashcard" | "quiz" | "icfes";
}

export type UnifiedCardData = ManageItem & {
  // Fields that might come from different deck types
  totalQuestions?: number;
  totalCards?: number;
  contentsCount?: number;
  examType?: "quiz" | "icfes";
};

export interface LikeStatus {
  liked: boolean;
  count: number;
}

export interface LikeInfo {
  count: number;
  userLiked: boolean;
}
