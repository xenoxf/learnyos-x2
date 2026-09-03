"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/useLocalToast";
import {
  FuncionesCardModal,
} from "@/components/espacio/FuncionesCardModal";
import { quizzesService } from "@/services/quizzesService";
import type { UnifiedCardData } from "@/types";
import CardDeck from "@/components/espacio/card";

export default function FuncionesQuizzesPage() {
  const [items, setItems] = useState<UnifiedCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedForModal, setSelectedForModal] = useState<UnifiedCardData | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const quizzes = await quizzesService.getExamsPrivate();
      setItems(
        quizzes.map((q) => ({
          ...q,
          type: (q.type as any) || "quiz",
        })),
      );
    } catch {
      toast.error("Error", "No se pudieron cargar los quizzes");
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
      await quizzesService.deleteExam(id);
      toast.success("Eliminado", "Quiz eliminado correctamente");
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
    window.location.href = `/study/quiz/${id}`;
  }, []);

  const handleSelectForModal = useCallback((item: UnifiedCardData) => {
    setSelectedForModal(item);
  }, []);

  return (
    <>
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
