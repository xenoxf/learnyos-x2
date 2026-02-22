"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Trash2,
  Search,
  Loader,
  BookOpen,
  Tag,
  Sparkles,
  X,
  AlertCircle,
  Clock,
} from "lucide-react";
import styles from "@/styles/notes.module.css";
import DashboardLayout from "../layaut";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import type { Note, NoteContent, LevelOfDetail } from "@/types";

export const dynamic = "force-dynamic";

interface NoteWithPreview extends Note {
  preview: string;
  contentLength: number;
}

const LEVEL_DETAILS: Record<LevelOfDetail, string> = {
  breve: "Resumen corto y conciso",
  medio: "Contenido moderado con detalles",
  detallado: "Información completa y profunda",
  alto: "Información muy profunda",
};

/**
 * Extrae y ordena el contenido de una nota desde múltiples fuentes
 */
function getNoteFullContent(note: Note): string {
  // Prioridad: noteContents (estructura ordenada) > content > blocks
  if (note.noteContents && note.noteContents.length > 0) {
    return note.noteContents
      .sort((a, b) => a.order - b.order)
      .map((c) => c.content)
      .filter(Boolean)
      .join("\n\n");
  }

  if (note.content) {
    return note.content;
  }

  if (note.blocks && note.blocks.length > 0) {
    return note.blocks
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((b) => b.content ?? "")
      .filter(Boolean)
      .join("\n\n");
  }

  return "";
}

/**
 * Genera un preview truncado del contenido
 */
function generatePreview(content: string, maxLength: number = 200): string {
  if (!content) return "";
  return content.length > maxLength
    ? `${content.slice(0, maxLength)}...`
    : content;
}

