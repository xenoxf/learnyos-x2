/**
 * Tipos para el Chat Global
 */

export interface GlobalChatMessage {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    email: string;
    picture?: string;
  };
  userId: number;
  createdAt: string;
}

export interface CreateGlobalChatMessageDto {
  content: string;
}
