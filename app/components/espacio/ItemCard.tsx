"use client";

import React, { useCallback, useMemo } from "react";
import styles from "./ItemCard.module.css";
import { LucideIcon } from "lucide-react";

interface ItemCardProps {
  title: string;
  description?: string;
  badges?: string[];
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
  testId?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
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
    icon: Icon,
    onClick,
    isLoading = false,
    className,
    testId,
    variant = "default",
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
      () => `${styles.card} ${styles[variant]} ${isLoading ? styles.loading : ""} ${className || ""}`,
      [isLoading, className, variant],
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
          <div className={styles.titleContainer}>
            {Icon && <Icon className={styles.icon} size={18} />}
            <h4 className={styles.title}>{title}</h4>
          </div>
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
              <div className={styles.footerLeft}>
                {footerLeft}
              </div>
            )}
            {footerRight && (
              <div className={styles.footerRight}>{footerRight}</div>
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
    <div className={styles.skeletonHeader}>
      <div className={styles.skeletonIcon} />
      <div className={styles.skeletonTitle} />
    </div>
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
