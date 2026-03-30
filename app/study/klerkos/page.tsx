"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/klerkos.module.css";
import type { GlobalChatMessage } from "@/types/globalChat";

export default function KlerkOSPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getGlobalChatMessages(100);
      setMessages(data.reverse());
    } catch (error) {
      console.error("Error loading global chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los mensajes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteGlobalChatMessage(id);
      await loadMessages();
      toast({
        title: "Mensaje eliminado",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el mensaje",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatSmartDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const timeStr = date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (dateDay.getTime() === today.getTime()) {
      return `Hoy, ${timeStr}`;
    } else if (dateDay.getTime() === yesterday.getTime()) {
      return `Ayer, ${timeStr}`;
    } else {
      return (
        date.toLocaleDateString("es-CO", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        }) + `, ${timeStr}`
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const currentUser = apiService.getUser();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.messagesContainer}>
          {loading && messages.length === 0 ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <p>Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare size={64} />
              <h3>Sé el primero en saludar</h3>
              <p>Este es el inicio de la conversación global</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = currentUser?.id === msg.userId;

              return (
                <div
                  key={msg.id}
                  className={`${styles.message} ${isOwnMessage ? styles.ownMessage : ""}`}
                >
                  <div className={styles.messageAvatar}>
                    {msg.user.picture ? (
                      <img
                        src={msg.user.picture}
                        alt={msg.user.name}
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
                      <span className={styles.messageDate}>
                        {formatSmartDate(msg.createdAt)}
                      </span>
                      {isOwnMessage && (
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(msg.id)}
                          type="button"
                          aria-label="Eliminar mensaje"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
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
          <div className={styles.inputWrapper}>
            <textarea
              className={styles.input}
              placeholder="Escribe un mensaje para la comunidad..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              disabled={sending}
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              type="button"
              aria-label="Enviar mensaje"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
