"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertTriangle, FileText } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import CardKlekComponent from "@/components/card/CardKlek";
import {
  FuncionesCardModal,
  type FuncionesCardData,
} from "@/components/espacio/FuncionesCardModal";
import styles from "@/styles/espacio/espacioPages.module.css";
import { cardsService } from "@/services/cardsService";

interface ManageItem {
  id: number;
  title: string;
  description?: string;
  code?: string;
  totalCards?: number;
  area?: string;
  tema?: string;
  creatorName?: string;
  likesCount?: number;
  createdAt?: string;
}

export default function FuncionesFlashcardsPage() {
  const [items, setItems] = useState<ManageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<ManageItem | null>(null);
  const [showKlek, setShowKlek] = useState(false);
  const [selectedForModal, setSelectedForModal] =
    useState<FuncionesCardData | null>(null);
  const [deletingFromModal, setDeletingFromModal] = useState<number | null>(
    null,
  );

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const cards = await cardsService.getFlashcardsPrivate();
      setItems(
        cards.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          code: c.code,
          totalCards: c.totalCards,
          area: c.area,
          tema: c.tema,
          creatorName: c.creatorName,
          likesCount: c.likesCount || 0,
          createdAt: c.createdAt,
        })),
      );
    } catch {
      toast.error("Error", "No se pudieron cargar las flashcards");
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
      setDeletingFromModal(id);
      await cardsService.deleteCard(id);
      toast.success("Eliminado", "Flashcard eliminada correctamente");
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedForModal(null);
    } catch {
      toast.error("Error", "No se pudo eliminar");
    } finally {
      setDeletingId(null);
      setDeletingFromModal(null);
    }
  }, []);

  const handleViewContent = useCallback(
    (id: number) => {
      setSelectedForModal(null);
      const item = items.find((i) => i.id === id);
      if (item) {
        setSelectedItem(item);
        setShowKlek(true);
      }
    },
    [items],
  );

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <RefreshCw size={24} className={styles.spinner} />
        <p>Cargando flashcards...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText size={48} className={styles.emptyIcon} />
        <p>No tienes flashcards aún</p>
      </div>
    );
  }

  return (
    <>
      {showKlek && selectedItem && (
        <CardKlekComponent
          cardId={selectedItem.id}
          onClose={() => setShowKlek(false)}
        />
      )}

      {selectedForModal && (
        <FuncionesCardModal
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
            onClick={() =>
              setSelectedForModal({
                ...item,
                type: "flashcard",
              })
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedForModal({
                  ...item,
                  type: "flashcard",
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
            <p className={styles.itemCardDesc}>
              {item.description || "Sin descripción"}
            </p>
            <div className={styles.itemCardMeta}>
              {item.area && (
                <span className={styles.itemBadge}>Área: {item.area}</span>
              )}
              {item.tema && (
                <span className={styles.itemBadge}>Tema: {item.tema}</span>
              )}
              {item.totalCards && (
                <span className={styles.diffBadge}>
                  {item.totalCards} tarjetas
                </span>
              )}
            </div>
            <div className={styles.itemCardFooter}>
              <span className={styles.itemCreator}>
                {item.creatorName || "Anónimo"}
              </span>
              {item.code && (
                <span className={styles.itemCode}>{item.code}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
