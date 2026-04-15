"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import QuickQuizCard from "./QuickQuizCard";
import CreateQuickQuizModal from "./CreateQuickQuizModal";
import {
  StudyGridHeader,
  StudyGridContent,
  useStudyGrid,
  type StudyGridBaseItem,
  type ViewMode,
} from "@/components/study/StudyGrid";
import type { QuickQuizDeck } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "@/styles/quiz/quickQuizGrid.module.css";
import { quickQuizzesService } from "@/services/quizzesService";

const QUICK_QUIZ_CONFIG = {
  entitySingular: "quiz rápido",
  entityPlural: "quizzes rápidos",
  searchPlaceholder: "Busca un quiz rápido por título, tema, área o código...",
  createButtonText: "Crear Quiz Rápido",
  privateTabText: "Privados",
  publicTabText: "Publicos",
  emptyPrivateText:
    "No hay quizzes rápidos privados. Crea uno para empezar.",
  emptyPublicText: "No hay quizzes rápidos publicos disponibles.",
  emptySearchText: "No se encontraron quizzes rápidos con esa búsqueda",
  loadingText: "Cargando quizzes rápidos...",
};

export default function QuickQuizGrid() {
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
    isGuest,
  } = useStudyGrid<QuickQuizDeck & StudyGridBaseItem>({
    actions: {
      onLoad: useCallback(async (mode: ViewMode) => {
        const data =
          mode === "private"
            ? await quickQuizzesService.getQuizzesPrivate()
            : await quickQuizzesService.getQuizzesPublic();
        return data as (QuickQuizDeck & StudyGridBaseItem)[];
      }, []),
      onItemOpen: useCallback(() => {}, []),
    },
    config: QUICK_QUIZ_CONFIG,
    defaultViewMode: "public",
  });

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length >= 2) {
      setIsSearching(true);
      try {
        await quickQuizzesService.searchQuizzes(query, 20, 0, true);
      } catch (error) {
        console.error("Error en búsqueda:", error);
      } finally {
        setIsSearching(false);
      }
    }
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

  const renderCard = useCallback(
    (quiz: QuickQuizDeck & StudyGridBaseItem) => (
      <QuickQuizCard key={quiz.id} quiz={quiz} onQuizDeleted={handleItemDeleted} />
    ),
    [handleItemDeleted],
  );

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <Skeleton className={styles.skeletonTitle} />
          <Skeleton className={styles.skeletonDescription} />
          <Skeleton className={styles.skeletonMeta} />
        </div>
      )),
    [],
  );

  return (
    <>
      <div className="study-grid-container">
        <StudyGridHeader
          config={QUICK_QUIZ_CONFIG}
          viewMode={viewMode as ViewMode}
          setViewMode={setViewMode}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onCreateClick={handleCreateClick}
          isGuest={isGuest}
        />

        {loading && !isSearchActive && (
          <div className={styles.grid}>{skeletons}</div>
        )}

        {isSearching && isSearchActive && (
          <div className={styles.grid}>{skeletons}</div>
        )}

        {!loading && !isSearching && (
          <StudyGridContent
            loading={false}
            items={items}
            allItems={allItems}
            resultText={resultText}
            config={QUICK_QUIZ_CONFIG}
            renderCard={renderCard}
          />
        )}
      </div>

      {showCreate && (
        <CreateQuickQuizModal
          onClose={handleCloseModal}
          onQuizCreated={handleItemDeleted}
        />
      )}
    </>
  );
}
