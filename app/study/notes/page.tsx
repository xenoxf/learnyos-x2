"use client";

import React, { useMemo, useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { apiService } from "@/services/apiService";
import { FileText, Plus, Trash2, Loader, Eye, BookMarked, FolderOpen } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import styles from "@/styles/notes.module.css";
import type { Note, GenerateNoteData, NoteContent } from "@/types";
import DashboardLayout from "../layaut";

/** Módulo = grupo de notas de la misma generación (mismo título, misma creación) */
interface NoteModule {
  key: string;
  title: string;
  notes: Note[];
  createdAt: string;
}

function groupNotesByModule(notes: Note[]): NoteModule[] {
  const map = new Map<string, Note[]>();
  for (const note of notes) {
    const createdAt = new Date(note.createdAt).toISOString().slice(0, 16);
    const key = `${note.title}__${createdAt}`;
    const list = map.get(key) ?? [];
    list.push(note);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([key, notes]) => ({
    key,
    title: notes[0]?.title ?? "Sin título",
    notes: notes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    createdAt: notes[0]?.createdAt ?? "",
  }));
}

function getNoteDisplayContent(note: Note): string {
  if (note.description) return note.description;
  if (note.noteContents?.length) {
    return note.noteContents
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => c.content ?? "")
      .filter(Boolean)
      .join("\n\n");
  }
  return "";
}

const NotesPage: React.FC = () => {
  const { notes, loading, error, addNote, removeNote } = useNotes();
  const [selectedModule, setSelectedModule] = useState<NoteModule | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [formData, setFormData] = useState<GenerateNoteData>({
    topic: "",
    numberOfNotes: 1,
    levelOfDetail: "medio",
  });

  const modules = useMemo(() => groupNotesByModule(notes), [notes]);

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const response = await apiService.generateNote(formData);
      if (response?.notes?.length) {
        response.notes.forEach((note) => addNote(note));
        const mod = groupNotesByModule(response.notes)[0];
        if (mod) setSelectedModule(mod);
      }
      setFormData({ topic: "", numberOfNotes: 1, levelOfDetail: "medio" });
    } catch (err) {
      console.error("Error generating notes:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteModule = async (mod: NoteModule, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar el módulo "${mod.title}" con ${mod.notes.length} nota(s)?`)) return;
    try {
      for (const note of mod.notes) {
        await apiService.deleteNote(note.id);
        removeNote(note.id);
      }
      if (selectedModule?.key === mod.key) setSelectedModule(null);
    } catch (err) {
      console.error("Error deleting notes:", err);
    }
  };

  const handleSelectModule = (mod: NoteModule) => {
    setSelectedModule(mod);
  };

  return (
    <DashboardLayout>
      <div className={styles.notesContainer}>
        {sidebarOpen && (
          <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`${styles.notesSidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarSectionTitle}>Generar Notas</h3>
            <form onSubmit={handleGenerateNotes} className={styles.generateForm}>
              <input
                type="text"
                placeholder="Tema o referencia"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className={styles.formInput}
              />
              <input
                type="number"
                min="1"
                max="10"
                value={formData.numberOfNotes ?? 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfNotes: parseInt(e.target.value, 10) || 1,
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
                disabled={generating || !formData.topic?.trim()}
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
            <h3 className={styles.sidebarSectionTitle}>Módulos</h3>
            <div className={styles.notesList}>
              {loading ? (
                <div className={styles.loadingState}>
                  <Loader className={styles.spin} size={24} />
                  <span>Cargando notas...</span>
                </div>
              ) : error ? (
                <div className={styles.errorState}>{error}</div>
              ) : modules.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText size={24} />
                  <span>No hay módulos</span>
                </div>
              ) : (
                modules.map((mod) => (
                  <div
                    key={mod.key}
                    className={`${styles.moduleItem} ${
                      selectedModule?.key === mod.key ? styles.active : ""
                    }`}
                    onClick={() => handleSelectModule(mod)}
                  >
                    <FolderOpen size={18} className={styles.moduleIcon} />
                    <div className={styles.moduleItemContent}>
                      <p className={styles.moduleTitle}>{mod.title}</p>
                      <p className={styles.moduleMeta}>
                        {mod.notes.length} nota{mod.notes.length !== 1 ? "s" : ""} ·{" "}
                        {new Date(mod.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteModule(mod, e)}
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
          {selectedModule ? (
            <article className={styles.noteViewContainer}>
              <div className={styles.moduleHeader}>
                <h1 className={styles.moduleTitle}>{selectedModule.title}</h1>
                <p className={styles.moduleDate}>
                  {new Date(selectedModule.createdAt).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className={styles.notesGrid}>
                {selectedModule.notes.map((note, idx) => (
                  <section key={note.id} className={styles.noteCard}>
                    <h2 className={styles.noteCardTitle}>
                      {note.title}
                      {selectedModule.notes.length > 1 && (
                        <span className={styles.noteIndex}>Parte {idx + 1}</span>
                      )}
                    </h2>
                    {note.levelOfDetail && (
                      <span className={styles.levelBadge}>{note.levelOfDetail}</span>
                    )}
                    <div className={styles.noteCardContent}>
                      {note.noteContents && note.noteContents.length > 0 ? (
                        note.noteContents
                          .sort((a: NoteContent, b: NoteContent) => (a.order ?? 0) - (b.order ?? 0))
                          .map((content) => (
                            <div key={content.id ?? idx} className={styles.contentSection}>
                              {content.title && (
                                <h3 className={styles.contentTitle}>{content.title}</h3>
                              )}
                              <MarkdownRenderer content={content.content ?? ""} />
                            </div>
                          ))
                      ) : (
                        <MarkdownRenderer content={getNoteDisplayContent(note)} />
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          ) : (
            <div className={styles.emptyContent}>
              <BookMarked size={64} />
              <p>Selecciona o genera un módulo para comenzar</p>
              <div className={styles.instructionsBox}>
                <Eye size={20} />
                <ul>
                  <li>Ingresa un tema o referencia</li>
                  <li>Selecciona el número de notas y nivel de detalle</li>
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
