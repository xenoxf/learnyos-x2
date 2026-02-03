'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PremiumMarkdown } from '@/components/PremiumMarkdown';
import {
  Send,
  Trash2,
  Copy,
  Check,
  Loader,
  Plus,
  MessageSquare,
  ChevronLeft,
  X,
} from 'lucide-react';
import styles from '@/styles/chat.module.css';

interface Message {
  id: number;
  prompt: string;
  response: string;
  createdAt: Date;
}

interface Chat {
  id: number;
  title: string;
  messageCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export default function ChatPage() {
  // Chats state
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // UI state
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadChats = async () => {
    try {
      setIsFetching(true);
      const data = await apiService.getUserChats();
      const typedChats = Array.isArray(data) ? data : [];
      setChats(typedChats);

      // Auto-select first chat if available
      if (typedChats.length > 0 && !activeChatId) {
        setActiveChatId(typedChats[0].id);
      }
    } catch (error: any) {
      console.error('Error loading chats:', error);
      toast({
        title: 'Error',
        description: 'No pudimos cargar tus chats',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      setLoading(true);
      const data = await apiService.getChatMessages(chatId);

      if (data && data.messages) {
        const typedMessages = (Array.isArray(data.messages) ? data.messages : []).map(
          (msg: any) => ({
            id: msg.id || Math.random(),
            prompt: msg.prompt || '',
            response: msg.response || '',
            createdAt: new Date(msg.createdAt || Date.now()),
          })
        );
        setMessages(typedMessages);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'No pudimos cargar los mensajes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userPrompt = input;
    setInput('');

    try {
      setLoading(true);

      // Send message to API
      await apiService.sendMessage(userPrompt, activeChatId ?? undefined);

      // Reload messages to get the new ones
      if (activeChatId) {
        await loadMessages(activeChatId);
        // Reload chats to update titles
        await loadChats();
      }

      toast({
        title: 'Mensaje enviado',
        description: 'Respuesta recibida de la IA',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al enviar el mensaje',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copiado',
      description: 'Respuesta copiada al portapapeles',
    });
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInput('');
  };

  const handleDeleteChat = async (chatId: number) => {
    try {
      await apiService.deleteChat(chatId);
      setChats(chats.filter((c) => c.id !== chatId));

      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }

      toast({
        title: 'Chat eliminado',
        description: 'El chat ha sido removido correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al eliminar el chat',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={styles.chatLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>💬 Chats</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowSidebar(false)}
            className={styles.closeSidebarBtn}
          >
            <X className={styles.closeSidebarIcon} />
          </Button>
        </div>

        <Button
          onClick={handleNewChat}
          className={styles.newChatBtn}
        >
          <Plus className={styles.newChatIcon} />
          Nuevo Chat
        </Button>

        <div className={styles.chatsList}>
          {isFetching ? (
            <div className={styles.loadingChats}>
              <Loader className={styles.loadingIcon} />
            </div>
          ) : chats.length === 0 ? (
            <p className={styles.emptyChats}>Sin chats aún</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`${styles.chatItem} ${activeChatId === chat.id ? styles.chatItemActive : ''}`}
              >
                <button
                  onClick={() => setActiveChatId(chat.id)}
                  className={styles.chatItemButton}
                >
                  <MessageSquare className={styles.chatItemIcon} />
                  <span className={styles.chatItemTitle}>{chat.title}</span>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteChat(chat.id)}
                  className={styles.chatDeleteBtn}
                >
                  <Trash2 className={styles.chatDeleteIcon} />
                </Button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className={styles.chatContainer}>
        {/* Header */}
        <header className={styles.chatHeader}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowSidebar(!showSidebar)}
            className={styles.toggleSidebarBtn}
          >
            <ChevronLeft className={styles.toggleSidebarIcon} />
          </Button>

          <div className={styles.chatHeaderContent}>
            <h1 className={styles.chatTitle}>
              {activeChatId && chats.find((c) => c.id === activeChatId)?.title || 'Junior IA'}
            </h1>
            <p className={styles.chatSubtitle}>Tu asistente de aprendizaje con IA</p>
          </div>

          {activeChatId && messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteChat(activeChatId)}
              className={styles.deleteAllBtn}
            >
              <Trash2 className={styles.deleteAllIcon} />
            </Button>
          )}
        </header>

        {/* Messages Area */}
        <div className={styles.messagesArea}>
          {!activeChatId ? (
            <div className={styles.welcomeState}>
              <div className={styles.welcomeEmoji}>💬</div>
              <h2 className={styles.welcomeTitle}>Inicia una nueva conversación</h2>
              <p className={styles.welcomeText}>
                Hazme preguntas sobre tus estudios y recibirás respuestas detalladas con apoyo de IA
              </p>
            </div>
          ) : loading && messages.length === 0 ? (
            <div className={styles.loadingState}>
              <Loader className={styles.loader} />
              <p className={styles.loadingText}>Cargando conversación...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyEmoji}>👋</div>
              <h3 className={styles.emptyTitle}>Sin mensajes aún</h3>
              <p className={styles.emptyText}>Escribe tu primer mensaje para comenzar</p>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((message) => (
                <div key={message.id} className={styles.messageGroup}>
                  {/* User Message */}
                  <div className={styles.userMessageWrapper}>
                    <Card className={styles.userMessage}>
                      <p className={styles.userMessageText}>{message.prompt}</p>
                    </Card>
                  </div>

                  {/* AI Response */}
                  <div className={styles.aiMessageWrapper}>
                    <Card className={styles.aiMessage}>
                      <PremiumMarkdown content={message.response} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(message.response, message.id)}
                        className={styles.copyButton}
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
                    </Card>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {activeChatId && (
          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                className={styles.inputField}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                size="icon"
                className={styles.sendButton}
              >
                {loading ? (
                  <Loader className={styles.sendLoader} />
                ) : (
                  <Send className={styles.sendIcon} />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
