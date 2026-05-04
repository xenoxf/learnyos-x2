"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/useLocalToast";
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
  X,
} from "lucide-react";
import styles from "@/styles/chat.module.css";
import type { ChatMessage, Chat } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { chatsService } from "@/services/chatsService";
import { authService } from "@/services/authService";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  // ==================== STATE ====================
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ==================== DETECTAR GUEST ====================
  useEffect(() => {
    setIsGuest(authService.isGuest());
  }, []);

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
      if (mobile) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ==================== CARGAR CHATS ====================
  const loadChats = useCallback(async () => {
    setIsChatsLoading(true);
    try {
      const response = await chatsService.getChats();
      setChats(Array.isArray(response) ? response : []);
    } catch {
      toast.error("Error", "No se pudieron cargar las conversaciones");
    } finally {
      setIsChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) loadChats();
  }, [loadChats, isGuest]);

  // ==================== CARGAR MENSAJES ====================
  const loadChatMessages = useCallback(async (chatId: number) => {
    try {
      const response = await chatsService.getChatMessages(chatId);
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
    } catch {
      toast.error("Error", "No se pudieron cargar los mensajes");
    }
  }, []);

  // ==================== TEXTAREA ====================
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }, []);

  const resetTextareaHeight = useCallback(() => {
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, []);

  // ==================== ENVIAR MENSAJE ====================
  const handleSendMessage = useCallback(async () => {
    if (isGuest) {
      toast.error("Acceso restringido", "Inicia sesión para usar el chat");
      return;
    }
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent("");
    resetTextareaHeight();

    // Si no hay chat actual, el backend creará uno nuevo y devolverá el ID en el evento "done"
    const sendingToExistingChat = !!currentChat;

    // Mensaje del usuario (optimista)
    const userMessage: ChatMessage = {
      id: Date.now(),
      chatId: currentChat?.id,
      content: messageContent,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    let fullContent = "";
    let newChatId: number | undefined;

    try {
      for await (const chunk of chatsService.sendMessageStream({
        prompt: messageContent,
        chatId: currentChat?.id,
      })) {
        if (chunk.type === "chunk") {
          fullContent += chunk.content || "";
          setStreamingContent(fullContent);
        } else if (chunk.type === "done") {
          // El backend devuelve el chatId y messageId en el evento "done"
          newChatId = (chunk as any).chatId;
        }
      }

      // Limpiar streaming
      setStreamingContent("");
      setIsStreaming(false);

      // Si el backend creó un chat nuevo, actualizar el estado
      if (!sendingToExistingChat && newChatId) {
        // Crear el objeto chat localmente con el ID que vino del backend
        const newChat: Chat = {
          id: newChatId,
          title:
            messageContent.slice(0, 40) +
            (messageContent.length > 40 ? "..." : ""),
          createdAt: new Date().toISOString(),
          messageCount: 1,
        };
        setCurrentChat(newChat);
        setChats((prev) => [newChat, ...prev]);
      }

      // Agregar mensaje del asistente
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        chatId: newChatId ?? currentChat?.id,
        content: fullContent,
        role: "assistant",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Recargar lista de chats solo si se creó uno nuevo
      if (!sendingToExistingChat) {
        await loadChats();
      }
    } catch {
      // Remover mensaje optimista en caso de error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      toast.error("Error", "No se pudo obtener la respuesta");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [
    isGuest,
    inputValue,
    isLoading,
    currentChat,
    loadChats,
    resetTextareaHeight,
  ]);

  const handleNewChat = () => {
    if (isGuest) {
      toast.error("Acceso restringido", "Inicia sesión para usar el chat");
      return;
    }
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
    if (isGuest) {
      toast.error("Acceso restringido", "Inicia sesión para eliminar chats");
      return;
    }
    try {
      await chatsService.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
      toast.success("Eliminado", "Conversación eliminada");
    } catch {
      toast.error("Error", "No se pudo eliminar la conversación");
    }
  };

  const handleCopyMessage = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Copiado", "Mensaje copiado al portapapeles");
    } catch {
      toast.error("Error", "No se pudo copiar el mensaje");
    }
  };

  // ==================== SCROLL INTELIGENTE ====================
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Detectar si el usuario está cerca del fondo
  const checkIfNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const threshold = 150; // px desde el fondo
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom <= threshold;
    setShouldAutoScroll(isNearBottomRef.current);
  }, []);

  // Scroll automático - solo si el usuario está cerca del fondo
  const scrollToBottom = useCallback(() => {
    if (!shouldAutoScroll) return;

    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    });
  }, [shouldAutoScroll]);

  // Escuchar scroll del usuario
  const handleMessagesScroll = useCallback(() => {
    checkIfNearBottom();
  }, [checkIfNearBottom]);

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ==================== RENDER ====================
  return (
    <div className={styles.container}>
      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ""} ${isMobile && isSidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Conversaciones</h2>
          <button
            className={styles.newChatButton}
            onClick={handleNewChat}
            disabled={isGuest}
            style={
              isGuest ? { opacity: 0.5, pointerEvents: "none" } : undefined
            }
          >
            <Plus size={18} /> Nuevo chat
          </button>
        </div>

        <div className={styles.chatList}>
          {isChatsLoading ? (
            <div className={styles.loadingChats}>
              <p>Cargando chats</p>
              <Loader size={24} className={styles.spin} />
            </div>
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
                className={`${styles.chatItem} ${currentChat?.id === chat.id ? styles.active : ""}`}
                onClick={() => handleSelectChat(chat)}
              >
                <span className={styles.chatTitle}>
                  {chat.title || `Chat ${chat.id}`}
                </span>

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

      {/* TOGGLE BUTTON */}
      <button
        className={`${styles.toggleButton} ${!isSidebarOpen ? styles.toggleButtonClosed : ""}`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? "Ocultar historial" : "Mostrar historial"}
      >
        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
      </button>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <div
          className={styles.messages}
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
        >
          {messages.length === 0 && !isStreaming ? (
            <div className={styles.welcome}>
              <div className={styles.welcomeIcon}>
                <Bot size={48} />
              </div>
              <h1>¡Hola! Soy Junior</h1>
              <p>¿Qué te gustaría preguntar hoy?</p>
              <div className={styles.suggestions}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className={styles.suggestionCard}
                    onClick={() => setInputValue(s.text)}
                  >
                    <span className={styles.suggestionIcon}>{s.icon}</span>
                    <div className={styles.suggestionContent}>
                      <span className={styles.suggestionTitle}>{s.title}</span>
                      <span className={styles.suggestionText}>{s.text}</span>
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
                  {msg.role === "user" ? (
                    <>
                      <div className={styles.messageContent}>
                        <div>{msg.content}</div>
                      </div>
                      <div className={styles.messageAvatar}>
                        <User size={18} />
                      </div>
                    </>
                  ) : (
                    <div className={styles.messageContentBot}>
                      <MarkdownRenderer content={msg.content} />
                      <button
                        className={styles.copyButton}
                        onClick={() => handleCopyMessage(msg.content, msg.id)}
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
              ))}

              {/* Streaming message - SEPARADO del array para evitar parpadeo */}
              {isLoading && isStreaming && streamingContent && (
                <div className={`${styles.message} ${styles.botMessage}`}>
                  <div className={styles.messageContentBot}>
                    <MarkdownRenderer content={streamingContent} />
                    <div className={styles.streamingIndicator}>
                      <Loader size={14} className={styles.spin} />
                    </div>
                  </div>
                </div>
              )}

              {/* Loading indicator - solo cuando espera primer chunk */}
              {isLoading && !isStreaming && !streamingContent && (
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
            <div className={styles.inputWrapper}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder={
                  isGuest
                    ? "Inicia sesión para enviar mensajes..."
                    : "Envía un mensaje..."
                }
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading || isGuest}
                style={isGuest ? { opacity: 0.7 } : undefined}
              />
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isGuest}
                style={
                  isGuest ? { opacity: 0.5, pointerEvents: "none" } : undefined
                }
              >
                {isLoading ? (
                  <Loader size={18} className={styles.spin} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* OVERLAY MOBILE */}
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
