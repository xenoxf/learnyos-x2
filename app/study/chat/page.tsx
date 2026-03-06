"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
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
  Menu,
} from "lucide-react";
import styles from "@/styles/chat.module.css";
import DashboardLayout from "../layaut";
import type { ChatMessage, Chat } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  // ==================== STATE ====================
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // ==================== SUGERENCIAS ====================
  const suggestions = [
    {
      icon: "🧠",
      title: "Ciencia",
      text: "Explica la teoría cuántica"
    },
    {
      icon: "🤖",
      title: "Tecnología",
      text: "¿Cómo funciona el machine learning?"
    },
    {
      icon: "📚",
      title: "Historia",
      text: "Resumen de la Segunda Guerra Mundial"
    },
    {
      icon: "📊",
      title: "Economía",
      text: "Conceptos básicos de economía"
    },
    {
      icon: "🎨",
      title: "Arte",
      text: "Historia del arte renacentista"
    },
    {
      icon: "💡",
      title: "Consejos",
      text: "Consejos para ser más productivo"
    }
  ];

  // ==================== DETECTAR MÓVIL ====================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==================== CARGAR DATOS ====================
  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ==================== FUNCIONES API ====================
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
          role: "user",
          createdAt: String(m.createdAt)
        },
        {
          id: m.id * 2 + 1,
          chatId: response.chatId,
          content: m.response,
          role: "assistant",
          createdAt: String(m.createdAt)

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
      createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
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
    if (isMobile) setIsSidebarOpen(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleSelectChat = async (chat: Chat) => {
    setCurrentChat(chat);
    await loadChatMessages(chat.id);
    if (isMobile) setIsSidebarOpen(false);
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return "Ayer";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // ==================== RENDER ====================
  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* OVERLAY MÓVIL */}
        {isMobile && isSidebarOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarHeaderTop}>
              <h2>Conversaciones</h2>
              {isMobile && (
                <button
                  className={styles.closeButton}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <button className={styles.newChatButton} onClick={handleNewChat}>
              <Plus size={18} />
              Nuevo chat
            </button>
          </div>

          <div className={styles.chatList}>
            {chats.length === 0 ? (
              <div className={styles.emptyChats}>
                <MessageSquare size={40} />
                <p>No hay conversaciones</p>
                <span>Crea un nuevo chat para empezar</span>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`${styles.chatItem} ${currentChat?.id === chat.id ? styles.active : ""}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <MessageSquare size={18} />
                  <div className={styles.chatInfo}>
                    <span className={styles.chatTitle}>
                      {chat.title || `Chat ${chat.id}`}
                    </span>
                    {chat.messageCount && (
                      <span className={styles.messageCount}>
                        {chat.messageCount} mensajes
                      </span>
                    )}
                  </div>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    aria-label="Eliminar chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

        </aside>

        {/* MAIN CHAT */}
        <main className={styles.main}>
          {/* HEADER */}
          <header className={styles.header}>
            <button
              className={styles.menuButton}
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {currentChat ? (
              <div className={styles.headerInfo}>
                <h3>{currentChat.title || `Chat ${currentChat.id}`}</h3>
                {messages.length > 0 && (
                  <span className={styles.messageStatus}>
                    {messages.length} mensajes
                  </span>
                )}
              </div>
            ) : (
              <div className={styles.headerInfo}>
                <h3>Nuevo chat</h3>
              </div>
            )}
          </header>

          {/* MESSAGES */}
          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.welcome}>
                <div className={styles.welcomeIcon}>
                  <Bot size={48} />
                </div>
                <h1>¡Hola! Soy Junior</h1>
                <p>¿Qué te gustaría preguntar hoy?</p>
                <div className={styles.suggestions}>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className={styles.suggestionCard}
                      onClick={() => setInputValue(suggestion.text)}
                    >
                      <span className={styles.suggestionIcon}>{suggestion.icon}</span>
                      <div className={styles.suggestionContent}>
                        <span className={styles.suggestionTitle}>{suggestion.title}</span>
                        <span className={styles.suggestionText}>{suggestion.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.botMessage}`}
                  >
                    <div className={styles.messageAvatar}>
                      {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={styles.messageBubble}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageSender}>
                          {msg.role === "user" ? "Tú" : "Junior"}
                        </span>
                        <span className={styles.messageTime}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <div className={styles.messageContent}>
                        {msg.role === "assistant" ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          msg.content
                        )}
                      </div>
                      {msg.role === "assistant" && (
                        <button
                          className={styles.copyButton}
                          onClick={() => handleCopyMessage(msg.content, msg.id)}
                          title="Copiar respuesta"
                        >
                          {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className={`${styles.message} ${styles.botMessage}`}>
                    <div className={styles.messageAvatar}>
                      <Bot size={18} />
                    </div>
                    <div className={styles.typing}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* INPUT */}
          <div className={styles.inputArea}>
            <div className={styles.inputContainer}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder="Escribe tu mensaje..."
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
                {isLoading ? <Loader size={18} className={styles.spin} /> : <Send size={18} />}
              </button>
            </div>
            <p className={styles.disclaimer}>
              Junior puede cometer errores. Considera verificar información importante.
            </p>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
