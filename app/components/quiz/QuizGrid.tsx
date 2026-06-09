"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import QuizCard from "./QuizCard";
import CreateQuizModal from "./CreateQuizModal";
import {
  StudyGridHeader,
  StudyGridContent,
  useStudyGrid,
  type StudyGridBaseItem,
  type ViewMode,
} from "@/components/study/StudyGrid";
import type { ExamDeck } from "@/types";
import { quizzesService } from "@/services/quizzesService";
import SkeletonCard from "../SkeletonCard";
import { useExams } from "@/hooks/useExams";
import type { GenerateExamData } from "@/types";
import { toast } from "@/hooks/useLocalToast";
import { errorHandler } from "@/services/errorHandler";

interface QuizGridProps { }

const QUIZ_CONFIG = {
  entitySingular: "quiz",
  entityPlural: "quizzes",
  searchPlaceholder: "Busca un quiz por título, tema, área o código...",
  createButtonText: "Crear Quiz",
  privateTabText: "Privados",
  publicTabText: "Publicos",
  emptyPrivateText:
    "No hay quizzes privados disponibles. Crea uno para empezar.",
  emptyPublicText: "No hay quizzes publicos disponibles.",
  emptySearchText: "No se encontraron quizzes con esa búsqueda",
  loadingText: "Cargando quizzes...",
};

export default function QuizGrid({ }: QuizGridProps) {
  const [isSearching, _setIsSearching] = useState(false);
  const { generateExam } = useExams();

  const {
    searchValue,
    setSearchValue,
    items,
    allItems: _allItems,
    loading,
    viewMode,
    setViewMode,
    showCreate,
    resultText,
    handleCreateClick,
    handleCloseModal,
    handleItemDeleted,
    refresh,
    isGuest,
  } = useStudyGrid<ExamDeck & StudyGridBaseItem>({
    actions: {
      onLoad: useCallback(async (mode: ViewMode) => {
        const data =
          mode === "private"
            ? await quizzesService.getExamsPrivate()
            : await quizzesService.getExamsPublic();
        return data as (ExamDeck & StudyGridBaseItem)[];
      }, []),
      onItemOpen: useCallback(() => { }, []),
    },
    config: QUIZ_CONFIG,
    defaultViewMode: "public",
  });

  const handleCreateExam = useCallback(async (formData: GenerateExamData) => {
    try {
      await generateExam(formData);
      setViewMode(formData.acceso === "public" ? "public" : "private");
      refresh();
    } catch (err) {
      toast.error("Error", "No se pudo generar el examen");
      errorHandler(err, "Error generating quiz");
    }
  }, [generateExam, refresh, setViewMode]);

  // Búsqueda con debounce
  const handleSearch = useCallback(async (_query: string) => {
    // La búsqueda real la hace useStudyGrid vía filterItems sobre allItems
    // Si en el futuro necesitas búsqueda profunda en servidor, impleméntalo aquí.
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

  // Memoizar renderizado de quizzes
  const renderCard = useCallback(
    (quiz: ExamDeck & StudyGridBaseItem) => (
      <QuizCard key={quiz.id} quiz={quiz} onQuizDeleted={handleItemDeleted} />
    ),
    [handleItemDeleted],
  );

  return (
    <>
      <div className="study-grid-container">
        <StudyGridHeader
          config={QUIZ_CONFIG}
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
          <SkeletonCard />)}

        {/* Normal display - Solo cuando no está cargando */}
        {!loading && !isSearching && (
          <StudyGridContent
            loading={false}
            items={items}
            resultText={resultText}
            config={QUIZ_CONFIG}
            renderCard={renderCard}
          />
        )}
      </div>

      {showCreate && (
        <CreateQuizModal
          onClose={handleCloseModal}
          onQuizCreated={handleCreateExam}
        />
      )}
    </>
  );
}
