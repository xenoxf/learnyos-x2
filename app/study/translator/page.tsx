"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import DashboardLayout from "../layaut";
import styles from "@/styles/translator.module.css";

interface TranslationResult {
  original: string;
  translated: string;
  language: string;
}

const LANG_CODES: Record<string, string> = {
  español: "es",
  inglés: "en",
  francés: "fr",
  alemán: "de",
  italiano: "it",
  portugués: "pt",
  chino: "zh",
  japonés: "ja",
  coreano: "ko",
  árabe: "ar",
};

async function translateWithMyMemory(
  text: string,
  targetLang: string
): Promise<string> {
  const targetCode = LANG_CODES[targetLang] ?? "es";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetCode}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al conectar con el servicio de traducción");
  const data = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number };
  if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
    throw new Error("No se pudo obtener la traducción");
  }
  return data.responseData.translatedText;
}

export default function TranslatorPage() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("español");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un texto para traducir",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const translated = await translateWithMyMemory(text, targetLanguage);

      setResult({
        original: text,
        translated,
        language: targetLanguage,
      });

      toast({
        title: "Éxito",
        description: "Texto traducido correctamente",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al traducir el texto";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Copiado",
          description: "Texto copiado al portapapeles",
        });
      });
    }
  };

  const languages = [
    "español",
    "inglés",
    "francés",
    "alemán",
    "italiano",
    "portugués",
    "chino",
    "japonés",
    "coreano",
    "árabe",
  ];

  return (
    <DashboardLayout>
      <div className={styles.translatorContainer}>
        <div className={styles.header}>
          <h1>Traductor</h1>
          <p className={styles.subtitle}>Traduce textos a diferentes idiomas</p>
        </div>

        <div className={styles.content}>
          <div className={styles.inputSection}>
            <div className={styles.inputGroup}>
              <label htmlFor="text">Texto a traducir</label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ingresa el texto que deseas traducir..."
                className={styles.textarea}
                rows={6}
              />
              <div className={styles.charCount}>
                {text.length} / 5000 caracteres
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="language">Idioma destino</label>
              <select
                id="language"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className={styles.select}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleTranslate}
              disabled={isLoading || !text.trim()}
              className={styles.button}
            >
              {isLoading ? "Traduciendo..." : "Traducir"}
            </button>
          </div>

          {result && (
            <div className={styles.resultSection}>
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h3>Original</h3>
                  <button
                    onClick={() => handleCopy(result.original)}
                    className={styles.copyButton}
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
                <div className={styles.resultContent}>
                  <MarkdownRenderer content={result.original} />
                </div>
              </div>

              <div className={styles.arrow}>→</div>

              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h3>{result.language}</h3>
                  <button
                    onClick={() => handleCopy(result.translated)}
                    className={styles.copyButton}
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
                <div className={styles.resultContent}>
                  <MarkdownRenderer content={result.translated} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
