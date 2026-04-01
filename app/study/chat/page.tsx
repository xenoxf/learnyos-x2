"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Bot,
  User,
  PanelLeftClose,
  PanelLeft,
  Calendar,
} from "lucide-react";
import styles from "@/styles/chat.module.css";
import type { ChatMessage, Chat } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

interface MessageWithDate {
  date: string;
  messages: ChatMessage[];
}

export default function ChatPage() {
  // ==================== STATE ====================
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Control de carga inicial para evitar múltiples peticiones
  const isInitialLoad = useRef(true);

  // ==================== SUGERENCIAS ====================
  const suggestions = [
    { icon: "🧠", title: "Ciencia", text: "Explica la teoría cuántica" },
    {
      icon: "🤖",
      title: "Tecnología",
      text: "¿Cómo funciona el machine learning?",
    },
    {
      icon: "📚",
      title: "Historia",
      text: "Resumen de la Segunda Guerra Mundial",
    },
  ];

  // ==================== DETECTAR MÓVIL ====================
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ==================== CARGAR CHATS (CON DEBOUNCE) ====================
  const loadChats = useCallback(async () => {
    if (isLoadingChats) return; // Evitar múltiples peticiones simultáneas

    try {
      setIsLoadingChats(true);
      const response = await apiService.getChats();
      setChats(Array.isArray(response) ? response : []);
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los chats",
        variant: "destructive",
      });
    } finally {
      setIsLoadingChats(false);
      isInitialLoad.current = false;
    }
  }, [toast, isLoadingChats]);

  // Carga inicial única
  useEffect(() => {
    if (isInitialLoad.current && !isLoadingChats) {
      loadChats();
    }
  }, [loadChats, isLoadingChats]);

  // ==================== CARGAR MENSAJES ====================
  const loadChatMessages = async (chatId: number) => {
    try {
      setIsLoadingMessages(true);
      const response = await apiService.getChatMessages(chatId);
      const messagesList = response.messages ?? [];

      const chatMessages: ChatMessage[] = messagesList.flatMap((m) => [
        {
          id: m.id * 2,
          chatId: response.chatId,
          content: m.prompt,
          role: "user",
          createdAt: String(m.createdAt),
        },
        {
          id: m.id * 2 + 1,
          chatId: response.chatId,
          content: m.response,
          role: "assistant",
          createdAt: String(m.createdAt),
        },
      ]);

      setMessages(chatMessages);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // ==================== ENVIAR MENSAJE ====================
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    adjustTextareaHeight();

    // Optimistic update
    const tempId = Date.now();
    const userMessage: ChatMessage = {
      id: tempId,
      chatId: currentChat?.id,
      content: messageContent,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await apiService.sendMessage({
        prompt: messageContent,
        chatId: currentChat?.id,
      });

      const assistantMessage: ChatMessage = {
        id: response.id,
        chatId: response.chatId,
        content: response.response,
        role: "assistant",
        createdAt: response.createdAt ?? new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Si es un chat nuevo, actualizar la lista
      if (response.chatId && !currentChat) {
        await loadChats();
        setCurrentChat({
          id: response.chatId,
          title: "Nuevo Chat",
          messageCount: 2,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Rollback en caso de error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));

      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== NUEVO CHAT ====================
  const handleNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setInputValue("");
    if (isMobile) setIsSidebarOpen(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  // ==================== SELECCIONAR CHAT ====================
  const handleSelectChat = async (chat: Chat) => {
    setCurrentChat(chat);
    await loadChatMessages(chat.id);
    if (isMobile) setIsSidebarOpen(false);
  };

  // ==================== ELIMINAR CHAT ====================
  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await apiService.deleteChat(chatId);

      // Actualizar lista
      setChats((prev) => prev.filter((c) => c.id !== chatId));

      // Si el chat actual fue eliminado, crear nuevo
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

  // ==================== COPIAR MENSAJE ====================
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
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "auto",
          block: "end"
        });
      }
    });
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;

      if (textarea.scrollHeight > 120) {
        textarea.scrollTop = textarea.scrollHeight - 120;
      }
    }
  }, []);

  // Scroll automático cuando llegan nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ==================== AGRUPAR MENSAJES POR FECHA ====================
  const messagesByDate = useMemo(() => {
    const groups: MessageWithDate[] = [];
    let currentDate = "";

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({
          date: msgDate,
          messages: [msg],
        });
      } else {
        const lastGroup = groups[groups.length - 1];
        lastGroup.messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  // ==================== FORMAT TIME ====================
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==================== RENDER ====================
  return (
    <div className={styles.container}>
      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ""
          } ${isMobile && isSidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Conversaciones</h2>
          <button className={styles.newChatButton} onClick={handleNewChat}>
            <Plus size={18} />
            Nuevo chat
          </button>
        </div>

        <div className={styles.chatList}>
          {isLoadingChats ? (
            // Skeleton para chats
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.chatItemSkeleton}>
                <Skeleton className={styles.skeletonIcon} />
                <div className={styles.chatInfoSkeleton}>
                  <Skeleton className={styles.skeletonTitle} />
                  <Skeleton className={styles.skeletonMeta} />
                </div>
              </div>
            ))
          ) : chats.length === 0 ? (
            <div className={styles.emptyChats}>
              <MessageSquare size={40} />
              <p>No hay conversaciones</p>
              <span>Crea un nuevo chat para empezar</span>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`${styles.chatItem} ${currentChat?.id === chat.id ? styles.active : ""
                  }`}
                onClick={() => handleSelectChat(chat)}
              >
                <MessageSquare size={18} />
                <div className={styles.chatInfo}>
                  <span className={styles.chatTitle}>
                    {chat.title || `Chat ${chat.id}`}
                  </span>
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

      {/* BOTÓN TOGGLE */}
      <button
        className={`${styles.toggleButton} ${!isSidebarOpen ? styles.toggleButtonClosed : ""
          }`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? "Ocultar historial" : "Mostrar historial"}
      >
        {isSidebarOpen ? (
          <PanelLeftClose size={18} />
        ) : (
          <PanelLeft size={18} />
        )}
      </button>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        {/* MESSAGES */}
        <div className={styles.messages}>
          {messages.length === 0 && !isLoadingMessages ? (
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
                    <span className={styles.suggestionIcon}>
                      {suggestion.icon}
                    </span>
                    <div className={styles.suggestionContent}>
                      <span className={styles.suggestionTitle}>
                        {suggestion.title}
                      </span>
                      <span className={styles.suggestionText}>
                        {suggestion.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : isLoadingMessages ? (
            // Skeleton para mensajes
            <div className={styles.messagesSkeleton}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.messageSkeleton}>
                  <Skeleton className={styles.skeletonAvatar} />
                  <div className={styles.messageContentSkeleton}>
                    <Skeleton className={styles.skeletonLine1} />
                    <Skeleton className={styles.skeletonLine2} />
                    <Skeleton className={styles.skeletonLine3} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {messagesByDate.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {/* Separador de fecha */}
                  <div className={styles.dateSeparator}>
                    <Calendar size={14} />
                    <span>{group.date}</span>
                  </div>

                  {/* Mensajes del grupo */}
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${msg.role === "user"
                        ? styles.userMessage
                        : styles.botMessage
                        }`}
                    >
                      {msg.role === "user" ? (
                        <div className={styles.messageAvatar}>
                          <User size={18} />
                        </div>
                      ) : null}
                      <div className={styles.messageContent}>
                        <div className={styles.messageText}>
                          {msg.role === "assistant" ? (
                            <MarkdownRenderer content={msg.content} />
                          ) : (
                            msg.content
                          )}
                        </div>
                        <div className={styles.messageMeta}>
                          {msg.role === "assistant" && (
                            <button
                              className={styles.copyButton}
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
                          )}
                          <span className={styles.messageTime}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
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

        {/* INPUT AREA */}
        <div className={styles.inputArea}>
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
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
                  <Loader size={18} className={styles.spin} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
          <p className={styles.disclaimer}>
            Junior puede cometer errores. Considera verificar información
            importante.
          </p>
        </div>
      </main>

      {/* OVERLAY PARA MÓVIL */}
      {isMobile && isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
