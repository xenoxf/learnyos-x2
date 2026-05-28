export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: number;
  chatId?: number | null;
  content: string;
  role: MessageRole;
  createdAt: string;
  file?: {
    name: string;
    url?: string;
    type: string;
  };
}

export interface Chat {
  id: number;
  title: string;
  messages?: ChatMessage[];
  messageCount?: number;
  userId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: number;
  prompt: string;
  response: string;
  chatId?: number;
  userId?: number;
  createdAt: string;
}

export interface SendMessageData {
  prompt: string;
  chatId?: number;
}

/** Datos para enviar un mensaje con archivo adjunto */
export interface SendMessageWithFileData {
  prompt?: string;
  chatId?: number;
  file: File;
}

/** Respuesta del backend POST /messages/send - devuelve la entidad Message */
export interface SendMessageResponse {
  id: number;
  chatId?: number;
  response: string;
  prompt: string;
  createdAt: string;
}

/** Respuesta del backend GET /messages/chat/:chatId */
export interface GetChatMessagesResponse {
  chatId: number;
  title?: string;
  messages: Array<{
    id: number;
    prompt: string;
    response: string;
    createdAt: string;
  }>;
}

export interface StreamChunk {
  type: "credits" | "chunk" | "done";
  content?: string;
  remaining?: number;
  total?: number;
  messageId?: number;
}
