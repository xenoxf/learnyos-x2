"use client";

import React from "react";
import NoteCard from "./NoteCard";
import CreateNoteModal from "./CreateNoteModal";
import {
  StudyGridHeader,
  StudyGridContent,
  useStudyGrid,
  type StudyGridBaseItem,
  type ViewMode,
} from "@/components/study/StudyGrid";
import type { NoteDeck } from "@/types";
import { apiService } from "@/services/apiService";

interface NotesGridProps {
}

const NOTES_CONFIG = {
  entitySingular: "nota",
  entityPlural: "notas",
  searchPlaceholder: "Busca tus notas...",
  createButtonText: "Crear Nota",
  privateTabText: "Privadas",
  publicTabText: "Publicas",
  emptyPrivateText:
    "No hay notas privadas disponibles. Crea una para empezar.",
  emptyPublicText: "No hay notas publicas disponibles.",
  emptySearchText: "No se encontraron notas con esa búsqueda",
  loadingText: "Cargando notas...",
};

export default function NotesGrid({}: NotesGridProps) {
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
  } = useStudyGrid<NoteDeck & StudyGridBaseItem>({
    actions: {
      onLoad: async () => {
        const data =
          viewMode === "private"
            ? await apiService.getNotesPrivate()
            : await apiService.getNotesPublic();
        return data as (NoteDeck & StudyGridBaseItem)[];
      },
      onItemOpen: () => {}, // Now handled by NoteCard navigation
    },
    config: NOTES_CONFIG,
    defaultViewMode: "public",
  });

  return (
    <>
      <div className="study-grid-container">
        <StudyGridHeader
          config={NOTES_CONFIG}
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
          config={NOTES_CONFIG}
          renderCard={(note) => (
            <NoteCard
              key={note.id}
              note={note}
              onNoteDeleted={handleItemDeleted}
            />
          )}
        />
      </div>

      {showCreate && (
        <CreateNoteModal
          onClose={handleCloseModal}
          onNoteCreated={handleItemDeleted}
        />
      )}
    </>
  );
}

