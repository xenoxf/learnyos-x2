"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PremiumMarkdown } from "@/components/PremiumMarkdown";
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
  Search,
  Brain,
  Sparkles,
} from "lucide-react";
import styles from "@/styles/chat.module.css";
import DashboardLayout from "../layaut";
import type { Message, Chat } from "@/types";

export default function ChatPage() {
  // States
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingChats, setIsFetchingChats] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatSidebarRef = useRef<HTMLDivElement>(null);

  // Memoized values
  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId),
    [chats, activeChatId],
  );

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter(
      (chat) =>
        (chat.title || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [chats, searchQuery]);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showChatSidebar &&
        chatSidebarRef.current &&
        !chatSidebarRef.current.contains(event.target as Node) &&
        window.innerWidth < 1024
      ) {
        setShowChatSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showChatSidebar]);

  // Auto-create first chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsFetchingChats(true);
        const data = await apiService.getUserChats();
        const typedChats = Array.isArray(data) ? data : [];
        setChats(typedChats);

        if (typedChats.length === 0) {
          await createNewChat();
        } else {
          const sortedChats = [...typedChats].sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt).getTime() -
              new Date(a.updatedAt || a.createdAt).getTime(),
          );
          setActiveChatId(sortedChats[0].id);
        }
      } catch (err) {
        console.error("Error loading chats:", err);
        await createNewChat();
      } finally {
        setIsFetchingChats(false);
      }
    };

    initializeChat();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  // Focus input
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading, activeChatId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  // Functions
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const simulateStreaming = useCallback((text: string) => {
    setIsStreaming(true);
    setStreamingResponse("");

    let index = 0;
    const words = text.split(" ");

    streamIntervalRef.current = setInterval(() => {
      if (index < words.length) {
        setStreamingResponse(
          (prev) => prev + (index > 0 ? " " : "") + words[index],
        );
        index++;
      } else {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        setIsStreaming(false);
      }
    }, 50);
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      setIsLoading(true);
      const initialPrompt =
        "¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?";

      await apiService.sendMessage(initialPrompt);
      const updatedChats = await apiService.getUserChats();
      const typedChats = Array.isArray(updatedChats) ? updatedChats : [];
      setChats(typedChats);

      if (typedChats.length > 0) {
        const sortedChats = [...typedChats].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setActiveChatId(sortedChats[0].id);
      }

      // Cerrar sidebar en móvil después de crear chat
      if (window.innerWidth < 1024) {
        setShowChatSidebar(false);
      }

      toast({
        title: "Nuevo chat creado",
        description: "¡Comienza a conversar con tu asistente de IA!",
      });
    } catch (err) {
      console.error("Error creating chat:", err);
      toast({
        title: "Error",
        description: "No se pudo crear el chat. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadChats = useCallback(async () => {
    try {
      setIsFetchingChats(true);
      setError(null);
      const data = await apiService.getUserChats();
      const typedChats = Array.isArray(data) ? data : [];
      setChats(typedChats);
    } catch (err: any) {
      console.error("Error loading chats:", err);
      setError("No se pudieron cargar los chats");
    } finally {
      setIsFetchingChats(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getChatMessages(chatId);

      if (data?.messages) {
        const typedMessages = (
          Array.isArray(data.messages) ? data.messages : []
        )
          .map((msg: any) => ({
            id: msg.id || Date.now(),
            prompt: msg.prompt || "",
            response: msg.response || "",
            createdAt: typeof msg.createdAt === "string" 
              ? msg.createdAt 
              : new Date(msg.createdAt || Date.now()).toISOString(),
          }))
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

        setMessages(typedMessages);
      }
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError("No se pudieron cargar los mensajes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userPrompt = trimmedInput;
    setInput("");
    setError(null);

    try {
      setIsLoading(true);

      // Optimistic UI update for user message
      const tempUserMessage: Message = {
        id: Date.now(),
        prompt: userPrompt,
        response: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempUserMessage]);

      // Send message to API
      const response = await apiService.sendMessage(
        userPrompt,
        activeChatId ?? undefined,
      );

      // Simular streaming de respuesta
      if (response?.aiResponse) {
        simulateStreaming(response.aiResponse);
      }

      // Reload chats to update titles
      await loadChats();
    } catch (err: any) {
      console.error("Error sending message:", err);

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== Date.now()));

      setError("Error al enviar el mensaje");
      toast({
        title: "Error",
        description:
          err.message ||
          "Error al enviar el mensaje. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeChatId, loadChats, toast, simulateStreaming]);

  const handleCopyMessage = useCallback(
    (content: string, id: number) => {
      navigator.clipboard.writeText(content);
      setCopiedId(id);

      setTimeout(() => setCopiedId(null), 2000);

      toast({
        title: "Copiado",
        description: "Respuesta copiada al portapapeles",
      });
    },
    [toast],
  );

  const handleNewChat = useCallback(async () => {
    await createNewChat();
    setSearchQuery("");
    inputRef.current?.focus();
  }, [createNewChat]);

  const handleDeleteChat = useCallback(
    async (chatId: number, event?: React.MouseEvent) => {
      event?.stopPropagation();

      if (
        !confirm(
          "¿Estás seguro de que quieres eliminar este chat? Esta acción no se puede deshacer.",
        )
      ) {
        return;
      }

      try {
        await apiService.deleteChat(chatId);
        setChats((prev) => prev.filter((c) => c.id !== chatId));

        if (activeChatId === chatId) {
          // Seleccionar otro chat o crear uno nuevo
          const remainingChats = chats.filter((c) => c.id !== chatId);
          if (remainingChats.length > 0) {
            setActiveChatId(remainingChats[0].id);
          } else {
            await createNewChat();
          }
        }

        toast({
          title: "Chat eliminado",
          description: "El chat ha sido eliminado correctamente",
        });
      } catch (err) {
        toast({
          title: "Error",
          description:
            "No se pudo eliminar el chat. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
      }
    },
    [activeChatId, chats, toast, createNewChat],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isLoading) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage, isLoading],
  );

  const formatDate = useCallback((dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hoy";
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const handleChatSelect = (chatId: number) => {
    setActiveChatId(chatId);
    if (window.innerWidth < 1024) {
      setShowChatSidebar(false);
    }
  };

  // Render functions
  const renderChatsList = () => {
    if (isFetchingChats) {
      return (
        <div className={styles.loadingChats}>
          <Loader className={styles.loadingIcon} />
          <span>Cargando chats...</span>
        </div>
      );
    }

    if (filteredChats.length === 0) {
      return (
        <div className={styles.emptyChats}>
          <MessageSquare className={styles.emptyChatsIcon} />
          <p>No hay chats que coincidan</p>
        </div>
      );
    }

    return (
      <div className={styles.chatsListContent}>
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`${styles.chatItem} ${activeChatId === chat.id ? styles.chatItemActive : ""}`}
            onClick={() => handleChatSelect(chat.id)}
          >
            <div className={styles.chatItemIcon}>
              <MessageSquare size={16} />
            </div>
            <div className={styles.chatItemInfo}>
              <span className={styles.chatItemTitle} title={chat.title}>
                {chat.title}
              </span>
              <div className={styles.chatItemMeta}>
                <span className={styles.chatItemDate}>
                  <Clock size={12} />
                  {formatDate(new Date(chat.updatedAt || chat.createdAt))}
                </span>
                <span className={styles.chatItemCount}>
                  {chat.messageCount} mensajes
                </span>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => handleDeleteChat(chat.id, e)}
              className={styles.chatDeleteBtn}
              aria-label={`Eliminar chat ${chat.title}`}
            >
              <Trash2 className={styles.chatDeleteIcon} />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderMessages = () => {
    if (isLoading && messages.length === 0) {
      return (
        <div className={styles.loadingState}>
          <Loader className={styles.loader} />
          <p className={styles.loadingText}>Cargando conversación...</p>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>
            <Brain size={64} />
            <Sparkles className={styles.sparkle1} size={24} />
            <Sparkles className={styles.sparkle2} size={20} />
          </div>
          <h2 className={styles.emptyTitle}>¡Hola! Soy tu asistente de IA</h2>
          <p className={styles.emptyText}>
            Puedo ayudarte con explicaciones, ejercicios, resúmenes y mucho más.
            ¡Comienza a escribir!
          </p>
          <div className={styles.suggestions}>
            <h3 className={styles.suggestionsTitle}>Prueba preguntar:</h3>
            <div className={styles.suggestionsGrid}>
              <button
                className={styles.suggestionCard}
                onClick={() => setInput("Explícame el teorema de Pitágoras")}
              >
                <span role="img" aria-label="math">
                  📐
                </span>
                Explícame el teorema de Pitágoras
              </button>
              <button
                className={styles.suggestionCard}
                onClick={() => setInput("Resume la Revolución Francesa")}
              >
                <span role="img" aria-label="history">
                  📜
                </span>
                Resume la Revolución Francesa
              </button>
              <button
                className={styles.suggestionCard}
                onClick={() => setInput("Ayúdame con este ejercicio de física")}
              >
                <span role="img" aria-label="physics">
                  ⚛️
                </span>
                Ayúdame con un ejercicio
              </button>
              <button
                className={styles.suggestionCard}
                onClick={() => setInput("Corrige este texto en inglés")}
              >
                <span role="img" aria-label="language">
                  🌐
                </span>
                Corrige este texto
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.messagesList} ref={messagesContainerRef}>
        {messages.map((message) => (
          <div key={message.id} className={styles.messageGroup}>
            {/* User Message */}
            <div className={styles.userMessageWrapper}>
              <div className={styles.messageAvatar}>
                <User size={20} />
              </div>
              <div className={styles.messageContent}>
                <Card className={styles.userMessage}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageAuthor}>Tú</span>
                    <span className={styles.messageTime}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className={styles.userMessageText}>{message.prompt}</p>
                </Card>
              </div>
            </div>

            {/* AI Response */}
            <div className={styles.aiMessageWrapper}>
              <div className={styles.messageAvatar}>
                <Bot size={20} />
              </div>
              <div className={styles.messageContent}>
                <Card className={styles.aiMessage}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageAuthor}>
                      <Sparkles size={14} />
                      Asistente IA
                    </span>
                    <span className={styles.messageTime}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <PremiumMarkdown content={message.response} />
                  <div className={styles.messageActions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyMessage(message.response, message.id)
                      }
                      className={styles.copyButton}
                      aria-label="Copiar respuesta"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className={styles.copyIcon} />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className={styles.copyIcon} />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {isStreaming && streamingResponse && (
          <div className={styles.aiMessageWrapper}>
            <div className={styles.messageAvatar}>
              <Bot size={20} />
            </div>
            <div className={styles.messageContent}>
              <Card className={styles.aiMessage}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageAuthor}>
                    <Sparkles size={14} />
                    Asistente IA
                  </span>
                  <div className={styles.typingIndicator}>
                    <span className={styles.typingDot}></span>
                    <span className={styles.typingDot}></span>
                    <span className={styles.typingDot}></span>
                  </div>
                </div>
                <PremiumMarkdown content={streamingResponse} />
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className={styles.chatLayout}>
        {/* Chat Sidebar - Ahora es un overlay en móvil */}
        {showChatSidebar && (
          <div className={styles.sidebarOverlay}>
            <aside
              ref={chatSidebarRef}
              className={`${styles.sidebar} ${styles.sidebarOpen}`}
              aria-label="Lista de chats"
            >
              <div className={styles.sidebarHeader}>
                <div className={styles.sidebarTitleContainer}>
                  <h2 className={styles.sidebarTitle}>
                    <MessageSquare className={styles.sidebarTitleIcon} />
                    Chats
                  </h2>
                  <span className={styles.chatsCount}>{chats.length}</span>
                </div>
                <div className={styles.sidebarActions}>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowChatSidebar(false)}
                    className={styles.closeSidebarBtn}
                    aria-label="Cerrar lista de chats"
                  >
                    <X className={styles.closeSidebarIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.sidebarSearch}>
                <div className={styles.searchContainer}>
                  <Search className={styles.searchIcon} />
                  <Input
                    type="text"
                    placeholder="Buscar chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSearchQuery("")}
                      className={styles.clearSearchBtn}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </div>

              <Button
                onClick={handleNewChat}
                className={styles.newChatBtn}
                disabled={isLoading}
              >
                <Plus className={styles.newChatIcon} />
                Nuevo Chat
              </Button>

              <div className={styles.chatsList}>{renderChatsList()}</div>
            </aside>
          </div>
        )}

        {/* Main Chat Area */}
        <div className={styles.chatContainer}>
          {/* Header */}
          <header className={styles.chatHeader}>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowChatSidebar(!showChatSidebar)}
              className={styles.toggleSidebarBtn}
              aria-label={
                showChatSidebar
                  ? "Ocultar lista de chats"
                  : "Mostrar lista de chats"
              }
            >
              {showChatSidebar ? (
                <X className={styles.toggleSidebarIcon} />
              ) : (
                <MessageSquare className={styles.toggleSidebarIcon} />
              )}
            </Button>

            <div className={styles.chatHeaderContent}>
              <div className={styles.chatTitleSection}>
                <h1 className={styles.chatTitle}>
                  {activeChat?.title || "Nuevo Chat"}
                </h1>
                {activeChat && (
                  <div className={styles.chatInfo}>
                    <span className={styles.chatMessageCount}>
                      <MessageSquare size={12} />
                      {activeChat.messageCount} mensajes
                    </span>
                    <span className={styles.chatDate}>
                      <Clock size={12} />
                      {formatDate(activeChat.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {activeChatId && (
              <div className={styles.chatActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewChat}
                  className={styles.newChatHeaderBtn}
                >
                  <Plus size={16} />
                  <span className={styles.newChatText}>Nuevo</span>
                </Button>
                {hasMessages && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteChat(activeChatId)}
                    className={styles.deleteChatBtn}
                    aria-label="Eliminar chat actual"
                  >
                    <Trash2 className={styles.deleteIcon} size={16} />
                  </Button>
                )}
              </div>
            )}
          </header>

          {/* Messages Area */}
          <div className={styles.messagesArea}>{renderMessages()}</div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu mensaje aquí... (Shift + Enter para nueva línea)"
                disabled={isLoading}
                className={styles.inputField}
                aria-label="Mensaje de chat"
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className={styles.sendButton}
                aria-label="Enviar mensaje"
              >
                {isLoading ? (
                  <Loader className={styles.sendLoader} />
                ) : (
                  <Send className={styles.sendIcon} />
                )}
              </Button>
            </div>
            <div className={styles.inputFooter}>
              <p className={styles.inputHint}>
                Asistente IA • Presiona Enter para enviar
              </p>
              <div className={styles.inputStats}>
                <span className={styles.charCount}>
                  {input.length} caracteres
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
