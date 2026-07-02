"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain } from "lucide-react";
import CardGrid from "@/components/card/CardGrid";
import CardKlekComponent from "@/components/card/CardKlek";
import { cardsService } from "@/services/cardsService";
import type { ReviewStats } from "@/types";

export default function FlashcardsPage() {
  const router = useRouter();
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    cardsService.getReviewStats().then(setReviewStats).catch(() => {});
  }, []);

  const handleCardSelect = useCallback((cardId: number) => {
    setSelectedCardId(cardId);
  }, []);

  const handleCloseCarousel = useCallback(() => {
    setSelectedCardId(null);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ padding: "0.75rem 1rem 0", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button
          onClick={() => router.push("/study/flashcards/review")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          type="button"
        >
          <Brain size={18} />
          Repaso del día
          {reviewStats && reviewStats.dueToday > 0 && (
            <span className="ml-1 bg-primary-foreground/20 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {reviewStats.dueToday}
            </span>
          )}
        </button>
      </div>
      <CardGrid onCardSelect={handleCardSelect} />

      {selectedCardId && (
        <CardKlekComponent
          cardId={selectedCardId}
          onClose={handleCloseCarousel}
        />
      )}
    </div>
  );
}
