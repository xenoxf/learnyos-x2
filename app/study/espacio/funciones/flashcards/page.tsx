"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw, AlertTriangle, FileText } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { Skeleton } from "@/components/ui/skeleton";
import CardKlekComponent from "@/components/card/CardKlek";
import {
  FuncionesCardModal,
  type FuncionesCardData,
} from "@/components/espacio/FuncionesCardModal";
import styles from "@/styles/espacio/espacioPages.module.css";
import { cardsService } from "@/services/cardsService";
import { ManageItem } from "@/types";
import Card from "@/components/card/Card";
import CardDeck from "@/components/espacio/card";

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
          lenght: c.lenght,
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

  const handleSelectForModal = useCallback((item: ManageItem) => {
      setSelectedForModal({
        id: item.id,
        title: item.title,
        description: item.description || "",
        code: item.code || "",
        creatorName: item.creatorName || "",
        type: "flashcard",
        lenght: 0,
      });
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
        loading
        deletingId={deletingId as number}
      />
    </>
  );
}
