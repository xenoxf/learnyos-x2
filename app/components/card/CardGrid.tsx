"use client";

import React, { useState, useEffect, useCallback } from "react";
import CardContent from "./Card";
import CrearCard from "./CrearCard";
import {
  StudyGridHeader,
  StudyGridContent,
  useStudyGrid,
  type StudyGridBaseItem,
  type ViewMode,
} from "@/components/study/StudyGrid";
import type { CardsDeck } from "@/types";
import { apiService } from "@/services/apiService";

interface CardGridProps {
  onCardSelect?: (cardId: number) => void;
}

const CARDS_CONFIG = {
  entitySingular: "mazo",
  entityPlural: "mazos",
  searchPlaceholder: "Busca un mazo por título, tema, área o contenido...",
  createButtonText: "Crear Mazo",
  privateTabText: "Privados",
  publicTabText: "Publicos",
  emptyPrivateText:
    "No tienes mazos privados todavía. Crea uno para comenzar.",
  emptyPublicText: "Aún no hay mazos públicos disponibles.",
  emptySearchText: "No se encontraron mazos con esa búsqueda",
  loadingText: "Cargando mazos...",
};

export default function CardGrid({ onCardSelect }: CardGridProps) {
  const {
    searchValue,
    setSearchValue,
    items,
    allItems,
    loading,
    viewMode,
    setViewMode,
    showCreate,
    resultText,
    handleCreateClick,
    handleCloseModal,
    handleItemDeleted,
  } = useStudyGrid<CardsDeck>({
    actions: {
      onLoad: async () => {
        const data =
          viewMode === "private"
            ? await apiService.getFlashcardsPrivate()
            : await apiService.getFlashcardsPublic();
        return data as CardsDeck[];
      },
      onItemOpen: (card) => onCardSelect?.(card.id),
    },
    config: CARDS_CONFIG,
    defaultViewMode: "public",
  });

  return (
    <>
      <div className="study-grid-container">
        <StudyGridHeader
          config={CARDS_CONFIG}
          viewMode={viewMode as ViewMode}
          setViewMode={setViewMode}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onCreateClick={handleCreateClick}
        />

        <StudyGridContent
          loading={loading}
          items={items}
          allItems={allItems}
          resultText={resultText}
          config={CARDS_CONFIG}
          renderCard={(card) => (
            <CardContent
              key={card.id}
              card={card}
              onCardDeleted={handleItemDeleted}
              onOpen={() => onCardSelect?.(card.id)}
            />
          )}
        />
      </div>
      {showCreate && (
        <CrearCard
          onClose={handleCloseModal}
          onCardCreated={handleItemDeleted}
        />
      )}
    </>
  );
}
