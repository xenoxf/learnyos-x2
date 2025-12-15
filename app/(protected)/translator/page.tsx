"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, ArrowRightLeft, Sparkles, Languages, Check, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TranslatorPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const languages = [
    { code: 'auto', name: 'Detectar idioma', flag: '🌐' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const translateText = async () => {
    if (!inputText.trim()) {
      toast({ title: "Error", description: "Escribe texto para traducir", variant: "destructive" });
      return;
    }

    setIsTranslating(true);
    try {
      const langPair = sourceLanguage === 'auto' ? `autodetect|${targetLanguage}` : `${sourceLanguage}|${targetLanguage}`;
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${langPair}`);
      if (!response.ok) throw new Error('Error en la API');
      const data = await response.json();
      if (data.responseStatus === 200) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        throw new Error('Error en la respuesta');
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo traducir", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copiado al portapapeles" });
    } catch (error) {
      toast({ title: "Error al copiar", variant: "destructive" });
    }
  };

  const swapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const getLanguageFlag = (code: string) => languages.find(l => l.code === code)?.flag || '🌐';
  const getLanguageName = (code: string) => languages.find(l => l.code === code)?.name || code;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Languages className="w-4 h-4 text-blue-600" />
          </div>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">Traductor</h1>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-center gap-3 flex-shrink-0">
        <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
          <SelectTrigger className="w-40 md:w-48 bg-background">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span>{getLanguageFlag(sourceLanguage)}</span>
                <span className="truncate">{getLanguageName(sourceLanguage)}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {languages.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={swapLanguages}
          disabled={sourceLanguage === 'auto'}
          className="shrink-0"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
          <SelectTrigger className="w-40 md:w-48 bg-background">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span>{getLanguageFlag(targetLanguage)}</span>
                <span className="truncate">{getLanguageName(targetLanguage)}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {languages.filter(lang => lang.code !== 'auto').map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Input Section */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-border">
          <div className="flex-1 p-4 md:p-6">
            <Textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Escribe o pega el texto aquí..."
              className="h-full min-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 text-base md:text-lg p-0"
            />
          </div>
          <div className="px-4 md:px-6 py-3 border-t border-border flex items-center justify-between bg-muted/20">
            <span className="text-xs text-muted-foreground">
              {inputText.length} caracteres
            </span>
            <Button
              onClick={translateText}
              disabled={isTranslating || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traduciendo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Traducir
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex-1 flex flex-col bg-muted/10">
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            {translatedText ? (
              <p className="text-base md:text-lg text-foreground whitespace-pre-wrap">
                {translatedText}
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Languages className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">La traducción aparecerá aquí</p>
              </div>
            )}
          </div>
          {translatedText && (
            <div className="px-4 md:px-6 py-3 border-t border-border flex items-center justify-between bg-muted/20">
              <span className="text-xs text-muted-foreground">
                {translatedText.length} caracteres
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslatorPage;