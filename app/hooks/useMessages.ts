"use client"

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';

export function useMessages() {
  const [chats, setChats] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserChats();
      setChats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChat = useCallback(async (chatId: number) => {
    try {
      setLoading(true);
      const data = await apiService.getChatMessages(chatId);
      setCurrentChat(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (prompt: string, chatId?: number) => {
    try {
      const response = await apiService.sendMessage(prompt, chatId);
      if (chatId) {
        await loadChat(chatId);
      } else {
        await loadChats();
      }
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [loadChats, loadChat]);

  const deleteChat = useCallback(async (chatId: number) => {
    try {
      await apiService.deleteChat(chatId);
      setChats(chats.filter(c => c.id !== chatId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [chats]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return { chats, currentChat, loading, error, sendMessage, deleteChat, loadChats, loadChat };
}