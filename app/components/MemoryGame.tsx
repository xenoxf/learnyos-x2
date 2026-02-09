"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Trophy, Sparkles } from "lucide-react";
import styles from "@/styles/MemoryGame.module.css";

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [canClick, setCanClick] = useState(true);

  const emojis = ["🎯", "🧠", "📚", "🔬", "💡", "🎨"];

  // Memoized initialization
  const initializeGame = useCallback(() => {
    const shuffledEmojis = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledEmojis);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStarted(false);
    setGameWon(false);
    setCanClick(true);
  }, [emojis]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Check for win condition
  useEffect(() => {
    if (matchedPairs === emojis.length) {
      setGameWon(true);
    }
  }, [matchedPairs, emojis.length]);

  // Handle card matching logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      setCanClick(false);
      const [first, second] = flippedCards;

      if (cards[first].emoji === cards[second].emoji) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card,
            ),
          );
          setMatchedPairs((prev) => prev + 1);
          setFlippedCards([]);
          setCanClick(true);
        }, 300);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card,
            ),
          );
          setFlippedCards([]);
          setCanClick(true);
        }, 1000);
      }
      setMoves((prev) => prev + 1);
    }
  }, [flippedCards, cards]);

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (!canClick) return;
      if (cards[cardId].isFlipped || cards[cardId].isMatched) return;

      if (!gameStarted) setGameStarted(true);

      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, isFlipped: true } : card,
        ),
      );
      setFlippedCards((prev) => [...prev, cardId]);
    },
    [canClick, cards, gameStarted],
  );

  return (
    <Card className={styles.container}>
      <CardHeader className={styles.header}>
        <div className={styles.headerTop}>
          <CardTitle className={styles.title}>
            <div className={styles.titleIcon}>
              <Sparkles className={styles.sparkleIcon} />
            </div>
            Memoria
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={initializeGame}
            className={styles.resetButton}
            aria-label="Reiniciar juego"
          >
            <RotateCcw className={styles.resetIcon} />
          </Button>
        </div>
        <div className={styles.stats}>
          <Badge variant="secondary" className={styles.movesBadge}>
            Mov: {moves}
          </Badge>
          <Badge variant="secondary" className={styles.pairsBadge}>
            {matchedPairs}/{emojis.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={styles.content}>
        {gameWon && (
          <div className={styles.winMessage} role="alert" aria-live="polite">
            <Trophy className={styles.trophyIcon} aria-hidden="true" />
            <p className={styles.winText}>¡Ganaste en {moves} movimientos!</p>
          </div>
        )}

        <div className={styles.cardsGrid}>
          {cards.map((card) => (
            <button
              key={card.id}
              className={styles.cardButton}
              onClick={() => handleCardClick(card.id)}
              disabled={!canClick || card.isFlipped || card.isMatched}
              aria-label={`Carta ${card.isFlipped || card.isMatched ? `revelada: ${card.emoji}` : "oculta"}`}
              aria-pressed={card.isFlipped || card.isMatched}
            >
              <div
                className={`${styles.cardInner} ${card.isFlipped || card.isMatched ? styles.flipped : ""}`}
              >
                {/* Front - Hidden */}
                <div className={styles.cardFront}>
                  <span className={styles.questionMark} aria-hidden="true">
                    ?
                  </span>
                </div>

                {/* Back - Revealed */}
                <div
                  className={`${styles.cardBack} ${card.isMatched ? styles.matchedCard : ""}`}
                >
                  <span className={styles.emoji} aria-hidden="true">
                    {card.emoji}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {!gameStarted && (
          <p className={styles.startHint}>
            Haz clic en una carta para comenzar
          </p>
        )}
      </CardContent>
    </Card>
  );
};
