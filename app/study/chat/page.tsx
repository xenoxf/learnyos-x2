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
  FileText,
  RefreshCw,
  AlertTriangle,
  Paperclip,
  Image,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FilePreviewModal from "@/components/common/FilePreviewModal";
import FileChip from "@/components/common/FileChip";
import styles from "@/styles/chat.module.css";
import type { ChatMessage, Chat } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { chatsService } from "@/services/chatsService";
import { authService } from "@/services/authService";
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_FILE_EXTENSIONS,
  ACCEPTED_IMAGE_EXTENSIONS,
  MAX_FILE_SIZE,
} from "@/lib/file-constants";

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
  const [isGuest, setIsGuest] = useState(() =>
    typeof window !== "undefined" ? authService.isGuest() : false
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const failedInputsRef = useRef<
    Map<number, { prompt: string; file?: { name: string; type: string; url?: string }; fileBlob?: Blob }>
  >(new Map());

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
      if (!authService.isGuest()) {
        toast.error("Error", "No se pudieron cargar las conversaciones");
      }
    } finally {
      setIsChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) loadChats();
  }, [loadChats, isGuest]);

  // ==================== CARGAR MENSAJES ====================
  const loadChatMessages = useCallback(async (chatId: number) => {
    if (authService.isGuest()) return;
    try {
      const response = await chatsService.getChatMessages(chatId);
      const messagesList = response.messages ?? [];
      const chatMessages: ChatMessage[] = messagesList.flatMap((m) => {
        // Parse multi-file data (stored as || separated)
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
          },
        ];
      });
      setMessages(chatMessages);
    } catch {
      toast.error("Error", "No se pudieron cargar los mensajes");
    }
  }, []);

  // ==================== ENVIAR MENSAJE ====================
  const handleSendMessage = useCallback(async () => {
    if (isGuest) {
      toast.error("Acceso restringido", "Inicia sesión para usar el chat");
      return;
    }
    if ((!inputValue.trim() && selectedFiles.length === 0) || isLoading) return;

    const messageContent = inputValue.trim();
    const filesToSend = [...selectedFiles];
    setInputValue("");
    setSelectedFiles([]);
    setFilePreviews([]);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent("");
    setUploadProgress(null);

    const sendingToExistingChat = !!currentChat;

    const fileUrls: string[] = [];
    for (const f of filesToSend) {
      if (f.type.startsWith("image/")) {
        const url = URL.createObjectURL(f);
        fileUrls.push(url);
        objectUrlsRef.current.push(url);
      } else {
        fileUrls.push("");
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      chatId: currentChat?.id,
      content: messageContent || "",
      role: "user",
      createdAt: new Date().toISOString(),
      status: 'sending',
      files: filesToSend.map((f, i) => ({
        name: f.name,
        type: f.type,
        url: fileUrls[i] || undefined,
      })),
    };

    setMessages((prev) => [...prev, userMessage]);

    let fullContent = "";
    let newChatId: number | undefined;

    try {
      if (filesToSend.length > 0) {
        setUploadProgress(0);
        let hasStreamed = false;
        for await (const chunk of chatsService.sendMessageStreamWithFile({
          prompt: messageContent,
          chatId: currentChat?.id,
          files: filesToSend,
        }, (pct) => {
          setUploadProgress(pct);
          if (pct === 100) hasStreamed = true;
        })) {
          if (!hasStreamed) {
            hasStreamed = true;
            setUploadProgress(100);
          }
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

      // Mark user message as sent
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'sent' as const } : m)),
      );

      setStreamingContent("");
      setIsStreaming(false);

      if (!sendingToExistingChat && newChatId) {
        const chatTitle = messageContent ||
          (filesToSend.length === 1 ? filesToSend[0].name : `${filesToSend.length} archivos`) ||
          "Archivo";
        const newChat: Chat = {
          id: newChatId,
          title: chatTitle.slice(0, 40) + (chatTitle.length > 40 ? "..." : ""),
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
      // Mark user message as failed instead of removing it
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'failed' as const } : m)),
      );
      toast.error("Error", "No se pudo obtener la respuesta. Haz clic en el mensaje para reintentar.");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent("");
      setUploadProgress(null);
    }
  }, [
    isGuest,
    inputValue,
    isLoading,
    currentChat,
    loadChats,
    selectedFiles,
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
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const added: File[] = [];
    const newPreviews: string[] = [];

    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_FILE_TYPES.includes(file.type as any)) {
        toast.error("Formato no soportado", `"${file.name}": Solo imágenes (PNG, JPG, WEBP, GIF) y PDF`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error("Archivo muy grande", `"${file.name}": El tamaño máximo es 10MB`);
        continue;
      }

      if (selectedFiles.length + added.length >= 5) {
        toast.error("Límite", "Máximo 5 archivos por mensaje");
        break;
      }

      added.push(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        const previewPromise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve(ev.target?.result as string || "");
        });
        reader.readAsDataURL(file);
        newPreviews.push(""); // placeholder
        previewPromise.then((dataUrl) => {
          setFilePreviews((prev) => {
            const next = [...prev];
            const idx = selectedFiles.length + added.indexOf(file);
            if (idx < next.length) next[idx] = dataUrl;
            return next;
          });
        });
      } else {
        newPreviews.push("");
      }
    }

    setSelectedFiles((prev) => [...prev, ...added]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
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

  const handleRetryMessage = (msg: ChatMessage) => {
    if (isLoading || isGuest) return;
    setInputValue(msg.content);
    if (textareaRef.current) textareaRef.current.focus();
    const hasFiles = !!(msg.files && msg.files.length > 0) || !!msg.file;
    if (!hasFiles) {
      toast.success("Reintentar", "Mensaje restaurado. Haz clic en enviar para reintentar.");
    } else {
      toast.info("Reintentar", "Texto restaurado. Vuelve a seleccionar los archivos y envía.");
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
      if ((inputValue.trim() || selectedFiles.length > 0) && !isLoading) {
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
                      {(msg.files || (msg.file ? [msg.file] : [])).length > 0 && (
                        <div className={styles.msgFileCarousel}>
                          {(msg.files || (msg.file ? [msg.file] : [])).map((file, fi) => {
                            const isImage = file.type.startsWith("image/") && file.url;
                            return (
                              <div
                                key={fi}
                                className={`${styles.msgCarouselCard} ${isImage ? styles.msgCarouselCardImage : styles.msgCarouselCardFile}`}
                                title={file.name}
                                onClick={() => isImage && setPreviewFile({ url: file.url!, name: file.name, type: file.type })}
                              >
                                {isImage ? (
                                  <>
                                    <img
                                      src={file.url!}
                                      alt={file.name}
                                      className={styles.msgCarouselImg}
                                      loading="lazy"
                                    />
                                    <div className={styles.msgCarouselOverlay}>
                                      <span className={styles.msgCarouselName}>{file.name}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className={styles.msgCarouselFileBody}>
                                    <div className={styles.msgCarouselFileIcon}>
                                      <FileText size={18} />
                                    </div>
                                    <span className={styles.msgCarouselFileName}>{file.name}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className={`${styles.messageContent} ${msg.status === 'failed' ? styles.messageFailed : ''}`}>
                        {msg.content}
                        {msg.status === 'failed' && (
                          <button
                            className={styles.retryButton}
                            onClick={() => handleRetryMessage(msg)}
                            title="Reintentar"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        {msg.status === 'sending' && (
                          <span className={styles.sendingIndicator}>
                            <Loader size={12} className={styles.spin} />
                          </span>
                        )}
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
            <div className={styles.inputWrapper}>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_EXTENSIONS}
                multiple
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <div className={styles.inputBody}>
                {selectedFiles.length > 0 && (
                  <div className={styles.inlineFileRow}>
                    {selectedFiles.map((f, i) => (
                      <FileChip
                        key={i}
                        file={f}
                        index={i}
                        onRemove={handleRemoveFile}
                        disabled={isLoading}
                        variant="input"
                        previewUrl={filePreviews[i]}
                      />
                    ))}
                  </div>
                )}
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
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || isGuest}
                  style={isGuest ? { opacity: 0.7 } : undefined}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`${styles.uploadButton} ${selectedFiles.length > 0 ? styles.uploadButtonHasFiles : ''}`}
                      disabled={isLoading || isGuest}
                      title={selectedFiles.length > 0 ? `${selectedFiles.length} archivo(s) adjunto(s)` : "Adjuntar archivo"}
                    >
                      <Paperclip size={18} />
                      {selectedFiles.length > 0 && (
                        <span className={styles.uploadBadge}>{selectedFiles.length}</span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" sideOffset={8} className={styles.dropdownContent}>
                    <DropdownMenuItem
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = ACCEPTED_FILE_EXTENSIONS;
                          fileInputRef.current.multiple = true;
                          fileInputRef.current.click();
                        }
                      }}
                      className={styles.dropdownItem}
                    >
                      <Paperclip size={16} />
                      <span>Subir archivos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = ACCEPTED_IMAGE_EXTENSIONS;
                          fileInputRef.current.multiple = true;
                          fileInputRef.current.click();
                        }
                      }}
                      className={styles.dropdownItem}
                    >
                      <Image size={16} />
                      <span>Subir imágenes</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && selectedFiles.length === 0) || isLoading || isGuest}
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

      {/* FILE PREVIEW MODAL */}
      {previewFile && (
        <FilePreviewModal
          isOpen={true}
          onClose={() => setPreviewFile(null)}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          fileType={previewFile.type}
        />
      )}
    </div>
  );
}
