export interface TarotCard {
  id: number;
  name: string;
  nameCn: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number?: number;
  keywords: string[];
  meaningUpright: string;
  meaningReversed: string;
  imageUpright: string;
  imageReversed: string;
}

export interface SpreadPosition {
  index: number;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
}

export interface Spread {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  positions: SpreadPosition[];
  suitableQuestions: string[];
  cardCount: number;
}

export interface DrawnCard {
  cardId: number;
  position: number;
  isReversed: boolean;
}

export interface Reading {
  id: string;
  userId: string;
  question: string;
  spreadId: string;
  cards: DrawnCard[];
  interpretation: string;
  createdAt: Date;
  isFavorite: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
