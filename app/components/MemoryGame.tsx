"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const emojis = ['🎯', '🧠', '📚', '🔬', '💡', '🎨'];

  const initializeGame = () => {
    const shuffledEmojis = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledEmojis);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStarted(false);
    setGameWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (matchedPairs === emojis.length) {
      setGameWon(true);
    }
  }, [matchedPairs]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prev => prev.map(card => 
          card.id === first || card.id === second
            ? { ...card, isMatched: true }
            : card
        ));
        setMatchedPairs(prev => prev + 1);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) setGameStarted(true);
    
    if (flippedCards.length === 2) return;
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return;

    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));
    setFlippedCards(prev => [...prev, cardId]);
  };

  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-card-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            Memoria
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={initializeGame}
            className="h-8 w-8 p-0 hover:bg-primary/10 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
            Mov: {moves}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 border-0">
            {matchedPairs}/{emojis.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {gameWon && (
          <div className="text-center mb-3 p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 animate-scale-in">
            <Trophy className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-emerald-600 font-semibold text-sm">
              ¡Ganaste en {moves} movimientos!
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flip-card aspect-square cursor-pointer"
              onClick={() => handleCardClick(card.id)}
            >
              <div className={cn(
                "flip-card-inner w-full h-full relative",
                (card.isFlipped || card.isMatched) && "flipped"
              )}
              style={{
                transition: 'transform 0.6s',
                transformStyle: 'preserve-3d',
                transform: (card.isFlipped || card.isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
              >
                {/* Front - Hidden */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-xl flex items-center justify-center text-xl font-bold",
                    "bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50",
                    "hover:from-primary/30 hover:to-secondary/30 hover:scale-105 transition-all duration-300",
                    "backface-hidden"
                  )}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-muted-foreground">?</span>
                </div>
                
                {/* Back - Revealed */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-xl flex items-center justify-center text-xl",
                    "bg-gradient-to-br from-primary/10 to-secondary/10 border-2",
                    card.isMatched 
                      ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                      : "border-primary/30",
                    "backface-hidden"
                  )}
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  {card.emoji}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!gameStarted && (
          <p className="text-center text-muted-foreground text-xs mt-3 animate-pulse">
            Haz clic en una carta para comenzar
          </p>
        )}
      </CardContent>
    </Card>
  );
};
