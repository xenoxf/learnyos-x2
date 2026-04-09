"use client";

import React from "react";
import type { Chat } from "@/types";
import styles from "@/styles/chatHistory.module.css";
import { MessageSquare, Plus, Trash2, Sparkles } from "lucide-react";

interface HistoryProps {
  chats: Chat[];
  handleNewChat: () => void;
  handleSelectChat: (chat: Chat) => void;
  handleDeleteChat: (chatId: number, e: React.MouseEvent) => void;
  currentChat: Chat | null;
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  isCollapse: boolean;
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
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.headerTop}>
            <div className={styles.headerIcon}>
              <Sparkles size={18} />
            </div>
            <h2 className={styles.sidebarTitle}>Historial</h2>
          </div>
          <button className={styles.newChatButton} onClick={handleNewChat}>
            <Plus size={16} />
            <span>Nuevo chat</span>
          </button>
        </div>

        <div className={styles.chatList}>
          {chats.length === 0 ? (
            <div className={styles.emptyChats}>
              <div className={styles.emptyIcon}>
                <MessageSquare size={32} />
              </div>
              <p>Sin conversaciones</p>
              <span>Inicia un chat para empezar</span>
            </div>
          ) : (
            <div className={styles.chatItems}>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`${styles.chatItem} ${currentChat?.id === chat.id ? styles.active : ""}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className={styles.chatItemIcon}>
                    <MessageSquare size={16} />
                  </div>
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
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {isMobile && isOpen && (
        <div className={styles.overlay} onClick={onToggle} aria-hidden="true" />
      )}
    </>
  );
}