/**
 * Formatea la fecha en formato legible
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function NotesPage(): React.ReactElement {
  // ==================== STATE ====================
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");
  const [numberOfNotes, setNumberOfNotes] = useState<number>(1);
  const [levelOfDetail, setLevelOfDetail] = useState<LevelOfDetail>("medio");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { toast } = useToast();

  // ==================== CONSTANTS ====================
  const LEVEL_DETAILS: Record<LevelOfDetail, string> = {
    breve: "Resumen corto y conciso",
    medio: "Contenido moderado con detalles",
    detallado: "Información completa y profunda",
    alto: "Información muy profunda",
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadNotes();
  }, []);

  // ==================== CALLBACKS ====================
  const loadNotes = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await apiService.getNotes();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No pudimos cargar tus notas";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ==================== HANDLERS ====================

  const handleGenerateNotes = async (): Promise<void> => {
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

      const generatedNotes = await apiService.generateNote({
        topic: topic.trim(),
        numberOfNotes,
        levelOfDetail,
      });

      if (Array.isArray(generatedNotes) && generatedNotes.length > 0) {
        setNotes((prev) => [...generatedNotes, ...prev]);
        setTopic("");
        setNumberOfNotes(1);

        toast({
          title: "¡Éxito!",
          description: `${generatedNotes.length} nota(s) generada(s) correctamente`,
        });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo generar la nota";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteNote = async (id: number): Promise<void> => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.",
      )
    ) {
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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar la nota";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyNote = async (note: Note): Promise<void> => {
    const content = getNoteFullContent(note);
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(note.id);
      toast({
        title: "Copiado",
        description: "Contenido copiado al portapapeles",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo copiar el contenido",
        variant: "destructive",
      });
    }
  };

  // ==================== COMPUTED ====================
  const notesWithPreviews = useMemo<NoteWithPreview[]>(() => {
    return notes.map((note) => {
      const fullContent = getNoteFullContent(note);
      return {
        ...note,
        preview: generatePreview(fullContent),
        contentLength: fullContent.length,
      };
    });
  }, [notes]);

  const filteredNotes = useMemo<NoteWithPreview[]>(() => {
    if (!searchQuery.trim()) {
      return notesWithPreviews;
    }

    const query = searchQuery.toLowerCase();
    return notesWithPreviews.filter((note) => {
      const searchIn =
        `${note.title ?? ""} ${note.description ?? ""} ${note.preview ?? ""}`.toLowerCase();
      return searchIn.includes(query);
    });
  }, [notesWithPreviews, searchQuery]);

  // ==================== RENDER ====================
  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <BookOpen className={styles.titleIcon} size={32} />
            <div className={styles.headerText}>
              <h1 className={styles.title}>Notas con IA</h1>
              <p className={styles.subtitle}>
                Genera y gestiona notas inteligentes
              </p>
            </div>
          </div>
        </section>

        {/* Generator Card */}
        <Card className={styles.generatorCard}>
          <div className={styles.generatorHeader}>
            <Sparkles className={styles.generatorIcon} size={24} />
            <div>
              <h2 className={styles.generatorTitle}>Generar Nueva Nota</h2>
              <p className={styles.generatorSubtitle}>
                Ingresa un tema y deja que la IA cree notas de estudio
              </p>
            </div>
          </div>

          <div className={styles.generatorForm}>
            {/* Topic Input */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="topic-input">
                Tema
              </label>
              <Input
                id="topic-input"
                type="text"
                placeholder="Ej: La Revolución Francesa, Teorema de Pitágoras, Fotosíntesis..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
                className={styles.input}
              />
            </div>

            {/* Quantity Input */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="quantity-input">
                Cantidad de notas
              </label>
              <div className={styles.quantityControl}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setNumberOfNotes((prev) => Math.max(1, prev - 1))
                  }
                  disabled={isGenerating || numberOfNotes <= 1}
                  className={styles.quantityButton}
                >
                  −
                </Button>
                <Input
                  id="quantity-input"
                  type="number"
                  min="1"
                  max="5"
                  value={numberOfNotes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= 5) {
                      setNumberOfNotes(val);
                    }
                  }}
                  disabled={isGenerating}
                  className={styles.quantityInput}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setNumberOfNotes((prev) => Math.min(5, prev + 1))
                  }
                  disabled={isGenerating || numberOfNotes >= 5}
                  className={styles.quantityButton}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Level of Detail */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Nivel de Detalle</label>
              <div className={styles.levelButtons}>
                {(["breve", "medio", "detallado"] as const).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={levelOfDetail === level ? "default" : "outline"}
                    onClick={() => setLevelOfDetail(level)}
                    disabled={isGenerating}
                    className={styles.levelButton}
                    title={LEVEL_DETAILS[level]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
              <p className={styles.levelHint}>{LEVEL_DETAILS[levelOfDetail]}</p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateNotes}
              disabled={isGenerating || !topic.trim()}
              className={styles.generateButton}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader className={styles.loaderIcon} size={18} />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Sparkles className={styles.sparkleIcon} size={18} />
                  <span>Generar Nota{numberOfNotes > 1 ? "s" : ""}</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <Input
              type="text"
              placeholder="Buscar en tus notas por título, descripción o contenido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className={styles.clearButton}
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </Button>
            )}
          </div>
          {filteredNotes.length > 0 && (
            <p className={styles.searchStats}>
              Mostrando{" "}
              <span className={styles.statsText}>{filteredNotes.length}</span>{" "}
              de{" "}
              <span className={styles.statsText}>
                {notesWithPreviews.length}
              </span>{" "}
              notas
            </p>
          )}
        </div>

        {/* Notes List */}
        {loading ? (
          <div className={styles.loadingState}>
            <Loader className={styles.loadingIcon} size={40} />
            <p className={styles.loadingText}>Cargando tus notas...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card className={styles.emptyState}>
            {searchQuery ? (
              <>
                <AlertCircle className={styles.emptyIcon} size={48} />
                <h3 className={styles.emptyTitle}>
                  No hay notas que coincidan
                </h3>
                <p className={styles.emptyText}>
                  Intenta con otros términos de búsqueda o genera nuevas notas
                </p>
              </>
            ) : (
              <>
                <BookOpen className={styles.emptyIcon} size={48} />
                <h3 className={styles.emptyTitle}>No tienes notas aún</h3>
                <p className={styles.emptyText}>
                  ¡Comienza generando tu primera nota con IA arriba! Puedes
                  crear notas sobre cualquier tema que quieras estudiar.
                </p>
              </>
            )}
          </Card>
        ) : (
          <div className={styles.notesGrid}>
            {filteredNotes.map((note) => (
              <Card key={note.id} className={styles.noteCard}>
                {/* Note Header */}
                <div className={styles.noteHeader}>
                  <div className={styles.noteContent}>
                    <h3 className={styles.noteTitle}>{note.title}</h3>
                    {note.description && (
                      <p className={styles.noteDescription}>
                        {note.description}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={deletingId === note.id}
                    className={styles.deleteButton}
                    aria-label="Eliminar nota"
                  >
                    {deletingId === note.id ? (
                      <Loader className={styles.deleteLoader} size={18} />
                    ) : (
                      <Trash2 className={styles.deleteIcon} size={18} />
                    )}
                  </Button>
                </div>

                {/* Tags */}
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

                {/* Preview */}
                <div className={styles.notePreview}>
                  {note.preview ? (
                    <MarkdownRenderer content={note.preview} />
                  ) : (
                    <em className={styles.emptyPreview}>Sin contenido</em>
                  )}
                </div>

                {/* Footer */}
                <div className={styles.noteFooter}>
                  <div className={styles.noteMetadata}>
                    {note.levelOfDetail && (
                      <span className={styles.noteMeta}>
                        <Sparkles size={12} />
                        {note.levelOfDetail.charAt(0).toUpperCase() +
                          note.levelOfDetail.slice(1)}
                      </span>
                    )}
                    {note.createdAt && (
                      <span className={styles.noteMeta}>
                        <Clock size={12} />
                        {formatDate(note.createdAt)}
                      </span>
                    )}
                  </div>
                  <span className={styles.contentLength}>
                    {note.contentLength} caracteres
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
