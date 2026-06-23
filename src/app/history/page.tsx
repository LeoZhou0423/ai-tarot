"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Trash2, Eye, Globe } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCardById } from "@/data/tarot-cards";
import { getSpreadById } from "@/data/spreads";
import { useI18n } from "@/lib/i18n";

interface SavedReading {
  id: string;
  timestamp: number;
  question: string;
  spreadId: string;
  spreadName: string;
  drawnCards: Array<{ cardId: number; position: number; isReversed: boolean }>;
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

function deleteReading(id: string) {
  const readings = loadReadings().filter((r) => r.id !== id);
  localStorage.setItem("tarot-readings", JSON.stringify(readings));
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { locale, setLocale, t } = useI18n();
  const [readings, setReadings] = useState<SavedReading[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setReadings(loadReadings());
  }, []);

  const handleDelete = (id: string) => {
    deleteReading(id);
    setReadings(loadReadings());
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-tarot-gold" />
              {t("history.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {readings.length === 0 ? (
              <div className="text-center py-12 text-tarot-light/40">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t("history.empty")}</p>
                <p className="text-sm mt-2">{t("history.emptyDescription")}</p>
                <Link href="/">
                  <Button variant="mystical" className="mt-6">
                    {t("history.startFirst")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {readings.map((reading, index) => {
                  const isExpanded = expandedId === reading.id;

                  return (
                    <motion.div
                      key={reading.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`transition-all cursor-pointer hover:border-tarot-gold/50 ${
                          isExpanded ? "border-tarot-gold/50" : ""
                        }`}
                        onClick={() => toggleExpand(reading.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-tarot-gold text-xs font-medium px-2 py-0.5 rounded-full bg-tarot-gold/10">
                                  {reading.spreadName}
                                </span>
                                <span className="text-tarot-light/40 text-xs">
                                  {formatDate(reading.timestamp)}
                                </span>
                              </div>
                              <p className="text-tarot-light/80 text-sm truncate">
                                &ldquo;{reading.question}&rdquo;
                              </p>

                              {/* Show card previews */}
                              <div className="flex gap-2 mt-3">
                                {reading.drawnCards.slice(0, 5).map((dc, i) => {
                                  const card = getCardById(dc.cardId);
                                  if (!card) return null;
                                  return (
                                    <div
                                      key={i}
                                      className="w-10 h-16 rounded-lg bg-gradient-to-br from-tarot-purple to-tarot-dark border border-tarot-gold/20 flex items-center justify-center text-xs"
                                    >
                                      <div
                                        className={`text-tarot-gold/70 ${
                                          dc.isReversed ? "rotate-180" : ""
                                        }`}
                                      >
                                        ✦
                                      </div>
                                    </div>
                                  );
                                })}
                                {reading.drawnCards.length > 5 && (
                                  <div className="w-10 h-16 rounded-lg bg-tarot-dark/50 border border-tarot-purple/20 flex items-center justify-center text-tarot-light/40 text-xs">
                                    +{reading.drawnCards.length - 5}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(reading.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-tarot-light/40 hover:text-tarot-rose" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Eye
                                  className={`w-4 h-4 transition-transform ${
                                    isExpanded
                                      ? "rotate-180 text-tarot-gold"
                                      : "text-tarot-light/40"
                                  }`}
                                />
                              </Button>
                            </div>
                          </div>

                          {/* Expanded interpretation */}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-4 pt-4 border-t border-tarot-purple/20"
                            >
                              <article className="prose prose-invert prose-tarot max-w-none text-sm">
                                <Markdown remarkPlugins={[remarkGfm]}>
                                  {reading.interpretation}
                                </Markdown>
                              </article>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
