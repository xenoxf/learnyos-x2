'use client';

import React, { useState, useCallback } from 'react';
import styles from './Notes.module.css';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface NotesProps {
  initialNotes?: Note[];
  onSave?: (notes: Note[]) => void;
  onImproveNote?: (content: string) => Promise<string>;
}

export const Notes: React.FC<NotesProps> = ({
  initialNotes = [],
  onSave,
  onImproveNote,
}) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(
    initialNotes[0]?.id || null
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const createNewNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nueva Nota',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setTitle(newNote.title);
    setContent(newNote.content);
  }, []);

  const updateActiveNote = useCallback(() => {
    if (!activeNoteId) return;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === activeNoteId
          ? {
              ...note,
              title,
              content,
              updatedAt: new Date(),
            }
          : note
      )
    );
  }, [activeNoteId, title, content]);

  const selectNote = useCallback((noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setActiveNoteId(noteId);
      setTitle(note.title);
      setContent(note.content);
    }
  }, [notes]);

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
      setTitle('');
      setContent('');
    }
  }, [activeNoteId]);

  const improveNote = useCallback(async () => {
    if (!onImproveNote) return;

    setIsImproving(true);
    try {
      const improvedContent = await onImproveNote(content);
      setContent(improvedContent);
      updateActiveNote();
    } catch (error) {
      console.error('Error improving note:', error);
    } finally {
      setIsImproving(false);
    }
  }, [content, onImproveNote, updateActiveNote]);

  const exportNote = useCallback(() => {
    if (!activeNote) return;

    const markdown = `# ${activeNote.title}\n\n${activeNote.content}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeNote]);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.notesContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Mis Notas</h2>
          <button
            className={styles.newNoteButton}
            onClick={createNewNote}
            title="Nueva nota"
          >
            +
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar notas..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className={styles.notesList}>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`${styles.noteItem} ${
                activeNoteId === note.id ? styles.active : ''
              }`}
              onClick={() => selectNote(note.id)}
            >
              <div className={styles.noteItemContent}>
                <h3 className={styles.noteItemTitle}>{note.title}</h3>
                <p className={styles.noteItemPreview}>
                  {note.content.substring(0, 50)}...
                </p>
              </div>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                title="Eliminar nota"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.editor}>
        {activeNote ? (
          <>
            <div className={styles.editorHeader}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={updateActiveNote}
                className={styles.editorTitle}
                placeholder="Título de la nota"
              />
              <div className={styles.editorActions}>
                <button
                  className={styles.actionButton}
                  onClick={improveNote}
                  disabled={isImproving || !content}
                  title="Mejorar con IA"
                >
                  {isImproving ? '⏳ Mejorando...' : '✨ Mejorar'}
                </button>
                <button
                  className={styles.actionButton}
                  onClick={exportNote}
                  title="Exportar como Markdown"
                >
                  📥 Exportar
                </button>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={updateActiveNote}
              className={styles.editorTextarea}
              placeholder="Escribe tu nota aquí... Soporta Markdown"
            />

            <div className={styles.editorFooter}>
              <span className={styles.wordCount}>
                {content.split(/\s+/).filter(Boolean).length} palabras
              </span>
              <span className={styles.lastUpdate}>
                Última actualización: {activeNote.updatedAt.toLocaleString('es-ES')}
              </span>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>No hay notas</h2>
            <p className={styles.emptyText}>
              Crea una nueva nota para comenzar
            </p>
            <button className={styles.createButton} onClick={createNewNote}>
              + Nueva Nota
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
