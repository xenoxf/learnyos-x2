import React, { useState } from "react";
import { Trash2, Tag, BookOpen } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/flashCards/card.module.css";
import type { Card } from "@/types";

interface CardProps {
  card: Card & { canDelete?: boolean };
  onCardDeleted?: () => void;
  onOpen: () => void;
}

const CardContent: React.FC<CardProps> = ({ card, onCardDeleted, onOpen }) => {
  const { toast } = useToast();

  const isOwner = card.canDelete ?? false;

  const handleDelete = async () => {
    if (!isOwner) {
      toast({
        variant: "destructive",
        title: "No permitido",
        description: "Solo puedes eliminar tus propios mazos",
      });
      return;
    }

    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar este mazo? Esta acción no se puede deshacer.",
    );
    if (confirm) {
      try {
        await apiService.deleteCard(card.id);
        toast({
          title: "Éxito",
          description: "Mazo eliminado correctamente",
        });
        if (onCardDeleted) {
          onCardDeleted();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al eliminar mazo";
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      }
    }
  };

  const handleOpen = async () => {
    try {
      onOpen();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    }
  };

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
        {isOwner && (
          <button
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
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

      {/* Información del mazo */}
      <div className={styles.cardMeta}>
        {card.area && (
          <span className={styles.cardHint}>
            <Tag
              size={14}
              style={{ marginRight: "4px", verticalAlign: "middle" }}
            />
            {card.area}
          </span>
        )}
        {card.tema && (
          <span className={styles.cardHint}>
            <BookOpen
              size={14}
              style={{ marginRight: "4px", verticalAlign: "middle" }}
            />
            {card.tema}
          </span>
        )}
        <span className={styles.cardHint}>{card.totalCards} tarjetas</span>
      </div>

      {/* Solo mostrar el code si es el dueño */}
      <div className={styles.cardFooter}>
        {isOwner && card.code ? (
          <span className={styles.cardCode}>{card.code}</span>
        ) : null}
      </div>
    </div>
  );
};

export default CardContent;
