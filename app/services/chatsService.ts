/**
 * ChatsService - Handles chat messages
 */
import { httpClient } from "./client";
import type { Chat, ChatMessage, SendMessageData, SendMessageResponse, GetChatMessagesResponse, StreamChunk } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const API_KEY = String(process.env.NEXT_PUBLIC_BACKEND_API_KEY || "");

async function* streamFromResponse(response: Response): AsyncIterable<StreamChunk> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Streaming no soportado");
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            yield JSON.parse(line.slice(6));
          } catch { /* ignore */ }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export const chatsService = {
  getChats(): Promise<Chat[]> {
    return httpClient.request<Chat[]>("/messages/chats", { method: "GET" });
  },

  getChat(id: number): Promise<Chat> {
    return httpClient.request<Chat>(`/messages/chat/${id}`, { method: "GET" });
  },

  createChat(data: { title: string }): Promise<Chat> {
    return httpClient.request<Chat>("/messages/chats", { method: "POST", body: JSON.stringify(data) });
  },

  getChatMessages(chatId: number): Promise<GetChatMessagesResponse> {
    return httpClient.request<GetChatMessagesResponse>(`/messages/chat/${chatId}`, { method: "GET" });
  },

  sendMessage(data: SendMessageData): Promise<SendMessageResponse> {
    return httpClient.request<SendMessageResponse>("/messages/send", { method: "POST", body: JSON.stringify(data) });
  },

  async *sendMessageStream(data: SendMessageData): AsyncIterable<StreamChunk> {
    const stream = await httpClient.requestStream("/messages/send/stream", data);
    for await (const chunk of stream) {
      yield chunk as StreamChunk;
    }
  },

  /**
   * Envía un mensaje con archivo adjunto al chat mediante streaming SSE.
   * Usa FormData para enviar el archivo junto con el prompt.
   */
  async *sendMessageStreamWithFile(data: {
    prompt?: string;
    chatId?: number;
    file: File;
  }): AsyncIterable<StreamChunk> {
    const token = httpClient.getToken();
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.prompt) formData.append("prompt", data.prompt);
    if (data.chatId) formData.append("chatId", String(data.chatId));

    const headers: Record<string, string> = {};
    if (API_KEY) headers["x-api-key"] = API_KEY;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/messages/send/stream/with-file`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    yield* streamFromResponse(response);
  },

  deleteChat(chatId: number): Promise<void> {
    return httpClient.request<void>(`/messages/chat/${chatId}`, { method: "DELETE" });
  },

  deleteAllChats(): Promise<void> {
    return httpClient.request<void>("/messages/chat/all", { method: "DELETE" });
  },
};
