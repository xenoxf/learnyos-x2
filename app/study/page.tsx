"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Sparkles } from "lucide-react";
import styles from "@/styles/klerk.module.css";
import { quizzesService } from "@/services/quizzesService";
import { cardsService } from "@/services/cardsService";
import { useRouter } from "next/navigation";
import type { ExamDeck, CardsDeck } from "@/types";
import CardKlekComponent from "@/components/card/CardKlek";
import { PomodoroTimerWidget } from "@/components/study/PomodoroTimerWidget";
import { StatsOverview } from "@/components/study/StatsOverview";
import { QuickActions } from "@/components/study/QuickActions";
import { ContentLists } from "@/components/study/ContentLists";
import { InspirationSection } from "@/components/study/InspirationSection";
import { ApiQuoteSection } from "@/components/study/ApiQuoteSection";

export default function StudyPage() {
  const router = useRouter();
  const [publicExams, setPublicExams] = useState<ExamDeck[]>([]);
  const [publicCards, setPublicCards] = useState<CardsDeck[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [exams, cards] = await Promise.all([
          quizzesService.getExamsPublic(),
          cardsService.getFlashcardsPublic(),
        ]);
        setPublicExams(exams.slice(0, 6));
        setPublicCards(cards.slice(0, 6));
      } catch (error) {
        console.error("Error fetching community content:", error);
      } finally {
        setIsLoadingContent(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.bgGradient} />
      <div className={styles.backgroundEffects}>
        <div className={styles.particle} style={{ top: "10%", left: "20%" }} />
        <div className={styles.particle} style={{ top: "60%", left: "80%" }} />
        <div className={styles.particle} style={{ top: "80%", left: "30%" }} />
      </div>

      <header className={styles.heroHeader}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>Panel de Aprendizaje</span>
          </div>
          <h1 className={styles.heroTitle}>¿Qué quieres aprender hoy?</h1>
          <p className={styles.heroSubtitle}>Accede a tus herramientas de estudio y explora contenido de la comunidad</p>
        </div>
      </header>

      <main className={styles.main}>
        <PomodoroTimerWidget />

        <StatsOverview onSeeDetails={() => router.push("/study/espacio/rendimiento")} />

        <QuickActions />

        <ContentLists
          exams={publicExams}
          cards={publicCards}
          isLoading={isLoadingContent}
          onSelectCard={setSelectedCardId}
        />

        <InspirationSection />

        <Suspense fallback={null}>
          <ApiQuoteSection />
        </Suspense>

        {selectedCardId && (
          <CardKlekComponent
            cardId={selectedCardId}
            onClose={() => setSelectedCardId(null)}
          />
        )}
      </main>
    </div>
  );
}
