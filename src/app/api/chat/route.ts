import { NextRequest, NextResponse } from "next/server";
import { getChatResponse } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { message, context, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build reading context string
    const readingContext = `
Original Question: ${context?.question || "Unknown"}
Spread: ${context?.spreadName || "Unknown"}
Cards Drawn: ${context?.drawnCards?.map((dc: { cardId: number; isReversed: boolean }) => 
      `Card ${dc.cardId}${dc.isReversed ? " (Reversed)" : ""}`
    ).join(", ") || "None"}
Previous Interpretation: ${context?.interpretation || "None"}
    `.trim();

    // Build message history
    const messages = [
      ...(history || []),
      { role: "user" as const, content: message },
    ];

    // Get AI response
    const response = await getChatResponse(readingContext, messages);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
