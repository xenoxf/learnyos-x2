/**
 * ChatsService - Handles chat messages
 */
import { httpClient } from "./client";
import type { Chat, SendMessageData, SendMessageResponse, GetChatMessagesResponse, StreamChunk, UploadImageResponse } from "@/types";

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

  deleteChat(chatId: number): Promise<void> {
    return httpClient.request<void>(`/messages/chat/${chatId}`, { method: "DELETE" });
  },

  deleteAllChats(): Promise<void> {
    return httpClient.request<void>("/messages/chat/all", { method: "DELETE" });
  },

  async uploadImage(file: File): Promise<UploadImageResponse> {
    const token = httpClient.getToken();
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (API_KEY) headers["x-api-key"] = API_KEY;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/image`, { method: "POST", headers, body: formData });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Upload failed");
    return res.json();
  },

  async uploadImages(files: File[]): Promise<UploadImageResponse[]> {
    const token = httpClient.getToken();
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));

    const headers: Record<string, string> = {};
    if (API_KEY) headers["x-api-key"] = API_KEY;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/images`, { method: "POST", headers, body: formData });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Upload failed");
    return res.json();
  },
};
