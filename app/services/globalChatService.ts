/**
 * GlobalChatService - Handles global chat messages
 */
import { httpClient } from "./client";
import type { GlobalChatMessage } from "@/types/globalChat";

export const globalChatService = {
  getMessages(limit?: number): Promise<GlobalChatMessage[]> {
    const url = limit ? `/global-chat/messages?limit=${limit}` : "/global-chat/messages";
    return httpClient.request<GlobalChatMessage[]>(url, { method: "GET" });
  },
  sendMessage(content: string): Promise<GlobalChatMessage> {
    return httpClient.request<GlobalChatMessage>("/global-chat/message", { method: "POST", body: JSON.stringify({ content }) });
  },
  deleteMessage(id: number): Promise<void> {
    return httpClient.request<void>(`/global-chat/message/${id}`, { method: "DELETE" });
  },
};
