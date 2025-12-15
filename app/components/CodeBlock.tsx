"use client";
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, atomDark, tomorrow, nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCodeTheme } from '@/contexts/CodeThemeContext';

interface CodeBlockProps {
  language: string;
  children: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language, 
  children, 
  showLineNumbers = true 
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { codeTheme } = useCodeTheme();

  const themeStyles = {
    vscDarkPlus,
    atomOneDark: atomDark,
    githubLight: tomorrow,
    nightOwl
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      toast({
        title: "Código copiado",
        description: "El código ha sido copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="my-4 overflow-hidden">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b">
        <span className="text-gray-400 text-sm font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-gray-400 hover:text-white h-8"
        >
          {copied ? '✅ Copiado' : '📋 Copiar'}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={themeStyles[codeTheme]}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: 'transparent',
          }}
          codeTagProps={{
            style: {
              fontSize: '14px',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
            }
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </Card>
  );
};
