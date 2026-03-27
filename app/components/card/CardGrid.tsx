import React, { useEffect, useState, useCallback, useMemo } from "react";
import CardContent from "./Card";
import styles from "@/styles/flashCards/cardGrid.module.css";
import type { Card } from "@/types";
import { Input } from "../ui/input";
import { apiService } from "@/services/apiService";
import { Filter, Pyramid, Plus, Globe, Lock } from "lucide-react";
import { Button } from "../ui/button";
import CrearCard from "./CrearCard";

interface CardGridProps {
  onCardSelect?: (cardId: number) => void;
}

export default function CardGrid({ onCardSelect }: CardGridProps) {
  const [inputChangeValue, setInputChangeValue] = useState("");
  const [cards, setCards] = useState<(Card & { canDelete?: boolean })[]>([]);
  const [allCards, setAllCards] = useState<(Card & { canDelete?: boolean })[]>(
    [],
  );
  const [modalCrear, setModalCrear] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"private" | "public">("private");

  const filterCards = useCallback(
    (cardsToFilter: (Card & { canDelete?: boolean })[], searchTerm: string) => {
      const searchLower = searchTerm.toLowerCase();
      const filtered = cardsToFilter.filter(
        (card) =>
          card.title.toLowerCase().includes(searchLower) ||
          (card.description &&
            card.description.toLowerCase().includes(searchLower)),
      );
      setCards(filtered);
    },
    [],
  );

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const userId = apiService.getUser()?.id;
      const fetchedCards =
        viewMode === "private"
          ? await apiService.getFlashcardsPrivate()
          : await apiService.getFlashcardsPublic();
      const validCards = (fetchedCards || []).filter(
        (card: any) => card.id && card.title,
      ) as (Card & { canDelete?: boolean })[];
      const cardsWithOwnership = validCards.map((c) => ({
        ...c,
        canDelete: Boolean(userId && c.userId && c.userId === userId),
      }));
      setAllCards(cardsWithOwnership);
      filterCards(cardsWithOwnership, inputChangeValue);
    } catch (err) {
      console.error("Error loading cards:", err);
      setAllCards([]);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [filterCards, inputChangeValue, viewMode]);

  const handleCardCreated = useCallback(async () => {
    await loadCards();
  }, [loadCards]);

  const handleCardOpen = useCallback(
    (card: Card & { canDelete?: boolean }) => {
      onCardSelect?.(card.id);
    },
    [onCardSelect],
  );

  const resultText = useMemo(() => {
    if (allCards.length === 0) {
      return viewMode === "private"
        ? "No tienes mazos privados todavía. Crea uno para comenzar."
        : "Aún no hay mazos públicos disponibles.";
    }
    return "No se encontraron mazos con esa búsqueda";
  }, [allCards.length, viewMode]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    filterCards(allCards, inputChangeValue);
  }, [inputChangeValue, allCards, filterCards]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.viewTabs}>
              <button
                type="button"
                className={`${styles.viewTab} ${viewMode === "private" ? styles.viewTabActive : ""}`}
                onClick={() => setViewMode("private")}
              >
                <Lock size={16} /> Privados
              </button>
              <button
                type="button"
                className={`${styles.viewTab} ${viewMode === "public" ? styles.viewTabActive : ""}`}
                onClick={() => setViewMode("public")}
              >
                <Globe size={16} /> Publicos
              </button>
            </div>
            <div className={styles.searchSection}>
            <Input
              className={styles.searchInput}
              placeholder="Busca un mazo..."
              value={inputChangeValue}
              onChange={(e) => setInputChangeValue(e.target.value)}
            />
            <button className={styles.filterBtn} title="Filtrar">
              <Filter size={20} />
            </button>
            <button className={styles.sortBtn} title="Ordenar">
              <Pyramid size={20} />
            </button>
          </div>
          </div>
          <Button
            onClick={() => setModalCrear(true)}
            className={styles.createBtn}
          >
            <Plus size={20} />
            Crear Mazo
          </Button>
        </div>

        <div className={styles.gridContainer}>
          {loading ? (
            <div className={styles.loadingState}>
              <p>Cargando mazos...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{resultText}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {cards.map((card) => (
                <CardContent
                  key={card.id}
                  card={card}
                  onCardDeleted={handleCardCreated}
                  onOpen={() => handleCardOpen(card)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {modalCrear && (
        <CrearCard
          onClose={() => setModalCrear(false)}
          onCardCreated={handleCardCreated}
        />
      )}
    </>
  );
}
