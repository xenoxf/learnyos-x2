"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Send,
  Trash2,
  Copy,
  Check,
  Loader,
  Plus,
  MessageSquare,
  X,
  Bot,
  User,
  Clock,
  Menu,
  Sparkles,
} from "lucide-react";
import styles from "@/styles/chat.module.css";
import DashboardLayout from "../layaut";
import type { ChatMessage, Chat, SendMessageData, SendMessageResponse } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  // ==================== STATE ====================
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // ==================== LOAD INITIAL DATA ====================
  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ==================== API FUNCTIONS ====================
  const loadChats = async () => {
    try {
      const response = await apiService.getChats();
      setChats(Array.isArray(response) ? response : []);
    } catch (_err) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los chats",
        variant: "destructive",
      });
    }
  };

  const loadChatMessages = async (chatId: number) => {
    try {
      const response = await apiService.getChatMessages(chatId);
      const list = response.messages ?? [];
      const chatMessages: ChatMessage[] = list.flatMap((m) => [
        {
          id: m.id * 2,
          chatId: response.chatId,
          content: m.prompt,
          role: "user" as const,
          createdAt: String(m.createdAt),
          updatedAt: String(m.createdAt),
        },
        {
          id: m.id * 2 + 1,
          chatId: response.chatId,
          content: m.response,
          role: "assistant" as const,
          createdAt: String(m.createdAt),
          updatedAt: String(m.createdAt),
        },
      ]);
      setMessages(chatMessages);
    } catch (_err) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    adjustTextareaHeight();

    const userMessage: ChatMessage = {
      id: Date.now(),
      chatId: currentChat?.id ?? 0,
      content: messageContent,
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await apiService.sendMessage({
        prompt: messageContent,
        chatId: currentChat?.id,
      });

      const assistantMessage: ChatMessage = {
        id: response.messageId,
        chatId: response.chatId,
        content: response.response,
        role: "assistant",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!currentChat && response.chatId) {
        await loadChats();
        const newChat = chats.find((c) => c.id === response.chatId);
        if (newChat) {
          setCurrentChat(newChat);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });

      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setInputValue("");
    setIsSidebarOpen(false);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSelectChat = async (chat: Chat) => {
    setCurrentChat(chat);
    await loadChatMessages(chat.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await apiService.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));

      if (currentChat?.id === chatId) {
        handleNewChat();
      }

      toast({
        title: "Éxito",
        description: "Chat eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el chat",
        variant: "destructive",
      });
    }
  };

  const handleCopyMessage = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);

      toast({
        title: "Copiado",
        description: "Mensaje copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el mensaje",
        variant: "destructive",
      });
    }
  };

  // ==================== UTILS ====================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200,
      )}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==================== RENDER ====================
  return (
    <DashboardLayout>
      <div className={styles.chatContainer}>
        {/* SIDEBAR - HISTORIAL DE CHATS */}
        <div
          className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}
        >
          <div className={styles.sidebarHeader}>
            <button className={styles.newChatButton} onClick={handleNewChat}>
              <Plus size={18} />
              Nuevo Chat
            </button>
            <button
              className={styles.menuToggle}
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.chatHistory}>
            {chats.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "hsl(var(--muted-foreground))",
                  padding: "2rem 1rem",
                }}
              >
                <MessageSquare
                  size={32}
                  style={{ margin: "0 auto 1rem", opacity: 0.5 }}
                />
                <p>No hay chats aún</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  Crea uno nuevo para empezar
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`${styles.chatHistoryItem} ${
                    currentChat?.id === chat.id ? styles.active : ""
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <MessageSquare size={16} style={{ opacity: 0.7 }} />
                  <span className={styles.chatHistoryTitle}>
                    {chat.title || `Chat ${chat.id}`}
                  </span>
                  <div className={styles.chatHistoryMeta}>
                    {chat.messageCount && (
                      <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                        {chat.messageCount}
                      </span>
                    )}
                    <button
                      className={styles.deleteChatButton}
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      aria-label="Eliminar chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className={styles.mainChat}>
          {/* HEADER */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderInfo}>
              <button
                className={styles.menuToggle}
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <Bot size={36} color="white" />
                </div>
                <h3>¿Qué quieres aprender hoy?</h3>
                <p>
                  Pregúntame sobre cualquier tema y te ayudaré a entenderlo
                  mejor
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginTop: "1rem",
                  }}
                >
                  {[
                    "Explica la teoría cuántica",
                    "¿Cómo funciona el machine learning?",
                    "Resumen de la Segunda Guerra Mundial",
                    "Conceptos básicos de economía",
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInputValue(suggestion)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "hsl(var(--muted) / 0.3)",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "20px",
                        fontSize: "0.875rem",
                        color: "hsl(var(--foreground))",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "hsl(var(--muted) / 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "hsl(var(--muted) / 0.3)";
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`${styles.messageWrapper} ${
                      msg.role === "user" ? styles.user : styles.assistant
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <div className={styles.avatar}>
                        {msg.role === "user" ? (
                          <User size={18} color="white" />
                        ) : (
                          <Bot size={18} color="white" />
                        )}
                      </div>
                      <div className={styles.messageBody}>
                        <div className={styles.messageHeader}>
                          <span className={styles.messageSender}>
                            {msg.role === "user" ? "Tú" : "Junior"}
                          </span>
                          <span className={styles.messageTime}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <div className={styles.messageText}>
                          {msg.role === "assistant" ? (
                            <MarkdownRenderer content={msg.content} />
                          ) : (
                            msg.content
                          )}
                        </div>
                        {msg.role === "assistant" && (
                          <div className={styles.messageActions}>
                            <button
                              className={styles.messageActionButton}
                              onClick={() =>
                                handleCopyMessage(msg.content, msg.id)
                              }
                              title="Copiar respuesta"
                            >
                              {copiedId === msg.id ? (
                                <Check size={14} />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* TYPING INDICATOR */}
                {isLoading && (
                  <div
                    className={`${styles.messageWrapper} ${styles.assistant}`}
                  >
                    <div className={styles.messageContent}>
                      <div className={styles.avatar}>
                        <Bot size={18} color="white" />
                      </div>
                      <div className={styles.typingIndicator}>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* INPUT AREA */}
          <div className={styles.inputArea}>
            <div className={styles.inputContainer}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder="Envía un mensaje..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading}
              />
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "hsl(var(--muted-foreground))",
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            >
              Junior puede cometer errores. Considera verificar información
              importante.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
