"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TarotCard } from "./tarot-card";
import { Spread, DrawnCard, TarotCard as TarotCardType } from "@/types";

interface SpreadLayoutProps {
  spread: Spread;
  drawnCards: DrawnCard[];
  cards: TarotCardType[];
  revealedCards: number[];
  onCardClick?: (position: number) => void;
}

export function SpreadLayout({
  spread,
  drawnCards,
  cards,
  revealedCards,
  onCardClick,
}: SpreadLayoutProps) {
  const getLayoutClass = () => {
    switch (spread.id) {
      case "daily":
        return "flex justify-center";
      case "three-card":
        return "flex justify-center gap-4 md:gap-8";
      case "love-pyramid":
        return "flex flex-col items-center gap-4";
      case "choice":
        return "grid grid-cols-3 md:grid-cols-4 gap-4";
      case "celtic-cross":
        return "grid grid-cols-3 md:grid-cols-4 gap-3";
      default:
        return "flex flex-wrap justify-center gap-4";
    }
  };

  const getCardSize = () => {
    switch (spread.id) {
      case "daily":
        return "lg";
      case "three-card":
        return "md";
      case "love-pyramid":
        return "md";
      case "choice":
        return "sm";
      case "celtic-cross":
        return "sm";
      default:
        return "md";
    }
  };

  const renderLovePyramid = () => {
    const positions = [
      { index: 0, className: "self-center" },
      { index: 1, className: "self-center -mt-4" },
      { index: 2, className: "self-center -mt-4" },
      { index: 3, className: "self-center -mt-4" },
      { index: 4, className: "self-center -mt-4" },
    ];

    return (
      <div className="flex flex-col items-center gap-2">
        {/* Top card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {renderCard(0)}
        </motion.div>

        {/* Middle row */}
        <div className="flex gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {renderCard(1)}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {renderCard(2)}
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="flex gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {renderCard(3)}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {renderCard(4)}
          </motion.div>
        </div>
      </div>
    );
  };

  const renderCard = (position: number) => {
    const drawnCard = drawnCards.find((dc) => dc.position === position);
    if (!drawnCard) return null;

    const card = cards.find((c) => c.id === drawnCard.cardId);
    if (!card) return null;

    const isRevealed = revealedCards.includes(position);
    const positionInfo = spread.positions[position];

    return (
      <div className="flex flex-col items-center gap-2">
        <TarotCard
          card={card}
          isReversed={drawnCard.isReversed}
          isRevealed={isRevealed}
          onClick={() => onCardClick?.(position)}
          size={getCardSize() as "sm" | "md" | "lg"}
        />
        <div className="text-center">
          <div className="text-tarot-gold text-xs font-medium">
            {positionInfo?.name}
          </div>
          <div className="text-tarot-light/40 text-xs">
            {positionInfo?.nameCn}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("p-4", getLayoutClass())}>
      {spread.id === "love-pyramid" ? (
        renderLovePyramid()
      ) : (
        <>
          {spread.positions.map((pos, i) => (
            <motion.div
              key={pos.index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {renderCard(pos.index)}
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}
