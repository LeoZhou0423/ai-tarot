import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getInterpretation } from "@/lib/ai";
import { getSpreadById } from "@/data/spreads";
import { getCardById } from "@/data/tarot-cards";
import { checkUsage, incrementUsage } from "@/lib/usage";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please login to use AI Tarot" },
        { status: 401 }
      );
    }

    // Check usage limits
    const usage = await checkUsage(session.user.id);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "usage_limit",
          message: "You've used all 3 free readings. Upgrade to unlimited for $4.99/month!",
          remaining: 0,
        },
        { status: 403 }
      );
    }

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

    // Increment usage count
    await incrementUsage(session.user.id);

    return NextResponse.json({
      interpretation,
      spreadId,
      question,
      remaining: usage.remaining - 1,
    });
  } catch (error) {
    console.error("Reading API error:", error);
    return NextResponse.json(
      { error: "Failed to get interpretation" },
      { status: 500 }
    );
  }
}
