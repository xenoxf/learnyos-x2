"use client";

import React, { useCallback, useMemo } from "react";
import styles from "./ItemCard.module.css";

interface ItemCardProps {
  title: string;
  description?: string;
  badges?: string[];
  footerLeft?: string;
  footerRight?: string;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
  testId?: string;
}

/**
 * ItemCard - Componente reutilizable para mostrar tarjetas de items
 * Soporta estados de carga, accesibilidad mejorada y performance optimizado
 */
export const ItemCard = React.memo<ItemCardProps>(
  ({
    title,
    description,
    badges = [],
    footerLeft,
    footerRight,
    onClick,
    isLoading = false,
    className,
    testId,
  }) => {
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!isLoading && onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      },
      [isLoading, onClick],
    );

    const cardClass = useMemo(
      () => `${styles.card} ${isLoading ? styles.loading : ""} ${className || ""}`,
      [isLoading, className],
    );

    const hasFooter = footerLeft || footerRight;

    return (
      <article
        className={cardClass}
        onClick={!isLoading ? onClick : undefined}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-disabled={isLoading}
        aria-label={title}
        data-testid={testId}
      >
        <div className={styles.header}>
          <h4 className={styles.title}>{title}</h4>
        </div>

        <p className={styles.description}>
          {description || "Sin descripción"}
        </p>

        {badges.length > 0 && (
          <div className={styles.meta} role="list">
            {badges.map((badge) => (
              <span key={badge} className={styles.badge} role="listitem">
                {badge}
              </span>
            ))}
          </div>
        )}

        {hasFooter && (
          <footer className={styles.footer}>
            {footerLeft && (
              <span className={styles.footerLeft} title={footerLeft}>
                {footerLeft}
              </span>
            )}
            {footerRight && (
              <span className={styles.footerRight}>{footerRight}</span>
            )}
          </footer>
        )}
      </article>
    );
  },
);

ItemCard.displayName = "ItemCard";

/**
 * ItemCardSkeleton - Componente de esqueleto para carga
 */
export const ItemCardSkeleton = React.memo(() => (
  <div className={`${styles.card} ${styles.skeleton}`} aria-busy="true">
    <div className={styles.skeletonTitle} />
    <div className={styles.skeletonDescription} />
    <div className={styles.skeletonDescriptionShort} />
    <div className={styles.skeletonBadges}>
      <div className={styles.skeletonBadge} />
      <div className={styles.skeletonBadge} />
    </div>
    <div className={styles.skeletonFooter} />
  </div>
));

ItemCardSkeleton.displayName = "ItemCardSkeleton";
