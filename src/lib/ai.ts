import OpenAI from "openai";

const MODEL = "mimo-v2.5-pro";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.MIMO_API_KEY || "dummy-key",
      baseURL: process.env.MIMO_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/v1",
    });
  }
  return client;
}

/**
 * MiMo v2.5-pro is a reasoning model — it uses reasoning_tokens for thinking,
 * and the actual content can be empty if max_tokens is too low.
 * We must set max_tokens high enough to leave room for the real answer.
 */
function extractContent(response: any): string {
  const msg = response.choices?.[0]?.message;
  // Some reasoning models put the answer in content, some in reasoning_content
  // Try content first, fall back to reasoning_content if empty
  return msg?.content || msg?.reasoning_content || "";
}

export async function getSpreadRecommendation(question: string): Promise<{
  spreadId: string;
  reason: string;
  confidence: number;
}> {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are a professional tarot reader. Based on the user's question, recommend the most suitable tarot spread.

Available spreads:
- daily: Single card daily guidance (1 card) - for quick daily advice
- three-card: Past-Present-Future (3 cards) - for timeline analysis
- love-pyramid: Love Pyramid (5 cards) - for relationship analysis
- choice: Two-choice spread (7 cards) - for A/B decisions
- celtic-cross: Celtic Cross (10 cards) - for complex situations

Respond in JSON format:
{
  "spreadId": "spread_id",
  "reason": "Brief explanation in 1-2 sentences",
  "confidence": 0.95
}`,
      },
      { role: "user", content: question },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = extractContent(response);
  return JSON.parse(content || '{"spreadId":"three-card","reason":"General analysis","confidence":0.8}');
}

export async function getInterpretation(
  question: string,
  spreadName: string,
  spreadDescription: string,
  cards: Array<{
    position: number;
    positionName: string;
    cardName: string;
    isReversed: boolean;
  }>
): Promise<string> {
  const cardList = cards
    .map(
      (c) =>
        `Position ${c.position} (${c.positionName}): ${c.cardName} (${c.isReversed ? "Reversed" : "Upright"})`
    )
    .join("\n");

  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: "system",
        content: `You are an experienced tarot reader with 20 years of practice, specializing in the Rider-Waite system with a background in psychology. Your reading style is warm, wise, and insightful - like a trusted friend.

User's question: ${question}
Spread used: ${spreadName}
Spread description: ${spreadDescription}

Cards drawn:
${cardList}

Please provide an interpretation following this structure (800-1200 words total):

## Overall Energy
1-2 sentences summarizing the core message and energy of this reading.

## Card-by-Card Analysis
For each card:
- Core meaning (upright/reversed)
- Meaning in this specific position
- Connection to the user's question

## The Story
Weave all cards into a coherent narrative revealing the full picture and trajectory.

## Actionable Guidance
2-3 specific, practical suggestions to help the user navigate their situation.

## Closing Message
A warm, encouraging sentence to empower the user.

Important guidelines:
- For reversed cards, focus on the direction of growth and transformation, not just negativity
- Avoid absolute predictions; emphasize tarot as a tool for self-reflection
- Use warm, friendly language like chatting with a close friend
- Be specific and personal, not generic
- Respond in the same language as the user's question`,
      },
      { role: "user", content: question },
    ],
    temperature: 0.8,
  });

  const interpretation = extractContent(response);
  return interpretation || "The cards' message is unclear at this moment. Please try again.";
}

export async function getChatResponse(
  readingContext: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `You are an AI Oracle - a wise, warm tarot advisor. You have access to the user's previous reading context.

Reading Context:
${readingContext}

Guidelines:
- Stay in character as a mystical but approachable tarot reader
- Reference the original reading when relevant
- Provide deeper insights when asked
- Be supportive and empathetic
- Avoid making absolute predictions
- Keep responses focused and helpful (200-400 words)
- Respond in the same language as the user`,
      },
      ...messages,
    ],
    temperature: 0.8,
  });

  const content = extractContent(response);
  return content || "I sense a disturbance in the cards. Could you rephrase your question?";
}

export async function streamChatResponse(
  readingContext: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
) {
  return getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `You are an AI Oracle - a wise, warm tarot advisor. You have access to the user's previous reading context.

Reading Context:
${readingContext}

Guidelines:
- Stay in character as a mystical but approachable tarot reader
- Reference the original reading when relevant
- Provide deeper insights when asked
- Be supportive and empathetic
- Avoid making absolute predictions
- Keep responses focused and helpful (200-400 words)
- Respond in the same language as the user`,
      },
      ...messages,
    ],
    temperature: 0.8,
    stream: true,
  });
}
