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
    // const systemPrompt =
    //   "You are an AI assistant that only answers questions in the context of the provided videoData. Your response must be plain text only and provide no additional formatting, metadata, or explanations. If the question is unrelated to the videoData, respond with 'Not relevant to notes.'";
    const systemPrompt =
  "You are an AI assistant that answers questions in the context of the provided videoData. Your response must be plain text only and should not include any formatting, metadata, or explanations. If the answer is clearly found in the videoData, use it directly. If the answer is not explicitly in the videoData but aligns with its overall topic, provide a helpful and relevant answer based on your own knowledge, phrased to match the style and context of the notes. If the question is unrelated to the videoData, respond with 'Not relevant to notes.'";
    const userPrompt = `User query: "${message}". VideoData context: "${JSON.stringify(
      videoData
    )}".`;

    // Get the response from Groq
    const groqResponse = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "openai/gpt-oss-120b",
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
