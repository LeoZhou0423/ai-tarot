"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TarotCard as TarotCardType } from "@/types";

interface TarotCardProps {
  card: TarotCardType;
  isReversed?: boolean;
  isRevealed?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TarotCard({
  card,
  isReversed = false,
  isRevealed = false,
  isSelected = false,
  onClick,
  size = "md",
  className,
}: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const sizeClasses = {
    sm: "w-20 h-32",
    md: "w-32 h-48",
    lg: "w-48 h-72",
  };

  const handleClick = () => {
    if (!isRevealed) {
      setIsFlipped(true);
    }
    onClick?.();
  };

  return (
    <motion.div
      className={cn(
        "relative cursor-pointer perspective-1000",
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
      whileHover={!isRevealed ? { scale: 1.05, y: -5 } : undefined}
      whileTap={!isRevealed ? { scale: 0.95 } : undefined}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-transform duration-600"
        initial={false}
        animate={{ rotateY: isFlipped || isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Card Back */}
        <div className="absolute inset-0 backface-hidden">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-tarot-purple via-tarot-dark to-tarot-indigo border-2 border-tarot-gold/30 shadow-lg shadow-tarot-purple/30 flex items-center justify-center">
            <div className="text-tarot-gold text-4xl opacity-50">✦</div>
          </div>
        </div>

        {/* Card Front */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div
            className={cn(
              "w-full h-full rounded-xl overflow-hidden border-2 shadow-xl",
              isSelected
                ? "border-tarot-gold shadow-tarot-gold/30"
                : "border-tarot-purple/30",
              isReversed && "rotate-180"
            )}
          >
            <div className="relative w-full h-full bg-gradient-to-b from-tarot-indigo to-tarot-dark">
              {/* Card Image Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">
                    {card.arcana === "major" ? "☆" : "♠"}
                  </div>
                  <div className="text-tarot-gold font-semibold text-sm">
                    {card.name}
                  </div>
                  <div className="text-tarot-light/60 text-xs mt-1">
                    {card.nameCn}
                  </div>
                  {isReversed && (
                    <div className="text-tarot-purple text-xs mt-2 font-medium">
                      REVERSED
                    </div>
                  )}
                </div>
              </div>

              {/* Mystical Border */}
              <div className="absolute inset-2 border border-tarot-gold/20 rounded-lg pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TarotCardBack({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-20 h-32",
    md: "w-32 h-48",
    lg: "w-48 h-72",
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      <div className="w-full h-full rounded-xl bg-gradient-to-br from-tarot-purple via-tarot-dark to-tarot-indigo border-2 border-tarot-gold/30 shadow-lg shadow-tarot-purple/30 flex items-center justify-center">
        <div className="text-tarot-gold text-4xl opacity-50">✦</div>
      </div>
    </div>
  );
}
