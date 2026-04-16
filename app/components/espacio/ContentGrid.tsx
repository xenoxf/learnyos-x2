import React from "react";
import styles from "./ContentGrid.module.css";
import { ItemCardSkeleton } from "./ItemCard";

interface ContentGridProps {
  children: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  children,
  loading,
  empty,
  emptyMessage = "No se encontraron elementos",
  emptyIcon,
}) => {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (empty) {
    return (
      <div className={styles.empty}>
        {emptyIcon && <div className={styles.emptyIcon}>{emptyIcon}</div>}
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <div className={styles.grid}>{children}</div>;
};
