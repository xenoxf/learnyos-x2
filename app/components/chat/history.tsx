"use client";

import React from "react";
import type { Chat } from "@/types";
import styles from "@/styles/chatHistory.module.css";
import { MessageSquare, Plus, Trash2, PanelLeftClose, PanelLeft } from "lucide-react";

interface HistoryProps {
  chats: Chat[];
  handleNewChat: () => void;
  handleSelectChat: (chat: Chat) => void;
  handleDeleteChat: (chatId: number, e: React.MouseEvent) => void;
  currentChat: Chat | null;
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export default function History({
  chats,
  handleNewChat,
  handleSelectChat,
  handleDeleteChat,
  currentChat,
  isOpen,
  onToggle,
  isMobile = false,
}: HistoryProps) {
  return (
    <>
      <button
        className={styles.toggleButton}
        onClick={onToggle}
        aria-label={isOpen ? "Ocultar historial" : "Mostrar historial"}
        title={isOpen ? "Ocultar" : "Mostrar conversaciones"}
      >
        {isOpen ? (
          <PanelLeftClose size={22} className={styles.doorIcon} />
        ) : (
          <PanelLeft size={22} className={styles.doorIcon} />
        )}
      </button>

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      >
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Conversaciones</h2>
          <button
            className={styles.newChatButton}
            onClick={handleNewChat}
          >
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
                className={`${styles.chatItem} ${
                  currentChat?.id === chat.id ? styles.active : ""
                }`}
                onClick={() => handleSelectChat(chat)}
              >
                <MessageSquare size={18} />
                <div className={styles.chatInfo}>
                  <span className={styles.chatTitle}>
                    {chat.title || `Chat ${chat.id}`}
                  </span>
                  {chat.messageCount != null && (
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

      {isMobile && isOpen && (
        <div
          className={styles.overlay}
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
}
