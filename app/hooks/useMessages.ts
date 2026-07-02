"use client";

import { useState, useEffect } from "react";
import type { Chat, ChatMessage } from "@/types";
import { chatsService } from "@/services/chatsService";

export function useMessages() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await chatsService.getChats();
        setChats(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Error al cargar chats");
        setChats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev: ChatMessage[]) => [...prev, message]);
  };

  const addChat = (chat: Chat) => {
    setChats((prev: Chat[]) => [...prev, chat]);
  };

  const removeChat = (chatId: number) => {
    setChats((prev: Chat[]) => prev.filter((c) => c.id !== chatId));
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  };

  return {
    chats,
    selectedChat,
    messages,
    loading,
    error,
    currentTool,
    setSelectedChat,
    setMessages,
    addMessage,
    addChat,
    removeChat,
    setCurrentTool,
  };
}
