"use client";

import React, { useState, useCallback } from "react";
import CardGrid from "@/components/card/CardGrid";
import CardKlekComponent from "@/components/card/CardKlek";

export default function FlashcardsPage() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const handleCardSelect = useCallback((cardId: number) => {
    setSelectedCardId(cardId);
  }, []);

  const handleCloseCarousel = useCallback(() => {
    setSelectedCardId(null);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
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
