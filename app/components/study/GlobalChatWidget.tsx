/**
 * GlobalChatWidget - Widget flotante para el chat global
 * Muestra mensajes de todos los usuarios en tiempo real
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MessageSquare, X, Send, User } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/components/GlobalChatWidget.module.css";
import type { GlobalChatMessage } from "@/types/globalChat";

export function GlobalChatWidget() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getGlobalChatMessages(50);
      setMessages(data.reverse()); // Mostrar más recientes primero
    } catch (error) {
      console.error("Error loading global chat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      // Polling cada 5 segundos
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await apiService.sendGlobalChatMessage(newMessage.trim());
      setNewMessage("");
      await loadMessages();
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido publicado",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat global"
        type="button"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Widget */}
      {isOpen && (
        <div className={styles.widget}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <MessageSquare size={20} />
              <span>Chat Global</span>
            </div>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              type="button"
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {loading && messages.length === 0 ? (
              <div className={styles.loadingState}>
                <p>Cargando mensajes...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.emptyState}>
                <MessageSquare size={48} />
                <p>Sé el primero en saludar</p>
              </div>
            ) : (
              messages.map((msg) => {
                const currentUser = apiService.getUser();
                const isOwnMessage = currentUser?.id === msg.userId;

                return (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${isOwnMessage ? styles.ownMessage : ""}`}
                  >
                    <div className={styles.messageAvatar}>
                      {msg.user.picture ? (
                        <Image
                          src={msg.user.picture}
                          alt={msg.user.name || "Usuario"}
                          width={32}
                          height={32}
                          className={styles.avatarImage}
                        />
                      ) : (
                        <span className={styles.avatarInitials}>
                          {getInitials(msg.user.name || "U")}
                        </span>
                      )}
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>
                          {msg.user.name || "Usuario"}
                        </span>
                        <span className={styles.messageTime}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <p className={styles.messageText}>{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <textarea
              className={styles.input}
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              disabled={sending}
            />
            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              type="button"
              aria-label="Enviar mensaje"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
