"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Bot, X } from 'lucide-react';
import { BotPersonalitySelector, BotPersonality } from './BotPersonalitySelector';

interface ChatSettingsProps {
  selectedPersonality: string;
  onPersonalityChange: (personality: BotPersonality) => void;
  onClearChat: () => void;
  onClose: () => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  selectedPersonality,
  onPersonalityChange,
  onClearChat,
  onClose
}) => {
  const handleClearChat = () => {
    onClearChat();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Configuración del Chat
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Personaliza tu experiencia de chat.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <BotPersonalitySelector 
            selectedPersonality={selectedPersonality}
            onPersonalityChange={onPersonalityChange}
          />
          
          <div className="border-t pt-4">
            <Button
              variant="destructive"
              onClick={handleClearChat}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Conversación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
