"use client";

import React, { useState } from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowRightLeft, Copy, Check, Sparkles, Loader } from "lucide-react";
import styles from "@/styles/translator.module.css";

const LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "Inglés", flag: "🇬🇧" },
  { code: "fr", name: "Francés", flag: "🇫🇷" },
  { code: "pt", name: "Portugués", flag: "🇵🇹" },
  { code: "de", name: "Alemán", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "Japonés", flag: "🇯🇵" },
  { code: "zh", name: "Chino", flag: "🇨🇳" },
];

export default function TranslatorPage() {
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("es");
  const [targetLang, setTargetLang] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Ingresa el texto a traducir",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
      const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
      const prompt = `Traduce el siguiente texto de ${sourceLangName} a ${targetLangName}:\n\n${text}`;
      const result = await apiService.generateWithGroq(prompt);
      setTranslatedText(result.text || result || "Sin respuesta");
      toast({
        title: "¡Traducción completada!",
        description: "El texto ha sido traducido correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al traducir",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setTranslatedText("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado",
      description: "Traducción copiada al portapapeles",
    });
  };

  const sourceLangObj = LANGUAGES.find(l => l.code === sourceLang);
  const targetLangObj = LANGUAGES.find(l => l.code === targetLang);

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>🌐 Traductor IA</h1>
        <p className={styles.description}>
          Traduce textos manteniendo el contexto académico
        </p>
      </section>

      <div className={styles.translatorWrapper}>
        {/* Language Selection */}
        <Card className="p-6 mb-6">
          <div className={styles.languageSelector}>
            <div className={styles.languageControl}>
              <label className={styles.label}>Idioma de origen</label>
              <Select value={sourceLang} onValueChange={setSourceLang} disabled={loading}>
                <SelectTrigger className={styles.selectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              disabled={loading}
              className={styles.swapButton}
              title="Intercambiar idiomas"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            <div className={styles.languageControl}>
              <label className={styles.label}>Idioma destino</label>
              <Select value={targetLang} onValueChange={setTargetLang} disabled={loading}>
                <SelectTrigger className={styles.selectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Input and Output */}
        <div className={styles.contentWrapper}>
          <div className={styles.textArea}>
            <div className="flex items-center justify-between mb-2">
              <label className={styles.label}>Texto a traducir</label>
              <span className="text-xs text-muted-foreground">{text.length} caracteres</span>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ingresa el texto que deseas traducir..."
              className={styles.textarea}
              rows={8}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            size="lg"
            className={styles.translateButton}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Traduciendo...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Traducir
              </>
            )}
          </Button>

          {translatedText && (
            <div className={styles.textArea}>
              <div className="flex items-center justify-between mb-2">
                <label className={styles.label}>Traducción</label>
                <span className="text-xs text-muted-foreground">{translatedText.length} caracteres</span>
              </div>
              <Card className={styles.outputCard}>
                <p className={styles.translatedText}>{translatedText}</p>
              </Card>
              <div className={styles.outputActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={styles.copyButton}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}