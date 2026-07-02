"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import CardKlekComponent from "@/components/card/CardKlek";
import {
  FuncionesCardModal,
} from "@/components/espacio/FuncionesCardModal";
import { CreateManualFlashcardModal } from "@/components/card/CreateManualFlashcardModal";
import { cardsService } from "@/services/cardsService";
import type { UnifiedCardData } from "@/types";
import CardDeck from "@/components/espacio/card";
import CrearCard from "@/components/card/CrearCard";

export default function FuncionesFlashcardsPage() {
  const [items, setItems] = useState<UnifiedCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<UnifiedCardData | null>(null);
  const [showKlek, setShowKlek] = useState(false);
  const [selectedForModal, setSelectedForModal] = useState<UnifiedCardData | null>(null);
  const [showManualCreate, setShowManualCreate] = useState(false);
  const [showAiCreate, setShowAiCreate] = useState(false);

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

      {showManualCreate && (
        <CreateManualFlashcardModal
          onClose={() => setShowManualCreate(false)}
          onCardCreated={loadItems}
        />
      )}

      {showAiCreate && (
        <CrearCard
          onClose={() => setShowAiCreate(false)}
          onCardCreated={loadItems}
        />
      )}

      <div className="flex items-center justify-end gap-2 px-4 py-3">
        <button
          onClick={() => setShowAiCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          type="button"
        >
          <Sparkles size={14} /> Crear con IA
        </button>
        <button
          onClick={() => setShowManualCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          type="button"
        >
          <Plus size={14} /> Nuevo Manual
        </button>
      </div>

      <CardDeck
        items={items}
        selectedForModal={handleSelectForModal}
        loading={loading}
        deletingId={deletingId || 0}
      />
    </>
  );
}
