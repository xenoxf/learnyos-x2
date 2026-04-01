"use client";

import React from "react";
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
import { apiService } from "@/services/apiService";

interface QuizGridProps {}

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

export default function QuizGrid({}: QuizGridProps) {
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
  } = useStudyGrid<ExamDeck>({
    actions: {
      onLoad: async () => {
        const data =
          viewMode === "private"
            ? await apiService.getExamsPrivate()
            : await apiService.getExamsPublic();
        return data as ExamDeck[];
      },
      onItemOpen: () => {},
    },
    config: QUIZ_CONFIG,
    defaultViewMode: "public",
  });

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
        />

        <StudyGridContent
          loading={loading}
          items={items}
          allItems={allItems}
          resultText={resultText}
          config={QUIZ_CONFIG}
          renderCard={(quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onQuizDeleted={handleItemDeleted}
            />
          )}
        />
      </div>

      {showCreate && (
        <CreateQuizModal
          onClose={handleCloseModal}
          onQuizCreated={handleItemDeleted}
        />
      )}
    </>
  );
}
