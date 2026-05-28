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
  PanelLeftClose,
  PanelLeft,
  X,
  Image,
  FileText,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach(URL.revokeObjectURL);
    };
  }, []);

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
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;

    const messageContent = inputValue.trim();
    const fileToSend = selectedFile;
    setInputValue("");
    setSelectedFile(null);
    setFilePreview(null);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent("");
    resetTextareaHeight();

    const sendingToExistingChat = !!currentChat;

    let fileUrl: string | undefined;
    if (fileToSend?.type.startsWith("image/")) {
      fileUrl = URL.createObjectURL(fileToSend);
      objectUrlsRef.current.push(fileUrl);
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      chatId: currentChat?.id,
      content: messageContent || "",
      role: "user",
      createdAt: new Date().toISOString(),
      file: fileToSend
        ? {
            name: fileToSend.name,
            type: fileToSend.type,
            url: fileUrl,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);

    let fullContent = "";
    let newChatId: number | undefined;

    try {
      if (fileToSend) {
        // Send with file via FormData stream
        for await (const chunk of chatsService.sendMessageStreamWithFile({
          prompt: messageContent,
          chatId: currentChat?.id,
          file: fileToSend,
        })) {
          if (chunk.type === "chunk") {
            fullContent += chunk.content || "";
            setStreamingContent(fullContent);
          } else if (chunk.type === "done") {
            newChatId = (chunk as any).chatId;
          }
        }
      } else {
        // Normal text-only stream
        for await (const chunk of chatsService.sendMessageStream({
          prompt: messageContent,
          chatId: currentChat?.id,
        })) {
          if (chunk.type === "chunk") {
            fullContent += chunk.content || "";
            setStreamingContent(fullContent);
          } else if (chunk.type === "done") {
            newChatId = (chunk as any).chatId;
          }
        }
      }

      setStreamingContent("");
      setIsStreaming(false);

      if (!sendingToExistingChat && newChatId) {
        const newChat: Chat = {
          id: newChatId,
          title:
            (messageContent || fileToSend?.name || "Archivo").slice(0, 40) +
            ((messageContent || fileToSend?.name || "").length > 40 ? "..." : ""),
          createdAt: new Date().toISOString(),
          messageCount: 1,
        };
        setCurrentChat(newChat);
        setChats((prev) => [newChat, ...prev]);
      }

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        chatId: newChatId ?? currentChat?.id,
        content: fullContent,
        role: "assistant",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!sendingToExistingChat) {
        await loadChats();
      }
    } catch {
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
    selectedFile,
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

  // ==================== FILE HANDLING ====================
  const ACCEPTED_FILE_TYPES = [
    "image/png", "image/jpeg", "image/webp", "image/gif",
    "application/pdf",
  ];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error("Formato no soportado", "Solo imágenes (PNG, JPG, WEBP, GIF) y PDF");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Archivo muy grande", "El tamaño máximo es 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      if ((inputValue.trim() || selectedFile) && !isLoading) {
        handleSendMessage();
      }
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
                      {msg.file && (
                        <div className={styles.userMessageFile}>
                          {msg.file.type.startsWith("image/") && msg.file.url ? (
                            <img
                              src={msg.file.url}
                              alt={msg.file.name}
                              className={styles.userMessageImage}
                            />
                          ) : (
                            <div className={styles.userMessageFileInfo}>
                              <FileText size={18} />
                              <span className={styles.userMessageFileName}>
                                {msg.file.name}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className={styles.messageContent}>
                        {msg.content}
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              ))}

              {/* Streaming message - SEPARADO del array para evitar parpadeo */}
              {isLoading && isStreaming && streamingContent && (
                <div className={`${styles.message} ${styles.botMessage}`}>
                  <div className={styles.messageContentBot}>
                    <MarkdownRenderer content={streamingContent} />
                  </div>
                </div>
              )}

              {/* Loading indicator - solo cuando espera primer chunk */}
              {isLoading && isStreaming && !streamingContent && (
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
            {/* File preview */}
            {selectedFile && (
              <div className={styles.filePreview}>
                {filePreview ? (
                  <img src={filePreview} alt="" className={styles.filePreviewIcon} />
                ) : (
                  <FileText size={18} className={styles.filePreviewIcon} style={{ padding: 4 }} />
                )}
                <div className={styles.filePreviewInfo}>
                  <div className={styles.filePreviewName}>{selectedFile.name}</div>
                  <div className={styles.filePreviewSize}>{formatFileSize(selectedFile.size)}</div>
                </div>
                <button
                  className={styles.filePreviewRemove}
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                >
                  <XCircle size={14} />
                </button>
              </div>
            )}

            <div className={styles.inputWrapper}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={styles.uploadButton}
                    disabled={isLoading || isGuest}
                    title="Añadir"
                  >
                    <Plus size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={8}>
                  <DropdownMenuItem
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = ".png,.jpg,.jpeg,.webp,.gif";
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <Image size={16} />
                    <span>Imagen</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = ".pdf";
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <FileText size={16} />
                    <span>Documento PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder={
                  isGuest
                    ? "Inicia sesión para enviar mensajes..."
                    : selectedFile
                      ? "Describe el archivo o haz una pregunta..."
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
                disabled={(!inputValue.trim() && !selectedFile) || isLoading || isGuest}
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
