"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TarotCardBack } from "./tarot-card";

interface ShuffleAnimationProps {
  isShuffling: boolean;
  onShuffleComplete: () => void;
  cardCount?: number;
}

export function ShuffleAnimation({
  isShuffling,
  onShuffleComplete,
  cardCount = 5,
}: ShuffleAnimationProps) {
  const [phase, setPhase] = useState<"idle" | "scatter" | "gather" | "done">("idle");
  const callbackRef = useRef(onShuffleComplete);
  callbackRef.current = onShuffleComplete;

  useEffect(() => {
    if (!isShuffling) {
      setPhase("idle");
      return;
    }

    console.log("Shuffle started");
    setPhase("scatter");

    const timer1 = setTimeout(() => {
      console.log("Gather phase");
      setPhase("gather");
    }, 1000);

    const timer2 = setTimeout(() => {
      console.log("Shuffle complete, calling callback");
      setPhase("done");
      callbackRef.current();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isShuffling]);

  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      {/* Cards */}
      <AnimatePresence>
        {Array.from({ length: cardCount }).map((_, i) => {
          const centerX = 0;
          const centerY = 0;
          const spreadX = (i - Math.floor(cardCount / 2)) * 70;
          const spreadY = i % 2 === 0 ? -30 : 30;

          return (
            <motion.div
              key={i}
              className="absolute"
              initial={{ x: centerX, y: centerY, rotate: 0, scale: 0.8 }}
              animate={{
                x: phase === "scatter" ? spreadX : centerX,
                y: phase === "scatter" ? spreadY : centerY,
                rotate: phase === "scatter" ? (i - 2) * 12 : 0,
                scale: phase === "done" ? 0.9 : 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            >
              <TarotCardBack size="sm" />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Status text */}
      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase !== "idle" ? 1 : 0 }}
      >
        <span className="text-tarot-gold text-lg font-medium">
          {phase === "scatter" && "✦ Shuffling ✦"}
          {phase === "gather" && "✦ Preparing ✦"}
          {phase === "done" && "✦ Ready ✦"}
        </span>
      </motion.div>
    </div>
  );
}
