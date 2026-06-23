"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Star,
  Moon,
  Sun,
  Heart,
  Briefcase,
  Coins,
  Users,
  Compass,
  Clock,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

const questionTopics = [
  { icon: Heart, topicKey: "love", color: "text-pink-400" },
  { icon: Briefcase, topicKey: "career", color: "text-blue-400" },
  { icon: Coins, topicKey: "finance", color: "text-yellow-400" },
  { icon: Users, topicKey: "relationships", color: "text-green-400" },
  { icon: Compass, topicKey: "guidance", color: "text-purple-400" },
];

const topicQuestions: Record<string, string> = {
  love: "What does the universe want me to know about my love life?",
  career: "What guidance do the cards have for my career path?",
  finance: "What energy surrounds my financial situation?",
  relationships: "How can I improve my relationships?",
  guidance: "What message do the cards have for me today?",
};

export default function Home() {
  const { locale, setLocale, t } = useI18n();
  const [question, setQuestion] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    setQuestion(topicQuestions[topic] || "");
  };

  const toggleLocale = () => {
    setLocale(locale === "en" ? "zh" : "en");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLocale}
          className="text-tarot-light/60 hover:text-tarot-gold"
        >
          <Globe className="w-4 h-4 mr-2" />
          {locale === "en" ? "中文" : "English"}
        </Button>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-tarot-purple to-tarot-gold shadow-xl shadow-tarot-purple/30">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="bg-gradient-to-r from-tarot-gold via-tarot-light to-tarot-gold bg-clip-text text-transparent">
            {t("home.title")}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-tarot-light/80 mb-2">
          {t("home.subtitle")}
        </p>
        <p className="text-lg text-tarot-light/60 mb-8">
          {t("home.description")}
        </p>

        {/* Decorative stars */}
        <div className="flex justify-center gap-4 mb-12">
          {[Star, Moon, Sun, Star, Moon].map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Icon className="w-6 h-6 text-tarot-gold/50" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Question Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full max-w-2xl mx-auto mb-8"
      >
        <div className="relative">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t("home.inputPlaceholder")}
            className="h-14 text-lg pl-6 pr-32 bg-tarot-dark/80 border-tarot-purple/30 focus:border-tarot-gold/50"
          />
          <Link
            href={question ? `/reading?q=${encodeURIComponent(question)}` : "#"}
          >
            <Button
              variant="mystical"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10"
              disabled={!question}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t("home.ask")}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Topic Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="w-full max-w-2xl mx-auto mb-16"
      >
        <p className="text-center text-tarot-light/60 mb-4">
          {t("home.chooseTopic")}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {questionTopics.map(({ icon: Icon, topicKey, color }) => (
            <motion.button
              key={topicKey}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTopicClick(topicKey)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all duration-200 ${
                selectedTopic === topicKey
                  ? "border-tarot-gold bg-tarot-gold/10"
                  : "border-tarot-purple/30 bg-tarot-dark/50 hover:border-tarot-purple/60"
              }`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-tarot-light">{t(`topic.${topicKey}`)}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Daily Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="w-full max-w-md mx-auto"
      >
        <Link href="/reading?spread=daily">
          <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-2xl border-2 border-tarot-purple/30 bg-gradient-to-br from-tarot-dark/80 to-tarot-indigo/50 p-8 text-center transition-all duration-300 hover:border-tarot-gold/50 hover:shadow-xl hover:shadow-tarot-gold/10">
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="text-4xl mb-4">🌙</div>
                <h3 className="text-xl font-semibold text-tarot-gold mb-2">
                  {t("home.dailyGuidance")}
                </h3>
                <p className="text-tarot-light/60 text-sm">
                  {t("home.dailyDescription")}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* History Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="w-full max-w-md mx-auto mt-4"
      >
        <Link href="/history">
          <Button
            variant="ghost"
            className="w-full text-tarot-light/60 hover:text-tarot-gold"
          >
            <Clock className="w-4 h-4 mr-2" />
            {t("home.viewHistory")}
          </Button>
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-16 text-center text-tarot-light/30 text-sm"
      >
        <p>{t("home.footer")}</p>
        <p className="mt-1">{t("home.poweredBy")} · MimoTokenPlan</p>
      </motion.footer>
    </main>
  );
}
