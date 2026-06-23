import { NextRequest, NextResponse } from "next/server";
import { getSpreadRecommendation, getInterpretation } from "@/lib/ai";
import { getSpreadById } from "@/data/spreads";
import { getCardById } from "@/data/tarot-cards";

export async function POST(req: NextRequest) {
  try {
    const { question, spreadId, drawnCards } = await req.json();

    if (!question || !spreadId || !drawnCards) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const spread = getSpreadById(spreadId);
    if (!spread) {
      return NextResponse.json(
        { error: "Invalid spread" },
        { status: 400 }
      );
    }

    // Prepare card information for interpretation
    const cardDetails = drawnCards.map(
      (dc: { cardId: number; position: number; isReversed: boolean }) => {
        const card = getCardById(dc.cardId);
        return {
          position: dc.position,
          positionName: spread.positions[dc.position]?.name || `Position ${dc.position}`,
          cardName: card?.name || "Unknown Card",
          isReversed: dc.isReversed,
        };
      }
    );

    // Get AI interpretation
    const interpretation = await getInterpretation(
      question,
      spread.name,
      spread.description,
      cardDetails
    );

    return NextResponse.json({
      interpretation,
      spreadId,
      question,
    });
  } catch (error) {
    console.error("Reading API error:", error);
    return NextResponse.json(
      { error: "Failed to get interpretation" },
      { status: 500 }
    );
  }
}
