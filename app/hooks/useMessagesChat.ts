'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import type { Message, Chat } from '@/types';

export const useMessagesChat = () => {
  const queryClient = useQueryClient();

  const { data: chats = [], isLoading: isLoadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: () => apiService.getUserChats(),
    enabled: apiService.isAuthenticated(),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => apiService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const getChatMessagesMutation = useQuery({
    queryKey: ['messages'],
    queryFn: ({ queryKey }: any) => {
      const chatId = queryKey[1];
      return chatId ? apiService.getChatMessages(chatId) : Promise.resolve([]);
    },
    enabled: false,
  });

  const deleteChatMutation = useMutation({
    mutationFn: (chatId: number) => apiService.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const getChatMessages = useCallback(async (chatId: number) => {
    return apiService.getChatMessages(chatId);
  }, []);

  return {
    chats,
    isLoadingChats,
    sendMessage: sendMessageMutation.mutateAsync,
    getChatMessages,
    deleteChat: deleteChatMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
};
