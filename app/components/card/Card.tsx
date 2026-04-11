"use client";

import React, { useState, useCallback } from "react";
import { Trash2, Tag, BookOpen, Heart, User } from "lucide-react";
import { apiService } from "@/services/apiService";
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/flashCards/card.module.css";
import type { CardsDeck } from "@/types";

interface CardProps {
  card: CardsDeck & { canDelete?: boolean };
  onCardDeleted?: () => void;
  onOpen: () => void;
  isEspacio?: boolean;
  onShowOptions?: () => void;
}

const CardContent: React.FC<CardProps> = ({ card, onCardDeleted, onOpen, isEspacio, onShowOptions }) => {
  ;
  const [likesCount, setLikesCount] = useState(card.likesCount || 0);
  const [userLiked, setUserLiked] = useState(card.userLiked || false);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = card.canDelete ?? false;

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOwner) {
      toast.error("No permitido", "Solo puedes eliminar tus propios mazos");
      return;
    }
  }, [isOwner]);

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    try {
      setIsLiking(true);
      const result = await apiService.toggleFlashcardLike(card.id);
      setLikesCount(result.count);
      setUserLiked(result.liked);
    } catch {
      // Silent fail for likes
    } finally {
      setIsLiking(false);
    }
  }, [card.id, isLiking]);

  const handleOpen = useCallback(() => {
    if (isEspacio && onShowOptions) {
      onShowOptions();
    } else {
      onOpen();
    }
  }, [isEspacio, onShowOptions, onOpen]);

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpen();
        }
      }}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{card.title}</h3>
        {isOwner && !isEspacio && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            title="Eliminar mazo"
            aria-label="Eliminar mazo"
            type="button"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <p className={styles.cardDescription}>
        {card.description || "Sin descripción"}
      </p>

      <div className={styles.cardMeta}>
        {(card.area || card.tema) && (
          <span className={styles.cardHint}>
            {card.area && <><Tag size={14} style={{ marginRight: "3px", verticalAlign: "middle" }} />Área: {card.area}</>}
            {card.area && card.tema && <br />}
            {card.tema && <><BookOpen size={14} style={{ marginRight: "3px", verticalAlign: "middle" }} />Tema: {card.tema}</>}
          </span>
        )}
        <span className={styles.cardHint}>{card.totalCards} tarjetas</span>
      </div>

      <div className={styles.cardCreator}>
        <User size={12} />
        <span>{card.creatorName}</span>
      </div>

      <div className={styles.cardFooter}>
        {!isOwner && (
          <button
            className={`${styles.likeBtn} ${userLiked ? styles.likeBtnActive : ""}`}
            onClick={handleLike}
            disabled={isLiking}
            title="Me gusta"
            aria-label="Me gusta"
            type="button"
          >
            <Heart size={14} fill={userLiked ? "currentColor" : "none"} />
            <span>{likesCount}</span>
          </button>
        )}
        {isOwner && (
          <span className={styles.cardLikesCount}>
            <Heart size={14} fill="currentColor" />
            <span>{likesCount}</span>
          </span>
        )}
        {isOwner && card.code && (
          <span className={styles.cardCode}>{card.code}</span>
        )}
      </div>
    </div>
  );
};

export default React.memo(CardContent);
