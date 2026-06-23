"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Locale = "en" | "zh";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    "nav.back": "Back",
    "nav.history": "History",

    // Home
    "home.title": "AI Tarot",
    "home.subtitle": "Your 24/7 Mystical Advisor",
    "home.description": "The universe is ready to answer you",
    "home.inputPlaceholder": "Ask the cards your question...",
    "home.ask": "Ask",
    "home.chooseTopic": "Or choose a topic:",
    "home.dailyGuidance": "Daily Guidance",
    "home.dailyDescription": "Draw your card of the day",
    "home.viewHistory": "View Reading History",
    "home.footer": "For entertainment purposes only",
    "home.poweredBy": "Powered by AI",

    // Topics
    "topic.love": "Love",
    "topic.career": "Career",
    "topic.finance": "Finance",
    "topic.relationships": "Relationships",
    "topic.guidance": "Guidance",

    // Reading
    "reading.back": "Back",
    "reading.questionTitle": "What do you seek guidance on?",
    "reading.questionPlaceholder": "Ask the cards your question...",
    "reading.chooseSpread": "Choose your spread:",
    "reading.beginReading": "Begin Reading",
    "reading.shuffling": "Shuffling the cards...",
    "reading.preparing": "Preparing your spread",
    "reading.drawTitle": "Click each card to reveal",
    "reading.revealed": "revealed",
    "reading.yourReading": "Your Reading",
    "reading.theCardsSpeaking": "The cards are speaking...",
    "reading.cardsUnclear": "The cards are unclear at this moment. Please try again.",
    "reading.saved": "Saved",
    "reading.save": "Save",
    "reading.share": "Share",
    "reading.askMore": "Ask More",
    "reading.backToReading": "Back to Reading",

    // Chat
    "chat.title": "AI Oracle",
    "chat.placeholder": "Ask the Oracle...",
    "chat.send": "Send",
    "chat.empty": "Ask the Oracle a follow-up question",
    "chat.error": "I sense a disturbance in the connection. Please try again.",

    // History
    "history.title": "Reading History",
    "history.empty": "No readings saved yet",
    "history.emptyDescription": "Complete a reading and click Save to see it here",
    "history.startFirst": "Start Your First Reading",

    // Spread names
    "spread.daily": "Daily Card",
    "spread.dailyCn": "每日一牌",
    "spread.threeCard": "Past-Present-Future",
    "spread.threeCardCn": "过去-现在-未来",
    "spread.lovePyramid": "Love Pyramid",
    "spread.lovePyramidCn": "爱情金字塔",
    "spread.choice": "Two Choices",
    "spread.choiceCn": "二选一",
    "spread.celticCross": "Celtic Cross",
    "spread.celticCrossCn": "凯尔特十字",

    // Common
    "common.cards": "cards",
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.retry": "Try again",
  },
  zh: {
    // Navigation
    "nav.back": "返回",
    "nav.history": "历史",

    // Home
    "home.title": "AI 塔罗牌",
    "home.subtitle": "你的 24/7 神秘顾问",
    "home.description": "宇宙已经准备好回答你了 ✨",
    "home.inputPlaceholder": "输入你的问题...",
    "home.ask": "开始",
    "home.chooseTopic": "或者选择一个主题：",
    "home.dailyGuidance": "每日指引",
    "home.dailyDescription": "抽取今日指引牌",
    "home.viewHistory": "查看历史记录",
    "home.footer": "仅供娱乐参考",
    "home.poweredBy": "由 AI 驱动",

    // Topics
    "topic.love": "感情",
    "topic.career": "事业",
    "topic.finance": "财运",
    "topic.relationships": "人际",
    "topic.guidance": "指引",

    // Reading
    "reading.back": "返回",
    "reading.questionTitle": "你想寻求什么指引？",
    "reading.questionPlaceholder": "输入你的问题...",
    "reading.chooseSpread": "选择牌阵：",
    "reading.beginReading": "开始解读",
    "reading.shuffling": "正在洗牌...",
    "reading.preparing": "准备你的专属牌阵",
    "reading.drawTitle": "点击翻开每张牌",
    "reading.revealed": "已翻开",
    "reading.yourReading": "你的解读",
    "reading.theCardsSpeaking": "塔罗牌正在解读...",
    "reading.cardsUnclear": "牌意暂时不清晰，请重试。",
    "reading.saved": "已保存",
    "reading.save": "保存",
    "reading.share": "分享",
    "reading.askMore": "继续提问",
    "reading.backToReading": "返回解读",

    // Chat
    "chat.title": "AI 塔罗师",
    "chat.placeholder": "向塔罗师提问...",
    "chat.send": "发送",
    "chat.empty": "向塔罗师提问获取更多指引",
    "chat.error": "连接出现异常，请重试。",

    // History
    "history.title": "历史记录",
    "history.empty": "暂无保存的记录",
    "history.emptyDescription": "完成一次解读并点击保存，即可在此查看",
    "history.startFirst": "开始你的第一次解读",

    // Spread names
    "spread.daily": "每日一牌",
    "spread.dailyCn": "每日一牌",
    "spread.threeCard": "过去-现在-未来",
    "spread.threeCardCn": "过去-现在-未来",
    "spread.lovePyramid": "爱情金字塔",
    "spread.lovePyramidCn": "爱情金字塔",
    "spread.choice": "二选一",
    "spread.choiceCn": "二选一",
    "spread.celticCross": "凯尔特十字",
    "spread.celticCrossCn": "凯尔特十字",

    // Common
    "common.cards": "张牌",
    "common.loading": "加载中...",
    "common.error": "出错了",
    "common.retry": "重试",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = (key: string): string => {
    return (
      translations[locale][key as keyof (typeof translations)[typeof locale]] ||
      key
    );
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
