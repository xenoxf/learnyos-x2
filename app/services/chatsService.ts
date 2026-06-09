/**
 * ChatsService - Handles chat messages
 */
import { httpClient } from "./client";
import type { Chat, SendMessageData, SendMessageResponse, GetChatMessagesResponse, StreamChunk } from "@/types";

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
   * Envía un mensaje con archivos adjuntos al chat mediante streaming SSE.
   * Usa XHR para tracking de progreso de subida.
   */
  async *sendMessageStreamWithFile(
    data: {
      prompt?: string;
      chatId?: number;
      files: File[];
    },
    onProgress?: (pct: number) => void,
  ): AsyncIterable<StreamChunk> {
    const token = httpClient.getToken();
    const formData = new FormData();
    for (const f of data.files) {
      formData.append("files", f);
    }
    if (data.prompt) formData.append("prompt", data.prompt);
    if (data.chatId) formData.append("chatId", String(data.chatId));

    const xhr = new XMLHttpRequest();

    const result = await new Promise<ReadableStream<Uint8Array>>((resolve, reject) => {
      xhr.open("POST", `${API_BASE}/messages/send/stream/with-file`);

      if (API_KEY) xhr.setRequestHeader("x-api-key", API_KEY);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve((xhr as any).response as ReadableStream<Uint8Array>);
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.message || `Error: ${xhr.status}`));
          } catch {
            reject(new Error(`Error: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Error de conexión"));
      (xhr as any).responseType = "stream";
      xhr.send(formData);
    });

    const response = new Response(result);
    yield* streamFromResponse(response);
  },

  deleteChat(chatId: number): Promise<void> {
    return httpClient.request<void>(`/messages/chat/${chatId}`, { method: "DELETE" });
  },

  deleteAllChats(): Promise<void> {
    return httpClient.request<void>("/messages/chat/all", { method: "DELETE" });
  },
};
