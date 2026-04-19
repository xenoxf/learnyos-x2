import styles from "@/styles/espacio/card.module.css";
import { UnifiedCardData } from "@/types";
import { Skeleton } from "../ui/skeleton";
import { useMemo } from "react";
import { FileText, RefreshCw, Layers, Target, BookOpen } from "lucide-react";

interface CardDeckProps {
  items: UnifiedCardData[];
  selectedForModal: (item: UnifiedCardData) => void;
  loading: boolean;
  deletingId: number;
}

export default function CardDeck({
  items,
  selectedForModal,
  loading,
  deletingId,
}: CardDeckProps) {
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
    return <div className={styles.itemsList}>{skeletons}</div>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText size={48} className={styles.emptyIcon} />
        <p>No tienes elementos aún en esta sección</p>
      </div>
    );
  }

  return (
    <div className={styles.itemsList}>
      {items.map((item) => {
        const length = item.totalQuestions ?? item.totalCards ?? item.contentsCount ?? item.lenght ?? 0;
        const lengthLabel = item.totalQuestions !== undefined ? "preguntas" : 
                           item.totalCards !== undefined ? "tarjetas" : 
                           item.contentsCount !== undefined ? "secciones" : "elementos";

        return (
          <div
            key={item.id}
            className={styles.itemCard}
            onClick={() => selectedForModal(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectedForModal(item);
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
              {length > 0 && (
                <span className={styles.diffBadge}>
                  {length} {lengthLabel}
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
        );
      })}
    </div>
  );
}
