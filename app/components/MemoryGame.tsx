// components/MemoryGame.tsx
"use client";
import React, { useReducer, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Trophy, Sparkles } from "lucide-react";
import styles from "@/styles/MemoryGame.module.css";

// ============ TYPES ============
interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameState {
  cards: MemoryCard[];
  flippedCards: number[];
  matchedPairs: number;
  moves: number;
  gameStarted: boolean;
  gameWon: boolean;
  canClick: boolean;
}

type GameAction =
  | { type: "INIT_GAME"; cards: MemoryCard[] }
  | { type: "FLIP_CARD"; cardId: number }
  | { type: "MATCH_CARDS" }
  | { type: "RESET_FLIPPED" }
  | { type: "INCREMENT_MOVES" }
  | { type: "SET_CAN_CLICK"; canClick: boolean }
  | { type: "SET_GAME_STARTED" };

// ============ CONSTANTS ============
const EMOJIS = ["🎯", "🧠", "📚", "🔬", "💡", "🎨"] as const;
const MATCH_DELAY = 300;
const MISMATCH_DELAY = 1000;

// ============ REDUCER ============
const initialState: GameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  gameStarted: false,
  gameWon: false,
  canClick: true,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "INIT_GAME":
      return {
        ...state,
        cards: action.cards,
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        gameStarted: false,
        gameWon: false,
        canClick: true,
      };

    case "FLIP_CARD":
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.cardId ? { ...card, isFlipped: true } : card,
        ),
        flippedCards: [...state.flippedCards, action.cardId],
      };

    case "MATCH_CARDS": {
      const [first, second] = state.flippedCards;
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === first || card.id === second
            ? { ...card, isMatched: true }
            : card,
        ),
        matchedPairs: state.matchedPairs + 1,
        flippedCards: [],
        canClick: true,
      };
    }

    case "RESET_FLIPPED": {
      const [first, second] = state.flippedCards;
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === first || card.id === second
            ? { ...card, isFlipped: false }
            : card,
        ),
        flippedCards: [],
        canClick: true,
      };
    }

    case "INCREMENT_MOVES":
      return {
        ...state,
        moves: state.moves + 1,
      };

    case "SET_CAN_CLICK":
      return {
        ...state,
        canClick: action.canClick,
      };

    case "SET_GAME_STARTED":
      return {
        ...state,
        gameStarted: true,
      };

    default:
      return state;
  }
};

// ============ SUBCOMPONENTS ============

interface GameCardProps {
  card: MemoryCard;
  onClick: (id: number) => void;
  disabled: boolean;
}

const GameCard: React.FC<GameCardProps> = React.memo(
  ({ card, onClick, disabled }) => {
    const handleClick = useCallback(() => {
      onClick(card.id);
    }, [card.id, onClick]);

    return (
      <button
        className={styles.cardButton}
        onClick={handleClick}
        disabled={disabled}
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
    );
  },
);

GameCard.displayName = "GameCard";

interface WinMessageProps {
  moves: number;
}

const WinMessage: React.FC<WinMessageProps> = ({ moves }) => (
  <div className={styles.winMessage} role="alert" aria-live="polite">
    <Trophy className={styles.trophyIcon} aria-hidden="true" />
    <p className={styles.winText}>¡Ganaste en {moves} movimientos!</p>
  </div>
);

interface StatsProps {
  moves: number;
  matchedPairs: number;
  totalPairs: number;
}

const Stats: React.FC<StatsProps> = ({ moves, matchedPairs, totalPairs }) => (
  <div className={styles.stats}>
    <Badge variant="secondary" className={styles.movesBadge}>
      Mov: {moves}
    </Badge>
    <Badge variant="secondary" className={styles.pairsBadge}>
      {matchedPairs}/{totalPairs}
    </Badge>
  </div>
);

// ============ MAIN COMPONENT ============

export const MemoryGame: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const {
    cards,
    flippedCards,
    matchedPairs,
    moves,
    gameStarted,
    gameWon,
    canClick,
  } = state;

  // Memoized initialization
  const initializeGame = useCallback(() => {
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    dispatch({ type: "INIT_GAME", cards: shuffledEmojis });
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Check for win condition
  useEffect(() => {
    if (matchedPairs === EMOJIS.length) {
      // El estado gameWon se maneja implícitamente
    }
  }, [matchedPairs]);

  // Handle card matching logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      dispatch({ type: "SET_CAN_CLICK", canClick: false });

      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setTimeout(() => {
          dispatch({ type: "MATCH_CARDS" });
        }, MATCH_DELAY);
      } else {
        // No match - flip back
        setTimeout(() => {
          dispatch({ type: "RESET_FLIPPED" });
        }, MISMATCH_DELAY);
      }

      dispatch({ type: "INCREMENT_MOVES" });
    }
  }, [flippedCards, cards]);

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (!canClick) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;

      if (!gameStarted) {
        dispatch({ type: "SET_GAME_STARTED" });
      }

      dispatch({ type: "FLIP_CARD", cardId });
    },
    [canClick, cards, gameStarted],
  );

  // Memoize cards grid to prevent unnecessary re-renders
  const cardsGrid = useMemo(
    () => (
      <div className={styles.cardsGrid}>
        {cards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            onClick={handleCardClick}
            disabled={!canClick || card.isFlipped || card.isMatched}
          />
        ))}
      </div>
    ),
    [cards, canClick, handleCardClick],
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
        <Stats
          moves={moves}
          matchedPairs={matchedPairs}
          totalPairs={EMOJIS.length}
        />
      </CardHeader>

      <CardContent className={styles.content}>
        {gameWon && <WinMessage moves={moves} />}

        {cardsGrid}

        {!gameStarted && (
          <p className={styles.startHint}>
            Haz clic en una carta para comenzar
          </p>
        )}
      </CardContent>
    </Card>
  );
};
