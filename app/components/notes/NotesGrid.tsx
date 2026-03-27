"use client";

import React, { useEffect, useState, useCallback } from "react";
import NoteCard from "./NoteCard";
import CreateNoteModal from "./CreateNoteModal";
import styles from "@/styles/notes/notesGrid.module.css";
import type { Note } from "@/types";
import { Input } from "../ui/input";
import { apiService } from "@/services/apiService";
import { Filter, Pyramid, Plus, Globe, Lock } from "lucide-react";
import { Button } from "../ui/button";

interface NotesGridProps {
  onNoteOpen?: (noteId: number) => void;
}

export default function NotesGrid({ onNoteOpen }: NotesGridProps) {
  const [searchValue, setSearchValue] = useState("");
  const [notes, setNotes] = useState<(Note & { canDelete?: boolean })[]>([]);
  const [allNotes, setAllNotes] = useState<(Note & { canDelete?: boolean })[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"private" | "public">("private");

  const filterNotes = useCallback(
    (notesToFilter: (Note & { canDelete?: boolean })[], term: string) => {
      const filtered = notesToFilter.filter(
        (note) =>
          note.title.toLowerCase().includes(term.toLowerCase()) ||
          note.description?.toLowerCase().includes(term.toLowerCase())
      );
      setNotes(filtered);
    },
    []
  );

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const currentUserId = apiService.getUser()?.id;
      const data =
        viewMode === "private"
          ? await apiService.getNotesPrivate()
          : await apiService.getNotesPublic();
      const typedData = (data as (Note & { canDelete?: boolean })[]).map((note) => ({
        ...note,
        canDelete: Boolean(currentUserId && note.userId && currentUserId === note.userId),
      }));
      setAllNotes(typedData);
      filterNotes(typedData, searchValue);
    } catch (err) {
      console.error("Error loading notes:", err);
      setAllNotes([]);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [searchValue, filterNotes, viewMode]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    filterNotes(allNotes, searchValue);
  }, [searchValue, allNotes, filterNotes]);

  const handleNoteDeleted = useCallback(async () => {
    await loadNotes();
  }, [loadNotes]);

  const handleCreateClick = () => {
    setShowCreate(true);
  };

  const handleCloseModal = () => {
    setShowCreate(false);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.viewTabs}>
            <button
              type="button"
              className={`${styles.viewTab} ${viewMode === "private" ? styles.viewTabActive : ""}`}
              onClick={() => setViewMode("private")}
            >
              <Lock size={16} /> Privadas
            </button>
            <button
              type="button"
              className={`${styles.viewTab} ${viewMode === "public" ? styles.viewTabActive : ""}`}
              onClick={() => setViewMode("public")}
            >
              <Globe size={16} /> Publicas
            </button>
          </div>
          <div className={styles.searchSection}>
            <Input
              className={styles.searchInput}
              placeholder="Busca tus notas..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              aria-label="Buscar notas"
            />
            <button 
              className={styles.filterBtn} 
              title="Filtrar"
              type="button"
              aria-label="Filtrar"
            >
              <Filter size={20} />
            </button>
            <button 
              className={styles.sortBtn} 
              title="Ordenar"
              type="button"
              aria-label="Ordenar"
            >
              <Pyramid size={20} />
            </button>
          </div>
          <Button
            onClick={handleCreateClick}
            className={styles.createBtn}
            type="button"
            aria-label="Crear nueva nota"
          >
            <Plus size={20} />
            Crear Nota
          </Button>
        </div>

        <div className={styles.gridContainer}>
          {loading ? (
            <div className={styles.loadingState}>
              <p>Cargando notas...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {allNotes.length === 0
                  ? viewMode === "private"
                    ? "No hay notas privadas disponibles. Crea una para empezar."
                    : "No hay notas publicas disponibles."
                  : "No se encontraron notas con esa búsqueda"}
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onNoteOpen={onNoteOpen}
                  onNoteDeleted={handleNoteDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateNoteModal
          onClose={handleCloseModal}
          onNoteCreated={handleNoteDeleted}
        />
      )}
    </>
  );
}
