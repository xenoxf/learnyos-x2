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

interface ManageItem {
  id: number;
  title: string;
  description?: string;
  code?: string;
  totalQuestions?: number;
  difficulty?: string;
  area?: string;
  tema?: string;
  creatorName?: string;
  likesCount?: number;
  createdAt?: string;
}

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
          totalQuestions: q.totalQuestions,
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

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.itemCardHeader}>
            <Skeleton className={styles.skeletonTitle} />
          </div>
          <Skeleton className={styles.skeletonDescription} />
          <Skeleton className={styles.skeletonDescriptionLine} />
          <div className={styles.skeletonBadges}>
            <Skeleton className={styles.skeletonBadge} />
            <Skeleton className={styles.skeletonBadge} />
            <Skeleton className={styles.skeletonBadge} />
          </div>
          <div className={styles.skeletonFooter}>
            <Skeleton className={styles.skeletonCreator} />
            <Skeleton className={styles.skeletonCode} />
          </div>
        </div>
      )),
    [],
  );

  if (loading) {
    return (
      <div className={styles.itemsList}>
        {skeletons}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText size={48} className={styles.emptyIcon} />
        <p>No tienes quizzes aún</p>
      </div>
    );
  }

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

      <div className={styles.itemsList}>
        {items.map((item) => (
          <div
            key={item.id}
            className={styles.itemCard}
            onClick={() =>
              setSelectedForModal({
                ...item,
                type: "quiz",
              })
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedForModal({
                  ...item,
                  type: "quiz",
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
              {item.totalQuestions && (
                <span className={styles.diffBadge}>
                  {item.totalQuestions} preguntas
                </span>
              )}
              {item.difficulty && (
                <span className={styles.diffBadge}>{item.difficulty}</span>
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
