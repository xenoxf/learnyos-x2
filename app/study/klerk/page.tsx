"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, BookOpen, Lightbulb, Target, Clock } from "lucide-react";
import styles from "@/styles/klerk.module.css";

const PHRASES = [
  {
    category: "filosofía",
    text: "La vida no examinada no merece ser vivida.",
    author: "Sócrates",
  },
  {
    category: "disciplina",
    text: "Somos lo que hacemos día tras día. La excelencia no es un acto, sino un hábito.",
    author: "Aristóteles",
  },
  {
    category: "motivación",
    text: "El único lugar donde el éxito viene antes que el trabajo es en el diccionario.",
    author: "Vidal Sassoon",
  },
  {
    category: "filosofía",
    text: "No es lo que te sucede, sino cómo reaccionas a ello lo que importa.",
    author: "Epicteto",
  },
  {
    category: "disciplina",
    text: "El dolor es temporal. Rendirse dura para siempre.",
    author: "Lance Armstrong",
  },
  {
    category: "motivación",
    text: "Cree que puedes y ya estarás a medio camino.",
    author: "Theodore Roosevelt",
  },
  {
    category: "filosofía",
    text: "La felicidad no es algo que pospones para el futuro; es algo que diseñas para el presente.",
    author: "Jim Rohn",
  },
  {
    category: "disciplina",
    text: "La disciplina es el puente entre metas y logros.",
    author: "Jim Rohn",
  },
];

const TRICKS = [
  {
    title: "Técnica Pomodoro",
    description: "25 min enfoque total + 5 min descanso. Repite 4 veces, luego descanso largo.",
    icon: Clock,
  },
  {
    title: "Active Recall",
    description: "En lugar de releer, ponte a prueba. La recuperación activa fortalece la memoria.",
    icon: Lightbulb,
  },
  {
    title: "Spaced Repetition",
    description: "Repasa en intervalos crecientes: 1 día, 3 días, 1 semana, 1 mes.",
    icon: Target,
  },
  {
    title: "Feynman",
    description: "Si no puedes explicárselo a un niño de 5 años, no lo entiendes bien.",
    icon: BookOpen,
  },
];

export default function KlerkPage() {
  const [dailyPhrase, setDailyPhrase] = useState(PHRASES[0]);

  useEffect(() => {
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    setDailyPhrase(PHRASES[dayOfYear % PHRASES.length]);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Sparkles className={styles.titleIcon} />
            Klerk
          </h1>
          <p className={styles.subtitle}>
            Tu espacio de sabiduría, disciplina y crecimiento
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {/* Frase del día */}
        <section className={styles.dailyPhrase}>
          <div className={styles.phraseCard}>
            <div className={styles.phraseCategory}>{dailyPhrase.category}</div>
            <blockquote className={styles.phraseText}>
              &ldquo;{dailyPhrase.text}&rdquo;
            </blockquote>
            <cite className={styles.phraseAuthor}>— {dailyPhrase.author}</cite>
          </div>
        </section>

        {/* Trucos de estudio */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Lightbulb className={styles.sectionIcon} />
            Trucos de Estudio
          </h2>
          <div className={styles.tricksGrid}>
            {TRICKS.map((trick) => {
              const Icon = trick.icon;
              return (
                <div key={trick.title} className={styles.trickCard}>
                  <div className={styles.trickIcon}>
                    <Icon size={24} />
                  </div>
                  <h3 className={styles.trickTitle}>{trick.title}</h3>
                  <p className={styles.trickDescription}>{trick.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Frases por categoría */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <BookOpen className={styles.sectionIcon} />
            Sabiduría
          </h2>
          <div className={styles.phrasesGrid}>
            {PHRASES.map((phrase, index) => (
              <div key={index} className={styles.phraseCardSmall}>
                <div className={styles.phraseCategorySmall}>{phrase.category}</div>
                <p className={styles.phraseTextSmall}>{phrase.text}</p>
                <span className={styles.phraseAuthorSmall}>— {phrase.author}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
