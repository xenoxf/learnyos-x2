"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Zap, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeGeneratorCardProps {
  onGenerateCode: (prompt: string, language?: string) => void;
  isLoading: boolean;
}

const CodeGeneratorCard: React.FC<CodeGeneratorCardProps> = ({ onGenerateCode, isLoading }) => {
  const { toast } = useToast();

  const quickPrompts = [
    { label: 'React Component', prompt: 'Crea un componente React funcional con TypeScript', language: 'tsx' },
    { label: 'Python Function', prompt: 'Hazme una función en Python', language: 'python' },
    { label: 'Express API', prompt: 'Crea una API REST con Express.js', language: 'javascript' },
    { label: 'SQL Query', prompt: 'Escribe una consulta SQL', language: 'sql' },
    { label: 'CSS Animation', prompt: 'Crea una animación CSS moderna', language: 'css' },
    { label: 'JavaScript Utils', prompt: 'Función utilitaria en JavaScript', language: 'javascript' }
  ];

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copiado",
      description: "Puedes pegarlo en el chat para usarlo",
    });
  };

  return (
    <Card className="mb-4 border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Code className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">🚀 Generador de Código Rápido</h3>
            <p className="text-xs text-muted-foreground">Prompts optimizados para código limpio</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickPrompts.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto p-2 flex flex-col items-start gap-1 text-left"
              onClick={() => onGenerateCode(item.prompt, item.language)}
              disabled={isLoading}
            >
              <div className="flex items-center gap-1 w-full">
                <Zap className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="text-xs font-medium truncate">{item.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-auto opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyPrompt(item.prompt);
                  }}
                >
                  <Copy className="h-2.5 w-2.5" />
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs">
                {item.language}
              </Badge>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeGeneratorCard;
