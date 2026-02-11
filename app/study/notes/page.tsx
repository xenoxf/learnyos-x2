"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Plus,
  Search,
  Loader,
  BookOpen,
  Tag,
  Sparkles,
  X,
} from "lucide-react";
import styles from "@/styles/notes.module.css";
import DashboardLayout from "../layaut";
import type { Note } from "@/types";
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export default function NotesPage() {
  // Estados principales
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para generación
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [levelOfDetail, setLevelOfDetail] = useState<"breve" | "medio" | "alto">("medio");

  // Estados para UI
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { toast } = useToast();

  // Cargar notas al montar
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotes();
      const typedNotes = Array.isArray(data) ? data : [];
      setNotes(typedNotes);
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
  }, [toast]);

  // Generar nota
  const handleGenerateNotes = async () => {
    if (!topic.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor, ingresa un tema",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      const newNote = await apiService.createNote({
        topic: topic.trim(),
        level: levelOfDetail,
      });

      if (newNote) {
        setNotes((prev) => [newNote, ...prev]);
        setTopic("");
        toast({
          title: "¡Éxito!",
          description: "Nota generada correctamente",
        });
      }
    } catch (error: any) {
      console.error("Error generating notes:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo generar la nota",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Eliminar nota
  const handleDeleteNote = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
      return;
    }

    try {
      setDeletingId(id);
      await apiService.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast({
        title: "Nota eliminada",
        description: "La nota ha sido eliminada correctamente",
      });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la nota",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrar notas
  const filteredNotes = notes.filter(
    (note) =>
      (note.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <section className={styles.header}>
          <h1 className={styles.title}>
            <BookOpen className={styles.titleIcon} />
            Notas IA
          </h1>
          <p className={styles.subtitle}>
            Genera notas automáticamente o gestiona las existentes
          </p>
        </section>

        {/* Generator Card */}
        <Card className={styles.generatorCard}>
          <div className={styles.generatorHeader}>
            <Sparkles className={styles.generatorIcon} />
            <h2>Generar Nota con IA</h2>
          </div>

          <div className={styles.generatorForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tema</label>
              <Input
                type="text"
                placeholder="Ej: La Revolución Francesa, Teorema de Pitágoras..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nivel de Detalle</label>
              <div className={styles.levelButtons}>
                {(["breve", "medio", "alto"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={levelOfDetail === level ? "default" : "outline"}
                    onClick={() => setLevelOfDetail(level)}
                    disabled={isGenerating}
                    className={styles.levelButton}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateNotes}
              disabled={isGenerating || !topic.trim()}
              className={styles.generateButton}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader className={styles.loaderIcon} />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className={styles.sparkleIcon} />
                  Generar Nota
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              type="text"
              placeholder="Buscar en tus notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className={styles.loadingState}>
            <Loader className={styles.loadingIcon} />
            <p>Cargando tus notas...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card className={styles.emptyState}>
            <BookOpen className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>
              {searchQuery ? "No hay notas que coincidan" : "No tienes notas aún"}
            </h3>
            <p className={styles.emptyText}>
              {searchQuery
                ? "Intenta con otros términos de búsqueda"
                : "¡Comienza generando tu primera nota con IA!"}
            </p>
          </Card>
        ) : (
          <div className={styles.notesGrid}>
            {filteredNotes.map((note) => (
              <Card key={note.id} className={styles.noteCard}>
                <div className={styles.noteHeader}>
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={deletingId === note.id}
                  >
                    {deletingId === note.id ? (
                      <Loader className={styles.loaderIcon} />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </Button>
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className={styles.noteTags}>
                    {note.tags.map((tag, idx) => (
                      <span key={idx} className={styles.noteTag}>
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className={styles.notePreview}>
                  {note.content && note.content.length > 150
                    ? `${note.content.substring(0, 150)}...`
                    : note.content || "Sin contenido"}
                </p>

                <div className={styles.noteFooter}>
                  <span className={styles.noteDate}>
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "Sin fecha"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
