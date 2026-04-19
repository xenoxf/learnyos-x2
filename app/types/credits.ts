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
