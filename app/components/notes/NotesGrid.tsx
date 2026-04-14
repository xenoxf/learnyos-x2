"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import styles from "@/styles/notes/NotesGrid.module.css";
import { notesService } from "@/services/notesService";

interface NotesGridProps {}

const NOTES_CONFIG = {
  entitySingular: "nota",
  entityPlural: "notas",
  searchPlaceholder: "Busca tus notas por título, tema, área o contenido...",
  createButtonText: "Crear Nota",
  privateTabText: "Privadas",
  publicTabText: "Publicas",
  emptyPrivateText: "No hay notas privadas disponibles. Crea una para empezar.",
  emptyPublicText: "No hay notas publicas disponibles.",
  emptySearchText: "No se encontraron notas con esa búsqueda",
  loadingText: "Cargando notas...",
};

export default function NotesGrid({}: NotesGridProps) {
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
  } = useStudyGrid<NoteDeck & StudyGridBaseItem>({
    actions: {
      onLoad: useCallback(async (mode: ViewMode) => {
        const data =
          mode === "private"
            ? await notesService.getNotesPrivate()
            : await notesService.getNotesPublic();
        return data as (NoteDeck & StudyGridBaseItem)[];
      }, []),
      onItemOpen: useCallback(() => {}, []),
    },
    config: NOTES_CONFIG,
    defaultViewMode: "public",
  });

  // Búsqueda con debounce optimizado
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length >= 2) {
      setIsSearching(true);
      try {
        await notesService.searchNotes(query, 20, 0, true);
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

  // Memoizar renderizado de notas
  const renderCard = useCallback(
    (note: NoteDeck & StudyGridBaseItem) => (
      <NoteCard key={note.id} note={note} onNoteDeleted={handleItemDeleted} />
    ),
    [handleItemDeleted],
  );

  // Memoizar skeleton array
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
          config={NOTES_CONFIG}
          viewMode={viewMode as ViewMode}
          setViewMode={setViewMode}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onCreateClick={handleCreateClick}
          isGuest={isGuest}
        />

        {/* Loading state - Initial load (al entrar a la página) */}
        {loading && !isSearchActive && (
          <div className={styles.grid}>{skeletons}</div>
        )}

        {/* Search loading */}
        {isSearching && isSearchActive && (
          <div className={styles.grid}>{skeletons}</div>
        )}

        {/* Normal display - Solo cuando no está cargando */}
        {!loading && !isSearching && (
          <StudyGridContent
            loading={false}
            items={items}
            allItems={allItems}
            resultText={resultText}
            config={NOTES_CONFIG}
            renderCard={renderCard}
          />
        )}
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
