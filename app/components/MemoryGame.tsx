// components/StrategicMemoryGame.tsx
"use client";
import React, {
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Trophy,
  Brain,
  Clock,
  Zap,
  Star,
  Target,
} from "lucide-react";
import styles from "@/styles/MemoryGame.module.css";

// ============ TYPES ============
interface MemoryCard {
  id: number;
  value: string;
  type: "number" | "pattern" | "symbol";
  isFlipped: boolean;
  isMatched: boolean;
  matchGroup?: number;
}

interface GameState {
  cards: MemoryCard[];
  flippedCards: number[];
  matchedPairs: number;
  moves: number;
  score: number;
  combo: number;
  maxCombo: number;
  gameStarted: boolean;
  gameWon: boolean;
  gameOver: boolean;
  canClick: boolean;
  timeLeft: number;
  difficulty: "easy" | "medium" | "hard";
  patternMemory: string[];
  currentPattern: string;
}

type GameAction =
  | {
      type: "INIT_GAME";
      cards: MemoryCard[];
      difficulty: "easy" | "medium" | "hard";
    }
  | { type: "FLIP_CARD"; cardId: number }
  | { type: "MATCH_CARDS"; matchType: "perfect" | "normal" | "chain" }
  | { type: "RESET_FLIPPED" }
  | { type: "INCREMENT_MOVES" }
  | { type: "UPDATE_SCORE"; points: number }
  | { type: "RESET_COMBO" }
  | { type: "INCREMENT_COMBO" }
  | { type: "SET_CAN_CLICK"; canClick: boolean }
  | { type: "SET_GAME_STARTED" }
  | { type: "TICK_TIMER" }
  | { type: "SET_PATTERN"; pattern: string }
  | { type: "GAME_OVER" };

// ============ CONSTANTS ============
const DIFFICULTY_CONFIG = {
  easy: { pairs: 4, timeLimit: 120, basePoints: 10, patternLength: 3 },
  medium: { pairs: 6, timeLimit: 180, basePoints: 20, patternLength: 4 },
  hard: { pairs: 8, timeLimit: 240, basePoints: 30, patternLength: 5 },
};

const SYMBOLS = ["★", "♦", "♣", "♠", "♥", "●", "■", "▲", "⬟", "⚡"];
const PATTERNS = ["⬤⬤○", "○⬤○", "⬤○⬤", "○○⬤", "⬤⬤⬤", "○⬤⬤"];

const MATCH_DELAY = 200;
const MISMATCH_DELAY = 800;
const COMBO_TIMEOUT = 3000;

