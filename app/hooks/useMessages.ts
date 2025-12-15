"use client"

import { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import type { Chat, Message, SendMessageInput, SendMessageResponse } from '@/types';

export interface UseMessagesReturn {
  chats: Chat[];
  messages: Message[];
  currentChatId: number | null;
  loading: boolean;
  error: string | null;
  getChats: () => Promise<Chat[]>;
  getChatById: (id: number) => Promise<Chat>;
  createChat: (data: { title?: string }) => Promise<Chat>;
  getMessages: (chatId: number) => Promise<Message[]>;
  sendMessage: (input: SendMessageInput) => Promise<SendMessageResponse>;
  deleteChat: (id: number) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
  selectChat: (chatId: number) => Promise<void>;
}

export function useMessages(): UseMessagesReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getChats();
      setChats(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getChatById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getChatById(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createChat = useCallback(async (data: { title?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const newChat = await apiService.createChat(data);
      setChats([...chats, newChat]);
      return newChat;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [chats]);

  const getMessages = useCallback(async (chatId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getMessages(chatId);
      setMessages(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (input: SendMessageInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.sendMessage(input);
      // Handle both response formats
      const messagesToAdd: Message[] = [];
      if ((response as any).message) {
        messagesToAdd.push((response as any).message);
      }
      if ((response as any).reply) {
        messagesToAdd.push((response as any).reply);
      }
      if ((response as any).userMessage) {
        messagesToAdd.push((response as any).userMessage);
      }
      if ((response as any).aiMessage) {
        messagesToAdd.push((response as any).aiMessage);
      }
      if (messagesToAdd.length > 0) {
        setMessages([...messages, ...messagesToAdd]);
      }
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const deleteChat = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteChat(id);
      setChats(chats.filter((c) => c.id !== id));
      if (currentChatId === id) {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [chats, currentChatId]);

  const deleteMessage = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteMessage(id);
      setMessages(messages.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const selectChat = useCallback(async (chatId: number) => {
    setCurrentChatId(chatId);
    await getMessages(chatId);
  }, [getMessages]);

  useEffect(() => {
    getChats();
  }, []);

  return {
    chats,
    messages,
    currentChatId,
    loading,
    error,
    getChats,
    getChatById,
    createChat,
    getMessages,
    sendMessage,
    deleteChat,
    deleteMessage,
    selectChat,
  };
}