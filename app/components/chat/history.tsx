/*

 

*/

// DATOS REUERIDOS PARA ESTE COMPONENTE

// CHATS
// handleNewChat
// handleSelectChat
// handleDeleteChat
// currentChatId
// chats
// loading
// error

import { Chat } from '@/types'
import React from 'react'
import styles from '@/styles/chat.module.css'
import { MessageCircle, Plus, Send, Trash2, Loader, Menu } from "lucide-react";

interface HistoryProps {
    chats: Chat[];
    handleNewChat: () => void;
    handleSelectChat: (chat: Chat) => void;
    handleDeleteChat: (chatId: number, e?: React.MouseEvent) => void;
    currentChatId: number | null;
    loading: boolean;
    error: string | null;
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function History({chats, handleNewChat, handleSelectChat, handleDeleteChat, currentChatId, loading, error, sidebarOpen, setSidebarOpen}: HistoryProps) {
  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`} aria-hidden={!sidebarOpen}>
        <div className={styles.sidebarHeader}>
          <button
            onClick={handleNewChat}
            className={styles.newChatButton}
            title="Nuevo chat"
            aria-label="Nuevo chat"
          >
            <Plus size={18} />
            <span className={styles.buttonText}>Nuevo chat</span>
          </button>

          <button
            className={styles.toggleSidebar}
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Cerrar menú"
            title="Cerrar menú"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className={styles.chatList} role="list">
          {loading ? (
            <div className={styles.loadingState}>
              <Loader className={styles.spin} size={20} />
              <span>Cargando chats...</span>
            </div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : chats.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageCircle size={36} />
              <span>No hay chats aún</span>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                role="listitem"
                className={`${styles.chatItem} ${currentChatId === chat.id ? styles.active : ""}`}
                onClick={() => handleSelectChat(chat)}
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") handleSelectChat(chat);
                }}
              >
                <span className={styles.chatTitle}>{chat.title}</span>
                <div className={styles.chatItemActions}>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    title="Eliminar chat"
                    aria-label={`Eliminar chat ${chat.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
  )
}

export default History