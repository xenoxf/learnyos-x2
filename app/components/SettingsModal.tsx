"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Settings, Trash2, Edit, Lock, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import styles from "@/styles/settingsModal.module.css";
import type { Note } from "@/types";
import type { Card } from "@/types";
import type { Exam } from "@/types";

interface SettingsModalProps {
  onClose: () => void;
}

type TabType = "notes" | "cards" | "quizzes";

interface ManageItem {
  id: number;
  title: string;
  description?: string;
  acceso?: string;
  createdAt?: string;
  canDelete?: boolean;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("notes");
  const [items, setItems] = useState<ManageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      let data: ManageItem[] = [];

      if (activeTab === "notes") {
        const notes = await apiService.getNotesPrivate();
        data = notes.map((n: Note) => ({
          id: n.id,
          title: n.title,
          description: n.description,
          acceso: n.acceso,
          createdAt: n.createdAt,
          canDelete: true,
        }));
      } else if (activeTab === "cards") {
        const cards = await apiService.getCardsPrivates();
        data = cards.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          canDelete: c.canDelete,
        }));
      } else if (activeTab === "quizzes") {
        const quizzes = await apiService.getExamsPrivate();
        data = quizzes.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          canDelete: q.canDelete,
        }));
      }

      setItems(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los elementos",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeletingId(id);
      
      if (activeTab === "notes") {
        await apiService.deleteNote(id);
      } else if (activeTab === "cards") {
        await apiService.deleteCard(id);
      } else if (activeTab === "quizzes") {
        await apiService.deleteExam(id);
      }

      toast({
        title: "Eliminado",
        description: "El elemento ha sido eliminado correctamente",
      });

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el elemento",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Settings size={24} />
            <h2 className={styles.title}>Configuración</h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "notes" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("notes")}
            type="button"
          >
            📝 Notas
          </button>
          <button
            className={`${styles.tab} ${activeTab === "cards" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("cards")}
            type="button"
          >
            🃏 Flashcards
          </button>
          <button
            className={`${styles.tab} ${activeTab === "quizzes" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("quizzes")}
            type="button"
          >
            📝 Quizzes
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <p>Cargando elementos...</p>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>
              <p>No tienes elementos para mostrar</p>
            </div>
          ) : (
            <div className={styles.list}>
              {items.map((item) => (
                <div key={item.id} className={styles.listItem}>
                  <div className={styles.listItemContent}>
                    <div className={styles.listItemHeader}>
                      <h3 className={styles.listItemTitle}>{item.title}</h3>
                      {item.acceso && (
                        <span
                          className={`${styles.accessBadge} ${
                            item.acceso === "public" || item.acceso === "publico"
                              ? styles.accessPublic
                              : styles.accessPrivate
                          }`}
                        >
                          {item.acceso === "public" || item.acceso === "publico" ? (
                            <>
                              <Globe size={12} /> Público
                            </>
                          ) : (
                            <>
                              <Lock size={12} /> Privado
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className={styles.listItemDescription}>{item.description}</p>
                    )}
                    {item.createdAt && (
                      <span className={styles.listItemDate}>
                        Creado: {formatDate(item.createdAt)}
                      </span>
                    )}
                  </div>
                  <button
                    className={`${styles.deleteBtn} ${deletingId === item.id ? styles.deleting : ""}`}
                    onClick={() => handleDelete(item.id, item.title)}
                    disabled={deletingId === item.id}
                    type="button"
                    aria-label={`Eliminar ${item.title}`}
                  >
                    {deletingId === item.id ? (
                      <span className={styles.deleteSpinner} />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Aquí puedes gestionar y eliminar tu contenido privado
          </p>
        </div>
      </div>
    </div>
  );
}
