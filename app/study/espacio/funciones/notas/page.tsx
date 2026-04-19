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
import { notesService } from "@/services/notesService";
import { ManageItem } from "@/types";
import CardDeck from "@/components/espacio/card";

export default function FuncionesNotasPage() {
  const [items, setItems] = useState<ManageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedForModal, setSelectedForModal] =
    useState<FuncionesCardData | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const notes = await notesService.getNotesPrivate();
      setItems(
        notes.map((n: any) => ({
          id: n.id,
          title: n.title,
          description: n.description,
          code: n.code,
          length: n.length,
          area: n.area,
          tema: n.tema,
          creatorName: n.creatorName,
          likesCount: n.likesCount || 0,
          createdAt: n.createdAt,
        })),
      );
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
      await notesService.deleteNote(id);
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

  const handleSelectForModal = useCallback((item: ManageItem) => {
    setSelectedForModal({
      id: item.id,
      title: item.title,
      description: item.description || "",
      code: item.code || "",
      creatorName: item.creatorName || "",
      type: "note",
      lenght: 0,
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
