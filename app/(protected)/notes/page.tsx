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
      <Card className="p-6 space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Título</label>
          <Input
            type="text"
            placeholder="Nombre de la nota..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
            disabled={creating}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Categoría (opcional)</label>
          <Input
            type="text"
            placeholder="ej: Matemáticas, Historia..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full"
            disabled={creating}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Contenido</label>
          <Textarea
            placeholder="Escribe el contenido de tu nota..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full"
            rows={5}
            disabled={creating}
          />
        </div>
        <Button
          onClick={handleSaveNote}
          disabled={creating || !title.trim() || !content.trim()}
          className="w-full"
        >
          {creating ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Crear Nota
            </>
          )}
        </Button>
      </Card>

      {/* Search */}
      {notes.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      )}

      {/* Notes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Cargando notas...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {notes.length === 0 ? "No tienes notas aún" : "No se encontraron notas"}
          </p>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredNotes.map((note) => (
            <Card key={note.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-2">{note.title}</h3>
                  {note.category && (
                    <div className="mt-2 inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                      {note.category}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(note.id)}
                  disabled={deleting === note.id}
                  className="text-destructive hover:text-destructive"
                >
                  {deleting === note.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {note.content}
              </p>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                {note.content.length} caracteres
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}