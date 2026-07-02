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
  Image,
  X,
} from "lucide-react";
import styles from "@/styles/chat.module.css";
import type { ChatMessage, Chat } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { chatsService } from "@/services/chatsService";
import { authService } from "@/services/authService";
import { SlashCommandModal } from "@/components/chat/SlashCommandModal";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const TOOL_LABELS: Record<string, string> = {
  web_search: "🔍 Buscando en internet...",
  scrape_url: "🌐 Leyendo página web...",
  generate_exam: "📝 Generando examen...",
  generate_flashcards: "🃏 Creando flashcards...",
  generate_notes: "📄 Generando apuntes...",
  get_user_content: "📂 Consultando tu contenido...",
  create_exam_manual: "📝 Creando examen personalizado...",
  create_flashcard_manual: "🃏 Creando flashcards personalizadas...",
};

const TOOL_EMOJI: Record<string, string> = {
  web_search: "🔍",
  scrape_url: "🌐",
  generate_exam: "📝",
  generate_flashcards: "🃏",
  generate_notes: "📄",
  get_user_content: "📂",
  create_exam_manual: "📝",
  create_flashcard_manual: "🃏",
};

function ToolIndicator({ name }: { name: string | null }) {
  if (!name) return null;
  const label = TOOL_LABELS[name] || "🔧 Usando herramienta...";
  return (
    <div className={styles.toolIndicator}>
      <span className={styles.toolPulse}>{label}</span>
    </div>
  );
}

