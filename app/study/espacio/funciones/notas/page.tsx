"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertTriangle, FileText } from "lucide-react";
import { apiService } from "@/services/apiService";
import { toast } from "@/hooks/useLocalToast";
import { CardMetadataModal, type CardMetadata } from "@/components/espacio/CardMetadataModal";
import styles from "@/styles/espacio/espacioPages.module.css";

interface ManageItem {
  id: number;
  title: string;
  description?: string;
  code?: string;
  contentsCount?: number;
  area?: string;
  tema?: string;
  creatorName?: string;
  likesCount?: number;
  createdAt?: string;
}

export default function FuncionesNotasPage() {
  const [items, setItems] = useState<ManageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedForModal, setSelectedForModal] = useState<CardMetadata | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const notes = await apiService.getNotesPrivate();
      setItems(notes.map((n: any) => ({
        id: n.id, title: n.title, description: n.description,
        code: n.code, contentsCount: n.contentsCount, area: n.area, tema: n.tema,
        creatorName: n.creatorName, likesCount: n.likesCount || 0,
        createdAt: n.createdAt,
      })));
    } catch {
      toast.error("Error", "No se pudieron cargar las notas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      setDeletingId(id);
      await apiService.deleteNote(id);
      toast.success("Eliminado", "Nota eliminada correctamente");
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedForModal(null);
    } catch {
      toast.error("Error", "No se pudo eliminar");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const handleViewContent = useCallback((id: number) => {
    setSelectedForModal(null);
    window.location.href = `/study/notes/${id}`;
  }, []);

  if (loading) {
    return <div className={styles.loadingState}><RefreshCw size={24} className={styles.spinner} /><p>Cargando notas...</p></div>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText size={48} className={styles.emptyIcon} />
        <p>No tienes notas aún</p>
      </div>
    );
  }

  return (
    <>
      {selectedForModal && (
        <CardMetadataModal
          card={selectedForModal}
          onClose={() => setSelectedForModal(null)}
          onViewContent={handleViewContent}
          onDelete={handleDelete}
          isOwner={true}
        />
      )}

      <div className={styles.itemsList}>
        {items.map((item) => (
          <div
            key={item.id}
            className={styles.itemCard}
            onClick={() => setSelectedForModal({
              ...item,
              type: "note",
            })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedForModal({
                  ...item,
                  type: "note",
                });
              }
            }}
          >
            <div className={styles.itemCardHeader}>
              <h4 className={styles.itemCardTitle}>{item.title}</h4>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {deletingId === item.id ? (
                  <RefreshCw size={16} className={styles.spinner} />
                ) : null}
              </div>
            </div>
            <p className={styles.itemCardDesc}>{item.description || "Sin descripción"}</p>
            <div className={styles.itemCardMeta}>
              {item.area && <span className={styles.itemBadge}>{item.area}</span>}
              {item.contentsCount && <span>{item.contentsCount} secciones</span>}
            </div>
            <div className={styles.itemCardFooter}>
              <span className={styles.itemCreator}>
                {item.creatorName || "Anónimo"}
              </span>
              {item.code && (
                <span className={styles.itemCode}>
                  {item.code}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
