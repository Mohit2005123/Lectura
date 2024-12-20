import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, videoData } = body;

    if (!message || !videoData) {
      return NextResponse.json(
        { error: "Missing required fields: message and videoData" },
        { status: 400 }
      );
    }

    // System and user prompts
    const systemPrompt =
      "You are an AI assistant that only answers questions in the context of the provided videoData. Your response must be plain text only and provide no additional formatting, metadata, or explanations. If the question is unrelated to the videoData, respond with 'Not relevant to notes.'";
    const userPrompt = `User query: "${message}". VideoData context: "${JSON.stringify(
      videoData
    )}".`;

    // Get the response from Groq
    const groqResponse = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.1-8b-instant",
    });

    const answer =
      groqResponse.choices[0]?.message?.content ||
      "Failed to generate a response.";

    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error("Error in /api/chat POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}