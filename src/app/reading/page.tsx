"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Star,
  Bookmark,
  Share2,
  Check,
  Globe,
} from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TarotCard } from "@/components/tarot/tarot-card";
import { tarotCards, getCardById } from "@/data/tarot-cards";
import { spreads, getSpreadById } from "@/data/spreads";
import { shuffleArray } from "@/lib/utils";
import { Spread, DrawnCard } from "@/types";
import { useI18n } from "@/lib/i18n";
import { Paywall } from "@/components/paywall";

type ReadingPhase = "question" | "shuffle" | "draw" | "interpretation" | "chat";

interface SavedReading {
  id: string;
  timestamp: number;
  question: string;
  spreadId: string;
  spreadName: string;
  drawnCards: DrawnCard[];
  interpretation: string;
}

function loadReadings(): SavedReading[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("tarot-readings") || "[]");
  } catch {
    return [];
  }
}

function saveReading(reading: SavedReading) {
  const existing = loadReadings();
  localStorage.setItem(
    "tarot-readings",
    JSON.stringify([reading, ...existing].slice(0, 50))
  );
}

function ReadingContent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q") || "";
  const spreadId = searchParams.get("spread") || "three-card";
  const { locale, setLocale, t } = useI18n();
  const { data: session } = useSession();

  const [phase, setPhase] = useState<ReadingPhase>("question");
  const [question, setQuestion] = useState(initialQuestion);
  const [spread, setSpread] = useState<Spread | null>(null);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [interpretation, setInterpretation] = useState("");
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleCards, setShuffleCards] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentReadingId, setCurrentReadingId] = useState<string | null>(null);
  const [displayedInterpretation, setDisplayedInterpretation] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [remainingReadings, setRemainingReadings] = useState(3);

  // Typing effect for interpretation
  useEffect(() => {
    if (interpretation && !isTyping) {
      setIsTyping(true);
      setDisplayedInterpretation("");
      let currentIndex = 0;

      const typeNextChar = () => {
        if (currentIndex < interpretation.length) {
          setDisplayedInterpretation(
            interpretation.substring(0, currentIndex + 1)
          );
          currentIndex++;
          setTimeout(typeNextChar, 10);
        } else {
          setIsTyping(false);
        }
      };

      typeNextChar();
    }
  }, [interpretation]);

  // Load spread on mount
  useEffect(() => {
    const selectedSpread = getSpreadById(spreadId);
    if (selectedSpread) {
      setSpread(selectedSpread);
      setShuffleCards(selectedSpread.cardCount);
    }
  }, [spreadId]);

  // Auto-start shuffle when spread is loaded and we have an initial question
  useEffect(() => {
    if (spread && initialQuestion && !isShuffling && phase === "question") {
      setPhase("shuffle");
      setIsShuffling(true);
    }
  }, [spread, initialQuestion]);

  const handleStartReading = useCallback(() => {
    if (!question || !spread) return;
    setPhase("shuffle");
    setIsShuffling(true);
  }, [question, spread]);

  const handleShuffleComplete = useCallback(() => {
    if (!spread) return;
    setIsShuffling(false);

    const shuffled = shuffleArray(tarotCards);
    const drawn: DrawnCard[] = [];

    for (let i = 0; i < spread.cardCount; i++) {
      drawn.push({
        cardId: shuffled[i].id,
        position: i,
        isReversed: Math.random() > 0.7,
      });
    }

    setDrawnCards(drawn);
    setPhase("draw");
  }, [spread]);

  const handleCardClick = useCallback(
    (position: number) => {
      if (phase !== "draw") return;

      setRevealedCards((prev) => {
        const newRevealed = [...prev, position];

        if (newRevealed.length === spread?.cardCount) {
          setTimeout(() => {
            setPhase("interpretation");
            setTimeout(() => handleGetInterpretation(), 500);
          }, 800);
        }

        return newRevealed;
      });
    },
    [phase, spread]
  );

  const handleGetInterpretation = async () => {
    if (!spread || !question) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          spreadId: spread.id,
          drawnCards,
        }),
      });

      const data = await response.json();

      if (response.status === 403 && data.limitReached) {
        setRemainingReadings(data.remaining || 0);
        setShowPaywall(true);
        setPhase("question");
        return;
      }

      setInterpretation(data.interpretation);
    } catch (error) {
      console.error("Failed to get interpretation:", error);
      setInterpretation(t("reading.cardsUnclear"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReading = () => {
    if (!spread || !interpretation) return;

    const id = currentReadingId || `reading-${Date.now()}`;
    const reading: SavedReading = {
      id,
      timestamp: Date.now(),
      question,
      spreadId: spread.id,
      spreadName: spread.name,
      drawnCards,
      interpretation,
    };

    saveReading(reading);
    setCurrentReadingId(id);
    setIsSaved(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: "AI Tarot Reading",
      text: `My tarot reading: "${question}" - Check out AI Tarot!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard!");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: {
            question,
            spreadName: spread?.name,
            drawnCards,
            interpretation,
          },
          history: chatMessages,
        }),
      });

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Failed to get response:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("chat.error"),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocale(locale === "en" ? "zh" : "en")}
          className="text-tarot-light/60 hover:text-tarot-gold"
        >
          <Globe className="w-4 h-4 mr-2" />
          {locale === "en" ? "中文" : "English"}
        </Button>
      </div>

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("reading.back")}
          </Button>
        </Link>
      </div>

      {/* Question Phase */}
      {phase === "question" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-4 text-tarot-gold" />
                {t("reading.questionTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t("reading.questionPlaceholder")}
                className="min-h-[120px] text-lg"
              />

              <div className="space-y-3">
                <p className="text-sm text-tarot-light/60">
                  {t("reading.chooseSpread")}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {spreads.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSpread(s)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        spread?.id === s.id
                          ? "border-tarot-gold bg-tarot-gold/10"
                          : "border-tarot-purple/30 hover:border-tarot-purple/60"
                      }`}
                    >
                      <div className="text-sm font-medium text-tarot-gold">
                        {s.name}
                      </div>
                      <div className="text-xs text-tarot-light/40">
                        {s.nameCn}
                      </div>
                      <div className="text-xs text-tarot-light/30 mt-1">
                        {s.cardCount} {t("common.cards")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="mystical"
                size="lg"
                className="w-full"
                onClick={handleStartReading}
                disabled={!question || !spread}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {t("reading.beginReading")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Shuffle Phase */}
      {phase === "shuffle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl font-semibold text-tarot-gold mb-4">
            {t("reading.shuffling")}
          </h2>
          <p className="text-tarot-light/60 mb-8">
            {t("reading.preparing")}
          </p>

          <ShuffleAnimationInline
            isShuffling={isShuffling}
            onComplete={handleShuffleComplete}
            cardCount={shuffleCards}
          />
        </motion.div>
      )}

      {/* Draw Phase */}
      {phase === "draw" && spread && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-tarot-gold mb-2">
              {spread.name}
            </h2>
            <p className="text-tarot-light/60">{t("reading.drawTitle")}</p>
            <p className="text-sm text-tarot-light/40 mt-2">
              {revealedCards.length} / {spread.cardCount}{" "}
              {t("reading.revealed")}
            </p>
          </div>

          <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
            {spread.positions.map((pos, i) => {
              const drawn = drawnCards.find((dc) => dc.position === i);
              if (!drawn) return null;
              const card = getCardById(drawn.cardId);
              if (!card) return null;
              const isRevealed = revealedCards.includes(i);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <TarotCard
                    card={card}
                    isReversed={drawn.isReversed}
                    isRevealed={isRevealed}
                    onClick={() => handleCardClick(i)}
                    size="md"
                  />
                  <div className="text-center">
                    <div className="text-tarot-gold text-sm font-medium">
                      {pos.name}
                    </div>
                    <div className="text-tarot-light/40 text-xs">
                      {pos.nameCn}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Interpretation Phase */}
      {phase === "interpretation" && spread && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-tarot-gold mb-2">
              {t("reading.yourReading")}
            </h2>
            <p className="text-tarot-light/60 italic">&ldquo;{question}&rdquo;</p>
          </div>

          {/* Revealed Cards */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {drawnCards.map((dc, i) => {
              const card = getCardById(dc.cardId);
              if (!card) return null;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex flex-col items-center gap-2"
                >
                  <TarotCard
                    card={card}
                    isReversed={dc.isReversed}
                    isRevealed={true}
                    size="md"
                  />
                  <div className="text-center">
                    <div className="text-tarot-gold text-sm font-medium">
                      {spread.positions[i]?.name}
                    </div>
                    <div className="text-tarot-light/50 text-xs">
                      {card.name} {dc.isReversed ? "(Reversed)" : ""}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interpretation */}
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-12 h-12 mx-auto text-tarot-gold" />
                </motion.div>
                <p className="mt-4 text-tarot-light/60">
                  {t("reading.theCardsSpeaking")}
                </p>
              </CardContent>
            </Card>
          ) : interpretation ? (
            <Card>
              <CardContent className="p-6 md:p-8">
                {/* Proper Markdown rendering with typing effect */}
                <article className="prose prose-invert prose-tarot max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {displayedInterpretation}
                  </Markdown>
                </article>

                <div className="flex gap-3 mt-8 pt-6 border-t border-tarot-purple/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveReading}
                    disabled={isSaved}
                  >
                    {isSaved ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Bookmark className="w-4 h-4 mr-2" />
                    )}
                    {isSaved ? t("reading.saved") : t("reading.save")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    {t("reading.share")}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPhase("chat")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t("reading.askMore")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </motion.div>
      )}

      {/* Chat Phase */}
      {phase === "chat" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-tarot-gold" />
                {t("chat.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto p-2">
                {chatMessages.length === 0 && (
                  <div className="text-center text-tarot-light/40 py-8">
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <p>{t("chat.empty")}</p>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${
                        msg.role === "user"
                          ? "bg-tarot-purple/30 text-tarot-light"
                          : "bg-tarot-dark/80 text-tarot-light/80 border border-tarot-purple/20"
                      }`}
                    >
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </Markdown>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t("chat.placeholder")}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  variant="mystical"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                >
                  {t("chat.send")}
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setPhase("interpretation")}
              >
                {t("reading.backToReading")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Paywall Modal */}
      <Paywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        remaining={remainingReadings}
      />
    </main>
  );
}

// Inline shuffle animation that doesn't unmount
function ShuffleAnimationInline({
  isShuffling,
  onComplete,
  cardCount,
}: {
  isShuffling: boolean;
  onComplete: () => void;
  cardCount: number;
}) {
  const [cards, setCards] = useState(() =>
    Array.from({ length: cardCount }).map(() => ({
      x: 0,
      y: 0,
      rotate: 0,
    }))
  );
  const [statusText, setStatusText] = useState("");
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isShuffling) return;

    completedRef.current = false;
    setStatusText("✦ Shuffling ✦");

    setCards((prev) =>
      prev.map((_, i) => ({
        x: (i - Math.floor(cardCount / 2)) * 70,
        y: i % 2 === 0 ? -30 : 30,
        rotate: (i - 2) * 12,
      }))
    );

    const t1 = setTimeout(() => {
      setStatusText("✦ Preparing ✦");
      setCards((prev) => prev.map(() => ({ x: 0, y: 0, rotate: 0 })));
    }, 1000);

    const t2 = setTimeout(() => {
      setStatusText("✦ Ready ✦");
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isShuffling, cardCount, onComplete]);

  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className="absolute"
          animate={{
            x: card.x,
            y: card.y,
            rotate: card.rotate,
            scale: isShuffling ? 0.9 : 0.8,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        >
          <div className="w-20 h-32 rounded-xl bg-gradient-to-br from-tarot-purple via-tarot-dark to-tarot-indigo border-2 border-tarot-gold/30 shadow-lg flex items-center justify-center">
            <div className="text-tarot-gold text-2xl opacity-50">✦</div>
          </div>
        </motion.div>
      ))}

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-tarot-gold text-lg font-medium">
          {statusText}
        </span>
      </div>
    </div>
  );
}

export default function ReadingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-tarot-gold animate-pulse" />
        </div>
      }
    >
      <ReadingContent />
    </Suspense>
  );
}
