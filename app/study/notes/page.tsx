"use client";

import React, { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { apiService } from "@/services/apiService";
import { FileText, Plus, Trash2, Loader, Eye, BookMarked } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import styles from "@/styles/notes.module.css";
import type { Note, GenerateNoteData } from "@/types";
import DashboardLayout from "../layaut";

const NotesPage: React.FC = () => {
  const { notes, loading, error, addNote, removeNote } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form states for generation
  const [formData, setFormData] = useState<GenerateNoteData>({
    topic: "",
    numberOfNotes: 1,
    levelOfDetail: "medio",
  });

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const response = await apiService.generateNote(formData);
      if (response && response.notes) {
        response.notes.forEach((note) => addNote(note));
      }
      setFormData({
        topic: "",
        numberOfNotes: 1,
        levelOfDetail: "medio",
      });
    } catch (err) {
      console.error("Error generating notes:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteNote = async (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.deleteNote(noteId);
      removeNote(noteId);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  return (
    <DashboardLayout>    <div className={styles.notesContainer}>
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`${styles.notesSidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarSectionTitle}>Generar Notas</h3>
          <form onSubmit={handleGenerateNotes} className={styles.generateForm}>
            <input
              type="text"
              placeholder="Tema o referencia"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              className={styles.formInput}
            />
            <input
              type="number"
              min="1"
              max="10"
              value={formData.numberOfNotes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfNotes: parseInt(e.target.value),
                })
              }
              className={styles.formInput}
              placeholder="Número de notas"
            />
            <select
              value={formData.levelOfDetail}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  levelOfDetail: e.target.value as "breve" | "medio" | "detallado",
                })
              }
              className={styles.formSelect}
            >
              <option value="breve">Breve</option>
              <option value="medio">Medio</option>
              <option value="detallado">Detallado</option>
            </select>
            <button
              type="submit"
              disabled={generating || !formData.topic || !formData.topic.trim()}
              className={styles.submitButton}
            >
              {generating ? (
                <>
                  <Loader className={styles.spin} size={18} />
                  Generando...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Generar
                </>
              )}
            </button>
          </form>
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarSectionTitle}>Tus Notas</h3>
          <div className={styles.notesList}>
            {loading ? (
              <div className={styles.loadingState}>
                <Loader className={styles.spin} size={24} />
                <span>Cargando notas...</span>
              </div>
            ) : error ? (
              <div className={styles.errorState}>{error}</div>
            ) : notes.length === 0 ? (
              <div className={styles.emptyState}>
                <FileText size={24} />
                <span>No hay notas</span>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`${styles.noteItem} ${selectedNote?.id === note.id ? styles.active : ""
                    }`}
                  onClick={() => handleSelectNote(note)}
                >
                  <div className={styles.noteItemContent}>
                    <p className={styles.noteTitle}>{note.title}</p>
                    <p className={styles.noteMeta}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {selectedNote ? (
          <article className={styles.noteViewContainer}>
            <div className={styles.noteHeader}>
              <div>
                <h1 className={styles.noteTitle}>{selectedNote.title}</h1>
                <p className={styles.noteDate}>
                  {new Date(selectedNote.createdAt).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {selectedNote.levelOfDetail && (
                <span className={styles.levelBadge}>
                  {selectedNote.levelOfDetail}
                </span>
              )}
            </div>

            <div className={styles.noteContent}>
              {selectedNote.noteContents && selectedNote.noteContents.length > 0 ? (
                selectedNote.noteContents
                  .sort((a, b) => a.order - b.order)
                  .map((content) => (
                    <section key={content.id} className={styles.contentSection}>
                      {content.title && (
                        <h2 className={styles.contentTitle}>{content.title}</h2>
                      )}
                      <MarkdownRenderer content={content.content} />
                    </section>
                  ))
              ) : (
                <p className={styles.noContent}>No hay contenido para mostrar</p>
              )}
            </div>
          </article>
        ) : (
          <div className={styles.emptyContent}>
            <BookMarked size={64} />
            <p>Selecciona o genera notas para comenzar</p>
            <div className={styles.instructionsBox}>
              <Eye size={20} />
              <ul>
                <li>Ingresa un tema o referencia</li>
                <li>Selecciona el nivel de detalle</li>
                <li>Haz clic en "Generar"</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
    </DashboardLayout>
  );
};

export default NotesPage;
