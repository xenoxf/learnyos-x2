"use client";

import React, { useState, useEffect, useRef } from "react";
import { Flame, Eye, Moon, Heart, ArrowRight, Copy, Check, Sparkles } from "lucide-react";
import styles from "@/styles/klerk.module.css";
import { getCategoryPhrases, iconMap } from "./PhrasesData";

const categoryButtons = [
  { id: "motivation", label: "Motivación", icon: Flame },
  { id: "philosophical", label: "Filosofía", icon: Eye },
  { id: "dark", label: "Oscuro", icon: Moon },
  { id: "remember", label: "Propósito", icon: Heart },
];

export function InspirationSection() {
  const [currentCategory, setCurrentCategory] = useState("motivation");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [copied, setCopied] = useState(false);
  const phraseIndexRef = useRef(0);

  const handleRefreshPhrase = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const phrases = getCategoryPhrases(currentCategory);
      const nextIndex = (currentPhraseIndex + 1) % phrases.length;
      setCurrentPhraseIndex(nextIndex);
      phraseIndexRef.current = nextIndex;
      setIsFlipping(false);
    }, 300);
  };

  const handleCategoryChange = (cat: string) => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentCategory(cat);
      setCurrentPhraseIndex(0);
      phraseIndexRef.current = 0;
      setIsFlipping(false);
    }, 300);
  };

  const handleCopyPhrase = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFlipping) {
        const phrases = getCategoryPhrases(currentCategory);
        const nextIndex = (phraseIndexRef.current + 1) % phrases.length;
        phraseIndexRef.current = nextIndex;
        setCurrentPhraseIndex(nextIndex);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [currentCategory, isFlipping]);

  const currentPhrases = getCategoryPhrases(currentCategory);
  const currentPhrase = currentPhrases[currentPhraseIndex];
  const IconComponent = iconMap[currentPhrase.icon as keyof typeof iconMap] || Sparkles;

  return (
    <div className={styles.inspirationSection}>
      <div className={styles.inspirationCard}>
        <div className={styles.inspirationBg} />
        <div className={styles.inspirationContent}>
          <div className={styles.inspirationTop}>
            <div className={styles.inspirationCategory}>
              {categoryButtons.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`${styles.catBtn} ${currentCategory === cat.id ? styles.catBtnActive : ""}`}
                  >
                    <CatIcon size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`${styles.inspirationBody} ${isFlipping ? styles.flipAnimation : ""}`}>
            <div className={styles.inspirationIcon}>
              <IconComponent size={32} />
            </div>
            <h2 className={styles.inspirationPhrase}>&ldquo;{currentPhrase.text}&rdquo;</h2>
            <p className={styles.inspirationSubtext}>— {currentPhrase.subtext}</p>
          </div>

          <div className={styles.inspirationFooter}>
            <div className={styles.progressDots}>
              {currentPhrases.map((_, i) => (
                <span key={i} className={`${styles.dot} ${i === currentPhraseIndex ? styles.activeDot : ""}`} />
              ))}
            </div>
            <div className={styles.inspirationActions}>
              <button className={styles.inspBtn} onClick={handleRefreshPhrase}>
                <ArrowRight size={16} /> Siguiente
              </button>
              <button
                className={`${styles.inspBtn} ${copied ? styles.inspBtnCopied : ""}`}
                onClick={() => handleCopyPhrase(`"${currentPhrase.text}" - ${currentPhrase.subtext}`)}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
