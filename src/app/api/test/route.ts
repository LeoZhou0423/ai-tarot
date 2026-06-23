import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.MIMO_API_KEY;
    const baseUrl = process.env.MIMO_BASE_URL;

    if (!apiKey || !baseUrl) {
      return NextResponse.json({
        status: "error",
        message: "Missing MIMO_API_KEY or MIMO_BASE_URL",
      });
    }

    // Test with a simple completion
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [
          {
            role: "user",
            content: 'Say "Hello, I am MiMo!" in exactly 5 words.',
          },
        ],
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      status: "success",
      apiKeyPrefix: apiKey.substring(0, 10) + "...",
      baseUrl,
      response: data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content || "No response",
      raw: data,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
