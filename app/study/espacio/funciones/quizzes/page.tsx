"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw, AlertTriangle, FileText } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FuncionesCardModal,
  type FuncionesCardData,
} from "@/components/espacio/FuncionesCardModal";
import styles from "@/styles/espacio/espacioPages.module.css";
import { quizzesService } from "@/services/quizzesService";
import { ManageItem } from "@/types";
import CardDeck from "@/components/espacio/card";

export default function FuncionesQuizzesPage() {
  const [items, setItems] = useState<ManageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedForModal, setSelectedForModal] =
    useState<FuncionesCardData | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const quizzes = await quizzesService.getExamsPrivate();
      setItems(
        quizzes.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          code: q.code,
          lenght: q.lenght,
          difficulty: q.difficulty,
          area: q.area,
          tema: q.tema,
          creatorName: q.creatorName,
          likesCount: q.likesCount || 0,
          createdAt: q.createdAt,
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

  const handleSelectForModal = useCallback((item: ManageItem) => {
    setSelectedForModal({
      id: item.id,
      title: item.title,
      description: item.description || "",
      code: item.code || "",
      creatorName: item.creatorName || "",
      type: "quiz",
      lenght: item.lenght || 0,
    });
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
