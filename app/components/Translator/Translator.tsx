'use client';

import React, { useState, useCallback } from 'react';
import styles from './Translator.module.css';

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'Inglés', flag: '🇺🇸' },
  { code: 'fr', name: 'Francés', flag: '🇫🇷' },
  { code: 'de', name: 'Alemán', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugués', flag: '🇵🇹' },
  { code: 'ja', name: 'Japonés', flag: '🇯🇵' },
  { code: 'zh', name: 'Chino', flag: '🇨🇳' },
];

interface TranslationHistory {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  timestamp: Date;
}

interface TranslatorProps {
  onTranslate?: (text: string, from: string, to: string) => Promise<string>;
}

export const Translator: React.FC<TranslatorProps> = ({ onTranslate }) => {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('es');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim() || !onTranslate) return;

    setIsTranslating(true);
    try {
      const translated = await onTranslate(sourceText, sourceLang, targetLang);
      setTargetText(translated);

      const historyItem: TranslationHistory = {
        id: Date.now().toString(),
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        originalText: sourceText,
        translatedText: translated,
        timestamp: new Date(),
      };
      setHistory((prev) => [historyItem, ...prev].slice(0, 20));
    } catch (error) {
      console.error('Translation error:', error);
      setTargetText('Error en la traducción. Por favor, intenta de nuevo.');
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLang, targetLang, onTranslate]);

  const swapLanguages = useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(targetText);
    setTargetText(sourceText);
  }, [sourceLang, targetLang, sourceText, targetText]);

  const copyToClipboard = useCallback(async () => {
    if (!targetText) return;
    try {
      await navigator.clipboard.writeText(targetText);
      alert('¡Copiado al portapapeles!');
    } catch {
      console.error('Copy failed');
    }
  }, [targetText]);

  const loadFromHistory = useCallback((item: TranslationHistory) => {
    setSourceText(item.originalText);
    setTargetText(item.translatedText);
    setSourceLang(item.sourceLanguage);
    setTargetLang(item.targetLanguage);
    setShowHistory(false);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const sourceLanguage = LANGUAGES.find((l) => l.code === sourceLang);
  const targetLanguage = LANGUAGES.find((l) => l.code === targetLang);
  const sourceChars = sourceText.length;
  const targetChars = targetText.length;

  return (
    <div className={styles.translatorContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Traductor Libre</h1>
        <p className={styles.subtitle}>Traduce textos de forma gratuita con IA</p>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.languageSelector}>
          <div className={styles.languageGroup}>
            <label className={styles.label}>De:</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className={styles.select}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className={styles.swapButton}
            onClick={swapLanguages}
            title="Intercambiar idiomas"
          >
            ⇄
          </button>

          <div className={styles.languageGroup}>
            <label className={styles.label}>A:</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className={styles.select}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.textareasContainer}>
          <div className={styles.textareaWrapper}>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Escribe o pega el texto a traducir..."
              className={styles.textarea}
            />
            <div className={styles.charCount}>
              {sourceChars} caracteres
            </div>
          </div>

          <div className={styles.controlsBar}>
            <button
              className={styles.translateButton}
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
            >
              {isTranslating ? '⏳ Traduciendo...' : '🌐 Traducir'}
            </button>
          </div>

          <div className={styles.textareaWrapper}>
            <textarea
              value={targetText}
              readOnly
              placeholder="La traducción aparecerá aquí..."
              className={styles.textarea}
            />
            <div className={styles.charCount}>
              {targetChars} caracteres
            </div>
          </div>
        </div>

        {targetText && (
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={copyToClipboard}
              title="Copiar traducción"
            >
              📋 Copiar
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setShowHistory(!showHistory)}
              title={showHistory ? 'Ocultar historial' : 'Ver historial'}
            >
              📜 Historial ({history.length})
            </button>
          </div>
        )}
      </div>

      {showHistory && history.length > 0 && (
        <div className={styles.historyPanel}>
          <div className={styles.historyHeader}>
            <h3 className={styles.historyTitle}>Historial de Traducciones</h3>
            <button
              className={styles.clearButton}
              onClick={clearHistory}
              title="Limpiar historial"
            >
              ✕
            </button>
          </div>

          <div className={styles.historyList}>
            {history.map((item) => {
              const sourceLangName = LANGUAGES.find(
                (l) => l.code === item.sourceLanguage
              )?.name;
              const targetLangName = LANGUAGES.find(
                (l) => l.code === item.targetLanguage
              )?.name;

              return (
                <div
                  key={item.id}
                  className={styles.historyItem}
                  onClick={() => loadFromHistory(item)}
                >
                  <div className={styles.historyItemContent}>
                    <div className={styles.historyItemLanguages}>
                      {sourceLangName} → {targetLangName}
                    </div>
                    <p className={styles.historyItemText}>
                      {item.originalText.substring(0, 60)}...
                    </p>
                    <span className={styles.historyItemTime}>
                      {new Intl.DateTimeFormat('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(item.timestamp))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showHistory && history.length === 0 && (
        <div className={styles.emptyHistory}>
          <p>No hay traducciones en el historial</p>
        </div>
      )}
    </div>
  );
};
