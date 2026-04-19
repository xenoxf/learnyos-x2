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
  createdAt?: string;
}

export interface LikeStatus {
  liked: boolean;
  count: number;
}

export interface LikeInfo {
  count: number;
  userLiked: boolean;
}
