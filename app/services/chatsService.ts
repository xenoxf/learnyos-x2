/**
 * ChatsService - Handles chat messages
 */
import { httpClient } from "./client";
import type { Chat, ChatMessage, SendMessageData, SendMessageResponse, GetChatMessagesResponse, StreamChunk } from "@/types";

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
};