function extractToolName(raw: string | null): string | null {
  if (!raw) return null;
  const match = raw.match(/\[Usando herramienta:\s*(\w+)/);
  if (match) return match[1];
  return raw;
}

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
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [slashCommand, setSlashCommand] = useState<"exam" | "flashcards" | null>(null);
  const [slashPrompt, setSlashPrompt] = useState("");
  const [showSlashAutocomplete, setShowSlashAutocomplete] = useState(false);
  const [slashAutocompleteIdx, setSlashAutocompleteIdx] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ==================== DETECTAR GUEST ====================
  useEffect(() => {
    setIsGuest(authService.isGuest());
  }, []);

  // ==================== FILE ATTACHMENT ====================
  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error("Archivo muy grande", `${f.name} excede 10MB`);
        return false;
      }
      return true;
    });
    setAttachedFiles(prev => [...prev, ...validFiles].slice(0, 5));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ==================== SLASH COMMAND RESULT ====================
  const handleSlashResult = useCallback((result: { type: string; message: string }) => {
    const assistantMsg: ChatMessage = {
      id: Date.now() + 1,
      chatId: currentChat?.id,
      content: result.message,
      role: "assistant",
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, assistantMsg]);
  }, [currentChat?.id]);

  // ==================== SUGERENCIAS ====================
  const suggestions = [
    { icon: "🧠", title: "Ciencia", text: "Explica la teoría cuántica" },
    { icon: "🤖", title: "Tecnología", text: "¿Cómo funciona el machine learning?" },
    { icon: "📚", title: "Historia", text: "Resumen de la Segunda Guerra Mundial" },
  ];

  const slashSuggestions = [
    { icon: "📝", title: "/exam-g", text: "Generar examen con IA" },
    { icon: "🃏", title: "/flashcards-g", text: "Generar flashcards con IA" },
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
      const chatMessages: ChatMessage[] = messagesList.flatMap((m) => {
        const names = m.fileName?.split('||').filter(Boolean) || [];
        const types = m.fileType?.split('||').filter(Boolean) || [];
        const datas = m.fileData?.split('||').filter(Boolean) || [];
        const urls = m.fileUrl?.split('||').filter(Boolean) || [];

        const files = names.length > 0
          ? names.map((name, i) => {
            const type = types[i] || '';
            const fileUrl = urls[i]
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${urls[i]}`
              : type.startsWith("image/") && datas[i]
                ? `data:${type};base64,${datas[i]}`
                : undefined;
            return { name, type, url: fileUrl };
          })
          : undefined;

        return [
          {
            id: m.id * 2,
            chatId: response.chatId,
            content: m.prompt,
            role: "user" as const,
            createdAt: String(m.createdAt),
            files,
          },
          {
            id: m.id * 2 + 1,
            chatId: response.chatId,
            content: m.response,
            role: "assistant" as const,
            createdAt: String(m.createdAt),
            toolCalls: m.toolCalls || undefined,
          },
        ];
      });
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

    // Detectar slash commands
    if (messageContent.startsWith("/exam-g") || messageContent.startsWith("/flashcards-g")) {
      const afterCmd = messageContent.replace(/^\/(exam-g|flashcards-g)\s*/, "").trim();
      setSlashCommand(messageContent.startsWith("/exam-g") ? "exam" : "flashcards");
      setSlashPrompt(afterCmd);
      setInputValue("");
      resetTextareaHeight();
      return;
    }

    setInputValue("");
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent("");
    setCurrentTool(null);
    setCreditsRemaining(null);
    resetTextareaHeight();

    const sendingToExistingChat = !!currentChat;
    const currentFiles = [...attachedFiles];
    setAttachedFiles([]);

    const userMessage: ChatMessage = {
      id: Date.now(),
      chatId: currentChat?.id,
      content: messageContent,
      role: "user",
      createdAt: new Date().toISOString(),
      files: currentFiles.length > 0 ? currentFiles.map(f => ({
        name: f.name,
        type: f.type,
        url: URL.createObjectURL(f),
      })) : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);

    let fullContent = "";
    let newChatId: number | undefined;
    const stream = currentFiles.length > 0
      ? chatsService.sendMessageStreamWithFile({ prompt: messageContent, chatId: currentChat?.id, files: currentFiles })
      : chatsService.sendMessageStream({ prompt: messageContent, chatId: currentChat?.id });

    try {
      for await (const chunk of stream) {
        if (chunk.type === "credits") {
          setCreditsRemaining(chunk.remaining ?? null);
        } else if (chunk.type === "tool") {
          setCurrentTool(extractToolName(chunk.content || null));
        } else if (chunk.type === "chunk") {
          setCurrentTool(null);
          fullContent += chunk.content || "";
          setStreamingContent(fullContent);
        } else if (chunk.type === "done") {
          newChatId = (chunk as any).chatId;
        }
      }

      setStreamingContent("");
      setIsStreaming(false);

      if (!sendingToExistingChat && newChatId) {
        const newChat: Chat = {
          id: newChatId,
          title: messageContent.slice(0, 40) + (messageContent.length > 40 ? "..." : ""),
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
      setCurrentTool(null);
    }
  }, [
    isGuest,
    inputValue,
    isLoading,
    currentChat,
    attachedFiles,
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

  const checkIfNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const threshold = 150;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom <= threshold;
    setShouldAutoScroll(isNearBottomRef.current);
  }, []);

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

  const handleMessagesScroll = useCallback(() => {
    checkIfNearBottom();
  }, [checkIfNearBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashAutocomplete) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashAutocompleteIdx(prev => (prev + 1) % slashSuggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashAutocompleteIdx(prev => (prev - 1 + slashSuggestions.length) % slashSuggestions.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectSlashCommand(slashAutocompleteIdx);
      } else if (e.key === "Escape") {
        setShowSlashAutocomplete(false);
      }
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectSlashCommand = useCallback((idx: number) => {
    const cmd = slashSuggestions[idx];
    if (cmd) {
      setInputValue(cmd.title + " ");
      setShowSlashAutocomplete(false);
      adjustTextareaHeight();
      textareaRef.current?.focus();
    }
  }, [adjustTextareaHeight]);

  const detectSlashAutocomplete = useCallback((value: string) => {
    if (value === "/") {
      setShowSlashAutocomplete(true);
      setSlashAutocompleteIdx(0);
    } else if (!value.startsWith("/") || value.includes(" ")) {
      setShowSlashAutocomplete(false);
    }
  }, []);

  // ==================== RENDER ====================
  return (
    <>
      {slashCommand && (
        <SlashCommandModal
          command={slashCommand}
          initialPrompt={slashPrompt}
          onClose={() => setSlashCommand(null)}
          onResult={handleSlashResult}
        />
      )}
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
                {slashSuggestions.map((s, i) => (
                  <button
                    key={`slash-${i}`}
                    className={styles.suggestionCard}
                    onClick={() => setInputValue(s.title + " ")}
                  >
                    <span className={styles.suggestionIcon}>{s.icon}</span>
                    <div className={styles.suggestionContent}>
                      <span className={styles.suggestionTitle}>{s.title}</span>
                      <span className={styles.suggestionText}>{s.text}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className={styles.welcomeHint}>ó pregúntame algo:</div>
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
                        {msg.files && msg.files.length > 0 && (
                          <div className={styles.userFilesRow}>
                            {msg.files.map((f, i) => (
                              f.url ? (
                                f.type.startsWith("image/") ? (
                                  <img key={i} src={f.url} alt={f.name} className={styles.userFileImg} />
                                ) : (
                                  <span key={i} className={styles.userFileLabel}>{f.name}</span>
                                )
                              ) : (
                                <span key={i} className={styles.userFileLabel}>{f.name}</span>
                              )
                            ))}
                          </div>
                        )}
                        <div>{msg.content}</div>
                      </div>
                      <div className={styles.messageAvatar}>
                        <User size={18} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.messageContentBot}>
                        <MarkdownRenderer content={msg.content} />
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className={styles.toolCallsRow}>
                            {msg.toolCalls.map((tc, i) => (
                              <span
                                key={i}
                                className={styles.toolCallBadge}
                                title={tc.args ? JSON.stringify(tc.args).slice(0, 100) : ''}
                              >
                                <span>{TOOL_EMOJI[tc.name] || "🔧"}</span>
                                <span>{tc.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
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

              {/* Streaming message */}
              {isLoading && isStreaming && streamingContent && !currentTool && (
                <div className={`${styles.message} ${styles.botMessage}`}>
                  <div className={styles.messageContentBot}>
                    <MarkdownRenderer content={streamingContent} />
                    <div className={styles.streamingIndicator}>
                      <Loader size={14} className={styles.spin} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tool indicator */}
              {isLoading && isStreaming && !streamingContent && currentTool && (
                <div className={`${styles.message} ${styles.botMessage}`}>
                  <div className={styles.messageAvatar}>
                    <Bot size={18} />
                  </div>
                  <ToolIndicator name={currentTool} />
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && isStreaming && !streamingContent && !currentTool && (
                <div className={`${styles.message} ${styles.botMessage}`}>
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
            {attachedFiles.length > 0 && (
              <div className={styles.attachFilesRow}>
                {attachedFiles.map((f, i) => (
                  <div key={i} className={styles.attachFileChip}>
                    {f.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(f)} alt={f.name} className={styles.attachFileThumb} />
                    ) : (
                      <span className={styles.attachFileIcon}>📄</span>
                    )}
                    <span className={styles.attachFileName}>{f.name}</span>
                    <button onClick={() => removeAttachedFile(i)} className={styles.attachFileRemove} type="button">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.inputWrapper}>
              <div className={styles.inputBody}>
                {showSlashAutocomplete && (
                  <div className={styles.slashPopover} role="listbox" aria-label="Comandos disponibles">
                    <div className={styles.slashPopoverHeader}>Comandos</div>
                    {slashSuggestions.map((s, i) => (
                      <button
                        key={s.title}
                        role="option"
                        aria-selected={i === slashAutocompleteIdx}
                        className={`${styles.slashOption} ${i === slashAutocompleteIdx ? styles.slashOptionActive : ""}`}
                        onClick={() => selectSlashCommand(i)}
                        onMouseEnter={() => setSlashAutocompleteIdx(i)}
                        type="button"
                      >
                        <span className={styles.slashOptionIcon}>{s.icon}</span>
                        <span className={styles.slashOptionInfo}>
                          <span className={styles.slashOptionTitle}>{s.title}</span>
                          <span className={styles.slashOptionDesc}>{s.text}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  className={styles.textarea}
                  placeholder={
                    isGuest
                      ? "Inicia sesión para enviar mensajes..."
                      : "/flashcards-g o /exam-g para crear • Envía un mensaje..."
                  }
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    detectSlashAutocomplete(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isLoading || isGuest}
                  style={isGuest ? { opacity: 0.7 } : undefined}
                />
              </div>
              <button
                className={styles.uploadButton}
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading || isGuest || attachedFiles.length >= 5}
                title="Adjuntar archivos"
              >
                <Image size={16} />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
                onChange={handleAttachFiles}
                style={{ display: "none" }}
              />
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading || isGuest}
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
            {creditsRemaining != null && (
              <div className={styles.creditsBar}>
                💎 {creditsRemaining} créditos restantes
              </div>
            )}
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
    </>
  );
}
