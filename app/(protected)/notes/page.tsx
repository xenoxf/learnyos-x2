"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Search, Loader, Badge } from "lucide-react";
import styles from "@/styles/notes.module.css";
import Link from "next/link";

interface Note {
  id: number;
  title: string;
  content: string;
  category?: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotes();
      const typedData = (Array.isArray(data) ? data : []).map((note: any) => ({
        id: note.id,
        title: note.title || note.topic || "Sin título",
        content: note.content || note.description || "",
        category: note.category || note.level,
      }));
      setNotes(typedData);
    } catch (error: any) {
      console.error("Error loading notes:", error);
      toast({
        title: "Error",
        description: error.message || "No pudimos cargar tus notas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "El título y contenido son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const newNote = await apiService.createNote({
        topic: title,
        referenceText: content,
        quantity: 1,
        level: category || "intermediate",
      });
      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
      setCategory("");
      toast({
        title: "Nota creada",
        description: "Tu nota se ha guardado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear la nota",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await apiService.deleteNote(id);
      setNotes(notes.filter((n) => n.id !== id));
      toast({
        title: "Nota eliminada",
        description: "La nota ha sido removida correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la nota",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>📝 Notas</h1>
        <p className={styles.description}>Organiza y guarda tus apuntes de estudio</p>
      </section>

      {/* Create Form */}
      <Card className={styles.createCard}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Título</label>
          <Input
            type="text"
            placeholder="Nombre de la nota..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            disabled={creating}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Categoría (opcional)</label>
          <Input
            type="text"
            placeholder="ej: Matemáticas, Historia..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.input}
            disabled={creating}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Contenido</label>
          <Textarea
            placeholder="Escribe el contenido de tu nota..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
            rows={5}
            disabled={creating}
          />
        </div>
        <Button
          onClick={handleSaveNote}
          disabled={creating || !title.trim() || !content.trim()}
          className={styles.createButton}
        >
          {creating ? (
            <>
              <Loader className={styles.loaderIcon} />
              Creando...
            </>
          ) : (
            <>
              <Plus className={styles.plusIcon} />
              Crear Nota
            </>
          )}
        </Button>
      </Card>

      {/* Search */}
      {notes.length > 0 && (
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              type="text"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      )}

      {/* Notes List */}
      {loading ? (
        <div className={styles.loadingState}>
          <Loader className={styles.loadingIcon} />
          <p className={styles.loadingText}>Cargando notas...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card className={styles.emptyCard}>
          <p className={styles.emptyText}>
            {notes.length === 0 ? "No tienes notas aún" : "No se encontraron notas"}
          </p>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredNotes.map((note) => (
            <Card key={note.id} className={styles.noteCard}>
              <div className={styles.noteHeader}>
                <div className={styles.noteContent}>
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                  {note.category && (
                    <div className={styles.noteBadge}>
                      {note.category}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(note.id)}
                  disabled={deleting === note.id}
                  className={styles.deleteButton}
                >
                  {deleting === note.id ? (
                    <Loader className={styles.deleteLoader} />
                  ) : (
                    <Trash2 className={styles.deleteIcon} />
                  )}
                </Button>
              </div>
              <p className={styles.noteBody}>
                {note.content}
              </p>
              <p className={styles.noteFooter}>
                {note.content.length} caracteres
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}