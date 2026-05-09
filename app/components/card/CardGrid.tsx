"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import styles from "@/styles/card/CardGrid.module.css";
import { cardsService } from "@/services/cardsService";
import SkeletonCard from "../SkeletonCard";
import { httpClient } from "@/services/client";

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
  emptyPrivateText: "No tienes mazos privados todavía. Crea uno para comenzar.",
  emptyPublicText: "Aún no hay mazos públicos disponibles.",
  emptySearchText: "No se encontraron mazos con esa búsqueda",
  loadingText: "Cargando mazos...",
};

export default function CardGrid({ onCardSelect }: CardGridProps) {
  const [isSearching, setIsSearching] = useState(false);

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
    loadItems,
    refresh,
    isGuest,
  } = useStudyGrid<CardsDeck & StudyGridBaseItem>({
    actions: {
      onLoad: useCallback(async (mode: ViewMode) => {
        const data =
          mode === "private"
            ? await cardsService.getFlashcardsPrivate()
            : await cardsService.getFlashcardsPublic();
        const validCards = (data || []).filter(
          (card: any) => card.id && card.title,
        ) as (CardsDeck & StudyGridBaseItem)[];
        return validCards;
      }, []),
      onItemOpen: useCallback(
        (card) => {
          onCardSelect?.(card.id);
        },
        [onCardSelect],
      ),
    },
    config: CARDS_CONFIG,
    defaultViewMode: "public",
  });

  const handleCreateCard = useCallback(async (data: { reference: string; quantity: number; acceso: string }) => {
    try {
      await cardsService.generateFlashcards(data);
      httpClient.clearCache();
      setViewMode(data.acceso === "public" ? "public" : "private");
      refresh();
    } catch (err) {
      console.error("Error al generar flashcards:", err);
    }
  }, [refresh, setViewMode]);

  // Búsqueda con debounce
  const handleSearch = useCallback(async (query: string) => {
    // La búsqueda real la hace useStudyGrid vía filterItems
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      handleSearch(searchValue);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchValue, handleSearch]);

  const isSearchActive = useMemo(
    () => searchValue.trim().length >= 2,
    [searchValue],
  );

  // Memoizar renderizado de cards
  const renderCard = useCallback(
    (card: CardsDeck & StudyGridBaseItem) => (
      <CardContent
        key={card.id}
        card={card}
        onCardDeleted={handleItemDeleted}
        onOpen={() => onCardSelect?.(card.id)}
      />
    ),
    [handleItemDeleted, onCardSelect],
  );

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
          isGuest={isGuest}
        />

        {/* Loading state - Initial load (al entrar a la página) */}
        {loading && !isSearchActive && (
          <SkeletonCard />
        )}

        {/* Search loading */}
        {isSearching && isSearchActive && (
          <SkeletonCard />
        )}

        {/* Normal display - Solo cuando no está cargando */}
        {!loading && !isSearching && (
          <StudyGridContent
            loading={false}
            items={items}
            allItems={allItems}
            resultText={resultText}
            config={CARDS_CONFIG}
            renderCard={renderCard}
          />
        )}
      </div>
      {showCreate && (
        <CrearCard
          onClose={handleCloseModal}
          onCardCreated={handleCreateCard}
        />
      )}
    </>
  );
}
