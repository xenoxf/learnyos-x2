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

export const ItemCard = React.memo<ItemCardProps>(({
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
    [isLoading, onClick]
  );

  const cardClass = useMemo(
    () =>
      [
        styles.card,
        styles[variant],
        isLoading ? styles.loading : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" "),
    [isLoading, className, variant]
  );

  const hasFooter = footerLeft || footerRight;

  return (
    <article
      className={cardClass}
      onClick={!isLoading ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : "article"}
      tabIndex={onClick && !isLoading ? 0 : undefined}
      aria-disabled={isLoading || undefined}
      aria-label={title}
      data-testid={testId}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          {Icon && (
            <div className={styles.iconWrap} data-variant={variant}>
              <Icon size={16} aria-hidden="true" />
            </div>
          )}
          <h4 className={styles.title}>{title}</h4>
        </div>

        {(description || !isLoading) && (
          <p className={styles.description}>
            {description ?? "Sin descripción"}
          </p>
        )}

        {badges.length > 0 && (
          <div className={styles.badges} role="list">
            {badges.map((badge) => (
              <span key={badge} className={styles.badge} role="listitem">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {hasFooter && (
        <footer className={styles.footer}>
          {footerLeft && (
            <div className={styles.footerLeft}>{footerLeft}</div>
          )}
          {footerRight && (
            <div className={styles.footerRight}>{footerRight}</div>
          )}
        </footer>
      )}
    </article>
  );
});
ItemCard.displayName = "ItemCard";

export const ItemCardSkeleton = React.memo(() => (
  <div className={`${styles.card} ${styles.skeleton}`} aria-busy="true" aria-label="Cargando...">
    <div className={styles.body}>
      <div className={styles.header}>
        <div className={`${styles.skLine} ${styles.skIcon}`} />
        <div className={`${styles.skLine} ${styles.skTitle}`} />
      </div>
      <div className={styles.skDesc}>
        <div className={`${styles.skLine} ${styles.skDescFull}`} />
        <div className={`${styles.skLine} ${styles.skDescShort}`} />
      </div>
      <div className={styles.badges}>
        <div className={`${styles.skLine} ${styles.skBadge}`} />
        <div className={`${styles.skLine} ${styles.skBadge}`} />
      </div>
    </div>
    <div className={styles.footer}>
      <div className={`${styles.skLine} ${styles.skFooterLeft}`} />
      <div className={`${styles.skLine} ${styles.skFooterRight}`} />
    </div>
  </div>
));
ItemCardSkeleton.displayName = "ItemCardSkeleton";
