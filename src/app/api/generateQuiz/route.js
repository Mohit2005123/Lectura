import { NextResponse } from "next/server";
import generatequiz from "./generatequiz";
import gettranscript from "./gettranscript";

// Get the Groq API Key from environment variables
const GroqApiKey = process.env.groqApiKey;
export async function POST(request) {
  try {
    // Extract the link from the request body
    const { link } = await request.json();

    // Log the received request body for debugging
    console.log("Received request body:", { link });

    // Check if the link was provided
    if (!link) {
      return NextResponse.json({ message: 'Link not given' }, { status: 400 });
    }

    // Continue with the existing logic...
    const transcript = await gettranscript(link);
    if (!transcript) {
      return NextResponse.json({ message: 'Transcript generation failed' }, { status: 500 });
    }

    const quiz = await generatequiz(GroqApiKey, transcript);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz generation from AI failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successful', quiz: quiz }, { status: 200 });

  } catch (err) {
    console.error("Error occurred:", err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

