"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Trash2, Copy, Check, Loader } from 'lucide-react';
import styles from '@/styles/chat.module.css';

interface Message {
  id: number | string;
  content: string;
  sender: 'user' | 'bot';
  timestamp?: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsFetching(true);
      const data = await apiService.getUserChats();
      const formattedMessages = Array.isArray(data)
        ? data.map((msg: any, idx: number) => ({
            id: msg.id || idx,
            content: msg.content || msg.message || '',
            sender: (msg.sender === 'user' ? 'user' : 'bot') as 'user' | 'bot',
            timestamp: msg.timestamp,
          }))
        : [];
      setMessages(formattedMessages);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'No pudimos cargar tus mensajes',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      setLoading(true);
      const response = await apiService.sendMessage(input);

      const botMessage: Message = {
        id: response?.id || Date.now() + 1,
        content: response?.content || response?.message || 'Respuesta vacía',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      toast({
        title: 'Éxito',
        description: 'Mensaje enviado y respondido',
      });
    } catch (error: any) {
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      toast({
        title: 'Error',
        description: error.message || 'Error al enviar el mensaje',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (content: string, id: string | number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: 'Chat borrado',
      description: 'Todos los mensajes han sido eliminados',
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>💬 Junior IA</h1>
            <p className="text-sm text-muted-foreground">Tu asistente de aprendizaje personal</p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      <div ref={messagesContainerRef} className={styles.messagesContainer}>
        {isFetching ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando conversación...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <div className="text-4xl mb-2">👋</div>
            <h3 className="font-semibold">Inicia una conversación</h3>
            <p className="text-sm text-muted-foreground">
              Hazme cualquier pregunta sobre tus estudios
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <Card
                className={`max-w-xs lg:max-w-md px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-none'
                    : 'bg-muted text-foreground rounded-2xl rounded-tl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                {message.sender === 'bot' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyMessage(message.content, message.id)}
                    className="mt-2 -mx-2 h-auto p-1 text-xs"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                )}
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            placeholder="Escribe tu pregunta..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            size="icon"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
