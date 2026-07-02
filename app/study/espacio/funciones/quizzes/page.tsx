"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import {
  FuncionesCardModal,
} from "@/components/espacio/FuncionesCardModal";
import { CreateManualQuizModal } from "@/components/quiz/CreateManualQuizModal";
import { quizzesService } from "@/services/quizzesService";
import type { UnifiedCardData } from "@/types";
import CardDeck from "@/components/espacio/card";
import CreateQuizModal from "@/components/quiz/CreateQuizModal";

export default function FuncionesQuizzesPage() {
  const [items, setItems] = useState<UnifiedCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedForModal, setSelectedForModal] = useState<UnifiedCardData | null>(null);
  const [showManualCreate, setShowManualCreate] = useState(false);
  const [showAiCreate, setShowAiCreate] = useState(false);

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

      {showManualCreate && (
        <CreateManualQuizModal
          onClose={() => setShowManualCreate(false)}
          onQuizCreated={loadItems}
        />
      )}

      {showAiCreate && (
        <CreateQuizModal
          onClose={() => setShowAiCreate(false)}
          onQuizCreated={loadItems}
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
