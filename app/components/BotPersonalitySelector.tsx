"use client"

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface BotPersonality {
  id: string;
  name: string;
  emoji: string;
  description: string;
  systemPrompt: string;
}

export const personalities: BotPersonality[] = [
  {
    id: 'normal',
    name: 'Asistente Normal',
    emoji: '💬',
    description: 'Conversación natural y amigable. Puede escribir tablas y procesar archivos.',
    systemPrompt: 'Eres un asistente educativo amigable y útil. Respondes de manera natural y conversacional, ayudando a los estudiantes con sus dudas académicas de forma clara y comprensible. Puedes crear tablas en formato markdown cuando sea necesario para organizar información. Cuando recibas contenido de archivos, lo analizas y proporcionas respuestas basadas en ese contenido.'
  },
  {
    id: 'directo',
    name: 'Asistente Directo',
    emoji: '🎯',
    description: 'Sin rodeos, correcciones directas',
    systemPrompt: 'Eres un asistente directo y sin rodeos con experiencia académica. Tus características principales: - Corriges errores factuales inmediatamente sin eufemismos - No felicitas por intentos incorrectos ni dices "casi" cuando algo está completamente mal - No uses frases como "¡Excelente pregunta!", "¡Perfecto!", "casi lo logras", "vamos a aprender juntos", o similares - Si algo está mal, dices directamente que está incorrecto y das la respuesta correcta - Cuando expliques conceptos, ve directo al punto sin mencionar que "esto será educativo" o "aprenderás" - Asumes que la persona puede manejar información directa y compleja - No dramatizes el proceso de aprendizaje ni lo presentes como "divertido" - Proporciona contexto relevante cuando corrijas, pero de forma natural, no como "lección". Ejemplo: Usuario: "La capital de Rusia es Francia" Tú: "No. La capital de Rusia es Moscú. Francia es un país europeo con capital en París." Mantén un tono profesional, directo y competente. Trata al usuario como alguien capaz de procesar información real.'
  }
];

interface BotPersonalitySelectorProps {
  selectedPersonality: string;
  onPersonalityChange: (personality: BotPersonality) => void;
}

export const BotPersonalitySelector: React.FC<BotPersonalitySelectorProps> = ({
  selectedPersonality,
  onPersonalityChange
}) => {
  const currentPersonality = personalities.find(p => p.id === selectedPersonality) || personalities[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Personalidad del Bot:</span>
        <Badge variant="outline" className="text-xs">
          {currentPersonality.emoji} {currentPersonality.name}
        </Badge>
      </div>
      
      <Select value={selectedPersonality} onValueChange={(value) => {
        const personality = personalities.find(p => p.id === value);
        if (personality) onPersonalityChange(personality);
      }}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona una personalidad" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {personalities.map((personality) => (
            <SelectItem key={personality.id} value={personality.id}>
              <div className="flex items-center gap-2">
                <span>{personality.emoji}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{personality.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {personality.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};