"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Chat,
  ChatMessage,
  SendMessageData,
  SendMessageResponse,
  GetChatMessagesResponse,
} from "@/types";
import { chatsService } from "@/services/chatsService";

function toChatMessages(res: GetChatMessagesResponse): ChatMessage[] {
  const list = res.messages ?? [];
  return list.flatMap((m) => [
    {
      id: m.id * 2,
      chatId: res.chatId,
      content: m.prompt,
      role: "user" as const,
      createdAt: String(m.createdAt),
      updatedAt: String(m.createdAt),
    },
    {
      id: m.id * 2 + 1,
      chatId: res.chatId,
      content: m.response,
      role: "assistant" as const,
      createdAt: String(m.createdAt),
      updatedAt: String(m.createdAt),
    },
  ]);
}

export const useMessagesChat = () => {
  const queryClient = useQueryClient();

  const { data: chats = [], isLoading: isLoadingChats } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: () => chatsService.getChats(),
    enabled: !!localStorage.getItem("token"),
  });

  const sendMessageMutation = useMutation<
    SendMessageResponse,
    unknown,
    SendMessageData
  >({
    mutationFn: (data) => chatsService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const deleteChatMutation = useMutation<void, unknown, number>({
    mutationFn: (chatId: number) => chatsService.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const getChatMessages = useCallback(
    async (chatId: number): Promise<ChatMessage[]> => {
      const res = await chatsService.getChatMessages(chatId);
      return toChatMessages(res);
    },
    [],
  );

  return {
    chats,
    isLoadingChats,
    sendMessage: sendMessageMutation.mutateAsync,
    getChatMessages,
    deleteChat: deleteChatMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
};
