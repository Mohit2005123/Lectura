import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize Groq with the API key from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    // Parse incoming JSON request body
    const { notes, chatHistory } = await request.json();

    // Log the incoming request body for debugging
    console.log("Received request body:", { notes, chatHistory });

    // Check if notes are provided, return error if not
    if (!notes || notes.length === 0) {
      return NextResponse.json(
        { message: 'Please provide notes for the AI to respond to.' },
        { status: 400 }
      );
    }

    // Ensure chatHistory is defined (even if empty)
    const chatHistoryWithNotes = chatHistory || [];

    // Combine the notes into a format the AI can understand
    const formattedNotes = notes.map((note) => ({
      role: 'assistant',
      content: `Title: ${note.title}\nContent: ${note.content}`, // Format for AI context
    }));

    // Add the notes to the chat history to guide the AI's response
    const context = [...chatHistoryWithNotes, ...formattedNotes];

    // Log the context being sent to the Groq API for debugging
    console.log("Request context being sent to Groq:", context);

    // Make Groq API request with notes and chat history as context
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: context, // Send combined chat history + notes as context
    });

    // Ensure the response is in the expected format
    if (response && response.choices && response.choices.length > 0) {
      return NextResponse.json(
        { message: response.choices[0].message.content },
        { status: 200 }
      );
    } else {
      // In case of unexpected response structure
      return NextResponse.json(
        { message: 'No valid response from Groq' },
        { status: 500 }
      );
    }
  } catch (error) {
    // Log the error details for debugging
    console.error("Error fetching Groq response:", error);

    // Return more detailed error information
    return NextResponse.json(
      { message: error.message || "Sorry, something went wrong! Please try again later." },
      { status: 500 }
    );
  }
}





