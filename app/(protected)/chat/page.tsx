"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Loader2, Send, Plus, MessageSquare, Trash2, Sparkles, Menu, PanelLeftClose, PanelLeft, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, Chat } from '@/types';

const ChatPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadChats = async () => {
    setIsLoadingChats(true);
    try {
      const data = await apiService.getChats();
      setChats(data || []);
      if (data?.length > 0) {
        setCurrentChat(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await apiService.createChat({
        title: `Chat ${new Date().toLocaleDateString()}`
      });
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      setMobileSidebarOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear chat',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.deleteChat(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(chats.length > 1 ? chats.find(c => c.id !== chatId) || null : null);
      }
      toast({ title: 'Chat eliminado' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);
    try {
      let chatToUse = currentChat;
      if (!chatToUse) {
        chatToUse = await apiService.createChat({ title: `Chat ${new Date().toLocaleDateString()}` });
        setChats(prev => [chatToUse!, ...prev]);
        setCurrentChat(chatToUse);
      }
      const response = await apiService.sendMessage({ prompt: userMessage, chatId: chatToUse.id });
      const updatedChat = { ...chatToUse, messages: response.messages || chatToUse.messages || [] };
      setCurrentChat(updatedChat);
      setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error al enviar mensaje', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat);
    setMobileSidebarOpen(false);
  };

  useEffect(() => {
    loadChats();
  }, []);

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <Button onClick={handleNewChat} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700" size="sm">
          <Plus className="w-4 h-4" />
          Nueva conversación
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay conversaciones</p>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => selectChat(chat)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer group transition-all",
                  currentChat?.id === chat.id
                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                    : 'hover:bg-muted/60'
                )}
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate flex-1 text-sm text-foreground">{chat.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 flex-shrink-0"
                  onClick={e => handleDeleteChat(chat.id, e)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 md:hidden">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex h-full border-r border-border bg-muted/30 flex-col transition-all duration-300",
        desktopSidebarOpen ? "w-72 lg:w-80" : "w-0 overflow-hidden"
      )}>
        <SidebarContent />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          >
            {desktopSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="font-medium text-foreground truncate">
              {currentChat?.title || 'Junior IA'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="py-6">
            {currentChat?.messages && currentChat.messages.length > 0 ? (
              <div className="space-y-6 max-w-4xl mx-auto px-4">
                {currentChat.messages.map((msg: Message, idx: number) => (
                  <div key={idx} className="space-y-6">
                    {/* User Message */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground whitespace-pre-wrap">{msg.prompt}</p>
                      </div>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 pt-1 min-w-0">
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                          <MarkdownRenderer content={msg.response} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="h-full min-h-[50vh] flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">¿En qué puedo ayudarte?</h2>
                <p className="text-muted-foreground mb-8 text-center">Pregúntame sobre cualquier tema de estudio</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    { label: 'Explícame un concepto', prompt: 'Explícame el concepto de' },
                    { label: 'Ayúdame a estudiar', prompt: 'Ayúdame a estudiar para' },
                    { label: 'Resuelve un problema', prompt: 'Ayúdame a resolver:' },
                    { label: 'Resume un tema', prompt: 'Hazme un resumen sobre' }
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputValue(action.prompt + ' ')}
                      className="p-4 text-left rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-all text-sm text-foreground"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative flex items-center bg-muted/50 rounded-xl border border-border focus-within:border-cyan-500/50 transition-all">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1 h-12 border-0 bg-transparent focus-visible:ring-0 text-base px-4"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="h-9 w-9 mr-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;