// ============ REDUCER ============
const initialState: GameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  gameStarted: false,
  gameWon: false,
  gameOver: false,
  canClick: true,
  timeLeft: 120,
  difficulty: "easy",
  patternMemory: [],
  currentPattern: "",
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
        score: 0,
        combo: 0,
        maxCombo: 0,
        gameStarted: false,
        gameWon: false,
        gameOver: false,
        canClick: true,
        timeLeft: DIFFICULTY_CONFIG[action.difficulty].timeLimit,
        difficulty: action.difficulty,
        patternMemory: [],
        currentPattern: "",
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
      const newCombo = state.combo + 1;
      const comboBonus =
        action.matchType === "perfect"
          ? 2
          : action.matchType === "chain"
            ? 3
            : 1;

      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === first || card.id === second
            ? { ...card, isMatched: true }
            : card,
        ),
        matchedPairs: state.matchedPairs + 1,
        flippedCards: [],
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        canClick: true,
      };
    }

    case "UPDATE_SCORE":
      return {
        ...state,
        score: state.score + action.points,
      };

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
        combo: 0,
        canClick: true,
      };
    }

    case "INCREMENT_MOVES":
      return {
        ...state,
        moves: state.moves + 1,
      };

    case "INCREMENT_COMBO":
      return {
        ...state,
        combo: state.combo + 1,
        maxCombo: Math.max(state.maxCombo, state.combo + 1),
      };

    case "RESET_COMBO":
      return {
        ...state,
        combo: 0,
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

    case "TICK_TIMER":
      const newTime = state.timeLeft - 1;
      return {
        ...state,
        timeLeft: newTime,
        gameOver: newTime <= 0 ? true : state.gameOver,
      };

    case "SET_PATTERN":
      return {
        ...state,
        currentPattern: action.pattern,
        patternMemory: [...state.patternMemory, action.pattern].slice(-3),
      };

    case "GAME_OVER":
      return {
        ...state,
        gameOver: true,
        canClick: false,
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
  isSelected: boolean;
}

const GameCard: React.FC<GameCardProps> = React.memo(
  ({ card, onClick, disabled, isSelected }) => {
    const handleClick = useCallback(() => {
      onClick(card.id);
    }, [card.id, onClick]);

    const cardTypeClass =
      card.type === "number"
        ? styles.numberCard
        : card.type === "pattern"
          ? styles.patternCard
          : styles.symbolCard;

    return (
      <button
        className={`${styles.cardButton} ${isSelected ? styles.selected : ""}`}
        onClick={handleClick}
        disabled={disabled}
        aria-label={`Carta ${card.isFlipped || card.isMatched ? `revelada: ${card.value}` : "oculta"}`}
      >
        <div
          className={`${styles.cardInner} ${card.isFlipped || card.isMatched ? styles.flipped : ""}`}
        >
          <div className={`${styles.cardFront} ${cardTypeClass}`}>
            <span className={styles.patternOverlay} />
            <Brain className={styles.brainIcon} />
          </div>

          <div
            className={`${styles.cardBack} ${card.isMatched ? styles.matchedCard : ""}`}
          >
            {card.type === "pattern" ? (
              <div className={styles.patternContainer}>
                {card.value.split("").map((char, i) => (
                  <span key={i} className={styles.patternChar}>
                    {char}
                  </span>
                ))}
              </div>
            ) : (
              <span className={styles.cardValue}>{card.value}</span>
            )}
          </div>
        </div>
      </button>
    );
  },
);

GameCard.displayName = "GameCard";

interface PatternChallengeProps {
  pattern: string;
  onPatternComplete: () => void;
}

const PatternChallenge: React.FC<PatternChallengeProps> = ({
  pattern,
  onPatternComplete,
}) => {
  useEffect(() => {
    const timer = setTimeout(onPatternComplete, 2000);
    return () => clearTimeout(timer);
  }, [pattern, onPatternComplete]);

  return (
    <div className={styles.patternChallenge}>
      <div className={styles.patternDisplay}>
        {pattern.split("").map((char, i) => (
          <span key={i} className={styles.patternFlash}>
            {char}
          </span>
        ))}
      </div>
      <p className={styles.patternHint}>¡Memoriza este patrón!</p>
    </div>
  );
};

interface GameStatsProps {
  score: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  timeLeft: number;
  combo: number;
  maxCombo: number;
  difficulty: string;
}

const GameStats: React.FC<GameStatsProps> = ({
  score,
  moves,
  matchedPairs,
  totalPairs,
  timeLeft,
  combo,
  maxCombo,
  difficulty,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeColor =
    timeLeft < 30 ? styles.timeWarning : timeLeft < 10 ? styles.timeDanger : "";

  return (
    <div className={styles.statsGrid}>
      <Badge variant="outline" className={styles.statBadge}>
        <Target className={styles.statIcon} />
        {matchedPairs}/{totalPairs}
      </Badge>
      <Badge variant="outline" className={styles.statBadge}>
        <Zap className={styles.statIcon} />
        {moves}
      </Badge>
      <Badge variant="outline" className={styles.statBadge}>
        <Star
          className={`${styles.statIcon} ${combo > 0 ? styles.comboActive : ""}`}
        />
        {combo > 0 ? `x${combo}` : "x1"}
      </Badge>
      <Badge
        variant="outline"
        className={`${styles.statBadge} ${styles.scoreBadge}`}
      >
        🏆 {score}
      </Badge>
      <Badge variant="outline" className={`${styles.statBadge} ${timeColor}`}>
        <Clock className={styles.statIcon} />
        {minutes}:{seconds.toString().padStart(2, "0")}
      </Badge>
      <Badge variant="outline" className={styles.statBadge}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
    </div>
  );
};

interface WinMessageProps {
  score: number;
  moves: number;
  maxCombo: number;
  timeLeft: number;
}

const WinMessage: React.FC<WinMessageProps> = ({
  score,
  moves,
  maxCombo,
  timeLeft,
}) => (
  <div className={styles.winMessage} role="alert">
    <Trophy className={styles.trophyIcon} />
    <div className={styles.winStats}>
      <p className={styles.winTitle}>¡Victoria Estratégica!</p>
      <div className={styles.winDetails}>
        <span>Puntuación: {score}</span>
        <span>Movimientos: {moves}</span>
        <span>Máximo Combo: x{maxCombo}</span>
        <span>Tiempo restante: {timeLeft}s</span>
      </div>
    </div>
  </div>
);

// ============ MAIN COMPONENT ============

export const StrategicMemoryGame: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [showPattern, setShowPattern] = useState(false);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);

  const {
    cards,
    flippedCards,
    matchedPairs,
    moves,
    score,
    combo,
    maxCombo,
    gameStarted,
    gameWon,
    gameOver,
    canClick,
    timeLeft,
    difficulty,
    currentPattern,
  } = state;

  const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;

  // Initialize game
  const initializeGame = useCallback(
    (newDifficulty: "easy" | "medium" | "hard" = difficulty) => {
      const config = DIFFICULTY_CONFIG[newDifficulty];
      const pairs = config.pairs;

      // Generate different types of cards
      const cardValues: MemoryCard[] = [];

      // Numbers (1-4)
      for (let i = 1; i <= Math.min(4, pairs); i++) {
        cardValues.push(
          {
            id: -1,
            value: i.toString(),
            type: "number",
            isFlipped: false,
            isMatched: false,
            matchGroup: i,
          },
          {
            id: -1,
            value: i.toString(),
            type: "number",
            isFlipped: false,
            isMatched: false,
            matchGroup: i,
          },
        );
      }

      // Patterns
      for (let i = 1; i <= Math.min(2, pairs - 4); i++) {
        const pattern = PATTERNS[(i - 1) % PATTERNS.length];
        cardValues.push(
          {
            id: -1,
            value: pattern,
            type: "pattern",
            isFlipped: false,
            isMatched: false,
            matchGroup: 10 + i,
          },
          {
            id: -1,
            value: pattern,
            type: "pattern",
            isFlipped: false,
            isMatched: false,
            matchGroup: 10 + i,
          },
        );
      }

      // Symbols
      for (let i = 1; i <= pairs - cardValues.length / 2; i++) {
        const symbol = SYMBOLS[(i - 1) % SYMBOLS.length];
        cardValues.push(
          {
            id: -1,
            value: symbol,
            type: "symbol",
            isFlipped: false,
            isMatched: false,
            matchGroup: 20 + i,
          },
          {
            id: -1,
            value: symbol,
            type: "symbol",
            isFlipped: false,
            isMatched: false,
            matchGroup: 20 + i,
          },
        );
      }

      // Shuffle and assign IDs
      const shuffledCards = cardValues
        .sort(() => Math.random() - 0.5)
        .map((card, index) => ({ ...card, id: index }));

      dispatch({
        type: "INIT_GAME",
        cards: shuffledCards,
        difficulty: newDifficulty,
      });

      // Show pattern challenge for higher difficulties
      if (newDifficulty !== "easy") {
        const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
        dispatch({ type: "SET_PATTERN", pattern });
        setShowPattern(true);
        setTimeout(() => setShowPattern(false), 3000);
      }
    },
    [difficulty],
  );

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameWon || gameOver) return;

    const timer = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameWon, gameOver]);

  // Check win condition
  useEffect(() => {
    if (matchedPairs === totalPairs && !gameWon && gameStarted) {
      // Win state achieved
    }
  }, [matchedPairs, totalPairs, gameWon, gameStarted]);

  // Handle card matching logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      dispatch({ type: "SET_CAN_CLICK", canClick: false });

      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard?.matchGroup === secondCard?.matchGroup) {
        // Match found
        const matchType =
          firstCard.type === secondCard.type
            ? firstCard.type === "pattern"
              ? "chain"
              : "perfect"
            : "normal";

        // Calculate points
        const basePoints = DIFFICULTY_CONFIG[difficulty].basePoints;
        const comboBonus = combo * 5;
        const timeBonus = Math.floor(timeLeft / 10);
        const totalPoints = basePoints + comboBonus + timeBonus;

        setTimeout(() => {
          dispatch({ type: "MATCH_CARDS", matchType });
          dispatch({ type: "UPDATE_SCORE", points: totalPoints });

          // Reset combo timer
          if (comboTimer) clearTimeout(comboTimer);
          const timer = setTimeout(() => {
            dispatch({ type: "RESET_COMBO" });
          }, COMBO_TIMEOUT);
          setComboTimer(timer);
        }, MATCH_DELAY);
      } else {
        // No match
        setTimeout(() => {
          dispatch({ type: "RESET_FLIPPED" });
        }, MISMATCH_DELAY);
      }

      dispatch({ type: "INCREMENT_MOVES" });
    }

    return () => {
      if (comboTimer) clearTimeout(comboTimer);
    };
  }, [flippedCards, cards, combo, difficulty, timeLeft, comboTimer]);

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (!canClick || gameOver) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;

      if (!gameStarted) {
        dispatch({ type: "SET_GAME_STARTED" });
      }

      dispatch({ type: "FLIP_CARD", cardId });
    },
    [canClick, cards, gameStarted, gameOver],
  );

  const handleDifficultyChange = (
    newDifficulty: "easy" | "medium" | "hard",
  ) => {
    initializeGame(newDifficulty);
  };

  // Memoize cards grid
  const cardsGrid = useMemo(
    () => (
      <div className={styles.cardsGrid}>
        {cards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            onClick={handleCardClick}
            disabled={!canClick || card.isFlipped || card.isMatched || gameOver}
            isSelected={flippedCards.includes(card.id)}
          />
        ))}
      </div>
    ),
    [cards, canClick, flippedCards, handleCardClick, gameOver],
  );

  return (
    <Card className={styles.container}>
      <CardHeader className={styles.header}>
        <div className={styles.headerTop}>
          <CardTitle className={styles.title}>
            <div className={styles.titleIcon}>
              <Brain className={styles.brainIcon} />
            </div>
            Memoria Estratégica
          </CardTitle>
          <div className={styles.controls}>
            <div className={styles.difficultySelector}>
              {(["easy", "medium", "hard"] as const).map((d) => (
                <Button
                  key={d}
                  variant={difficulty === d ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleDifficultyChange(d)}
                  className={styles.difficultyButton}
                >
                  {d === "easy"
                    ? "Fácil"
                    : d === "medium"
                      ? "Medio"
                      : "Difícil"}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => initializeGame()}
              className={styles.resetButton}
              aria-label="Reiniciar juego"
            >
              <RotateCcw className={styles.resetIcon} />
            </Button>
          </div>
        </div>

        <GameStats
          score={score}
          moves={moves}
          matchedPairs={matchedPairs}
          totalPairs={totalPairs}
          timeLeft={timeLeft}
          combo={combo}
          maxCombo={maxCombo}
          difficulty={difficulty}
        />
      </CardHeader>

      <CardContent className={styles.content}>
        {showPattern && currentPattern && (
          <PatternChallenge
            pattern={currentPattern}
            onPatternComplete={() => setShowPattern(false)}
          />
        )}

        {gameWon && (
          <WinMessage
            score={score}
            moves={moves}
            maxCombo={maxCombo}
            timeLeft={timeLeft}
          />
        )}

        {gameOver && !gameWon && (
          <div className={styles.gameOver}>
            <span className={styles.gameOverIcon}>⏰</span>
            <p>¡Tiempo agotado!</p>
          </div>
        )}

        {cardsGrid}

        {!gameStarted && !showPattern && (
          <p className={styles.startHint}>
            Haz clic en cualquier carta para comenzar
          </p>
        )}
      </CardContent>
    </Card>
  );
};
