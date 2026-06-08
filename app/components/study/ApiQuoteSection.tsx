"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, RefreshCw } from "lucide-react";
import styles from "@/styles/klerk.module.css";
import { FALLBACK_QUOTES } from "./PhrasesData";

export function ApiQuoteSection() {
  const [apiQuote, setApiQuote] = useState<{ content: string; author: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchQuote = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch("https://api.quotable.io/random?tags=inspirational|wisdom", { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        setApiQuote({ content: data.content, author: data.author });
      } else {
        throw new Error("Failed to fetch");
      }
    } catch {
      setError(true);
      const randomFallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setApiQuote(randomFallback);
    }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  if (!apiQuote && !isLoading) return null;

  return (
    <div className={styles.apiQuoteCard}>
      <div className={styles.apiQuoteHeader}>
        <Star size={16} style={{ color: "hsl(var(--primary))" }} />
        <span className={styles.apiQuoteLabel}>
          {error ? "Sabiduría Local" : "Sabiduría del Universo"}
        </span>
        <button onClick={fetchQuote} className={styles.refreshButton} disabled={isLoading} aria-label="Nueva frase">
          <RefreshCw size={14} className={isLoading ? styles.spinning : ""} />
        </button>
      </div>
      {isLoading ? (
        <div className={styles.quoteLoadingSkeleton}>
          <div className={styles.skeletonLine} style={{ width: '80%' }} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
        </div>
      ) : apiQuote ? (
        <>
          <blockquote className={styles.apiQuoteText}>&quot;{apiQuote.content}&quot;</blockquote>
          <cite className={styles.apiQuoteAuthor}>— {apiQuote.author}</cite>
        </>
      ) : null}
    </div>
  );
}
