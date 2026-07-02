"use client";

import React, { useState, useEffect, useCallback } from "react";

import { toast } from "@/hooks/useLocalToast";
import CardKlekComponent from "@/components/card/CardKlek";
import {
  FuncionesCardModal,
} from "@/components/espacio/FuncionesCardModal";
import { cardsService } from "@/services/cardsService";
import type { UnifiedCardData } from "@/types";
import CardDeck from "@/components/espacio/card";

export default function FuncionesFlashcardsPage() {
  const [items, setItems] = useState<UnifiedCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<UnifiedCardData | null>(null);
  const [showKlek, setShowKlek] = useState(false);
  const [selectedForModal, setSelectedForModal] =
    useState<UnifiedCardData | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const cards = await cardsService.getFlashcardsPrivate();
      setItems(
        cards.map((c) => ({
          ...c,
          type: "flashcard" as const,
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
      await cardsService.deleteCard(id);
      toast.success("Eliminado", "Flashcard eliminada correctamente");
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedForModal(null);
    } catch {
      toast.error("Error", "No se pudo eliminar");
    } finally {
      setDeletingId(null);
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

  const handleSelectForModal = useCallback((item: UnifiedCardData) => {
    setSelectedForModal(item);
  }, []);

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

      <CardDeck
        items={items}
        selectedForModal={handleSelectForModal}
        loading={loading}
        deletingId={deletingId || 0}
      />
    </>
  );
}
