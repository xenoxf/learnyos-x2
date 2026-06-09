"use client";

import React, { useState, useCallback } from "react";
import {
  Trash2,
  User,
  ArrowRight,
  BookmarkPlus,
  BookmarkCheck,
  Layers,
} from "lucide-react";
import styles from "@/styles/quiz/quizCard.module.css"; // Reuse premium styles
import type { CardsDeck } from "@/types";
import { LikeButton } from "@/components/common/LikeButton";

interface CardProps {
  card: CardsDeck & { canDelete?: boolean };
  onCardDeleted?: () => void;
  onOpen: () => void;
  isEspacio?: boolean;
  onShowOptions?: () => void;
}

const CardContent: React.FC<CardProps> = ({
  card,
  onOpen,
  isEspacio,
  onShowOptions,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isOwner = card.canDelete ?? false;

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOwner) return;
    },
    [isOwner],
  );

  const handleOpen = useCallback(() => {
    if (isEspacio && onShowOptions) {
      onShowOptions();
    } else {
      onOpen();
    }
  }, [isEspacio, onShowOptions, onOpen]);

  return (
    <>
      <div
        className={`${styles.card} ${styles["card--blue"]}`}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`${styles.cardAccent} ${styles["accent--blue"]}`} />

        <div className={styles.cardHeader}>
          <div className={styles.typeRow}>
            <span className={`${styles.typeBadge} ${styles["typeBadge--blue"]}`}>
              <Layers size={15} />
              Mazo Flashcards
            </span>
          </div>

          <h3 className={styles.cardTitle}>{card.title}</h3>
        </div>

        {card.description && (
          <p className={styles.cardDescription}>
            {card.description}
          </p>
        )}

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <Layers size={15} />
            <span>{card.totalCards} <small>tarjetas</small></span>
          </div>
        </div>

        {(card.area || card.tema) && (
          <div className={styles.tagsRow}>
            {card.tema && (
              <span className={styles.tagItem}>
                <BookmarkCheck size={13} />
                {card.tema}
              </span>
            )}
            {card.area && (
              <span className={styles.tagItem}>
                <BookmarkPlus size={13} />
                {card.area}
              </span>
            )}
          </div>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.cardCreator}>
              <User size={13} />
              {card.creatorName}
            </span>
          </div>

          <div className={styles.footerRight}>
            <LikeButton 
              id={card.id} 
              type="flashcard" 
              initialLikes={card.likesCount} 
              initialLiked={card.userLiked} 
              isOwner={isOwner}
            />

            <div className={`${styles.ctaArrow} ${isHovered ? styles.ctaArrowVisible : ""}`}>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {isOwner && !isEspacio && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </>
  );
};

export default React.memo(CardContent);
