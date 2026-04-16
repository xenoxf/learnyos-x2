import React from "react";
import styles from "./ItemCard.module.css";

interface ItemCardProps {
  title: string;
  description?: string;
  badges?: string[];
  footerLeft?: string;
  footerRight?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  title,
  description,
  badges = [],
  footerLeft,
  footerRight,
  onClick,
  isLoading,
}) => {
  return (
    <div
      className={`${styles.card} ${isLoading ? styles.loading : ""}`}
      onClick={!isLoading ? onClick : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!isLoading && onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.header}>
        <h4 className={styles.title}>{title}</h4>
      </div>
      <p className={styles.description}>{description || "Sin descripción"}</p>
      <div className={styles.meta}>
        {badges.map((badge, index) => (
          <span key={index} className={styles.badge}>
            {badge}
          </span>
        ))}
      </div>
      {(footerLeft || footerRight) && (
        <div className={styles.footer}>
          <span className={styles.footerLeft}>{footerLeft}</span>
          {footerRight && <span className={styles.footerRight}>{footerRight}</span>}
        </div>
      )}
    </div>
  );
};

export const ItemCardSkeleton: React.FC = () => (
  <div className={`${styles.card} ${styles.skeleton}`}>
    <div className={styles.skeletonTitle} />
    <div className={styles.skeletonDescription} />
    <div className={styles.skeletonDescriptionShort} />
    <div className={styles.skeletonBadges}>
      <div className={styles.skeletonBadge} />
      <div className={styles.skeletonBadge} />
    </div>
    <div className={styles.skeletonFooter} />
  </div>
);
