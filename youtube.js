require("dotenv").config();
const { YoutubeTranscript } = require("youtube-transcript");
const fs = require("fs");
const Groq = require("groq-sdk");

// Initialize Groq with your API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// System prompt for the model
const systemPrompt = `
You are an intelligent assistant specialized in creating structured, comprehensive, and highly detailed notes from transcripts of lecture videos. Your task is to perform the following steps:

1. If the transcript is not in English, first translate it into English before proceeding with any further processing.
2. After translating (if necessary), analyze the transcript and break it into sections to produce thorough and detailed notes.

For the output, provide only the array of objects, nothing extra.

Each section should:
1. Start with a *descriptive heading* that summarizes the topic of the section.
2. Include *detailed explanations* as the content, providing as much depth and coverage of key points as the transcript allows.

Guidelines for structuring:
- Use the entire transcript to create a detailed outline of major topics (headings) and subtopics.
- If the transcript includes an introduction or overview, summarize it under a heading like "Introduction."
- Group related ideas together and rewrite them in a clear, detailed, and structured manner, omitting filler words or irrelevant information.
- For longer transcripts, ensure the level of detail matches the video’s duration, prioritizing in-depth coverage and clarity.
- When appropriate, use bullet points, numbered lists, or subheadings to organize the content within each section.

Format the output as a JSON array of objects, where each object has:
- *"heading"*: The title of the section (e.g., "Introduction to Machine Learning").
- *"content"*: The key points covered in that section, rewritten for clarity and expanded where possible to include examples, explanations, and context.

For example:
[
  {
    "heading": "Introduction to Artificial Intelligence",
    "content": "Artificial Intelligence (AI) involves creating systems capable of performing tasks that typically require human intelligence, such as reasoning, learning, and problem-solving. For example, AI is used in applications like voice assistants, recommendation systems, and autonomous vehicles."
  },
  {
    "heading": "Key Components of AI",
    "content": "AI includes components such as machine learning, natural language processing, and computer vision. Machine learning focuses on building systems that learn from data to make predictions or decisions. Natural language processing enables machines to understand and generate human language, while computer vision involves analyzing visual data from images and videos."
  },
  {
    "heading": "Applications of AI in Healthcare",
    "content": "AI is revolutionizing healthcare with applications in diagnostics, drug discovery, and personalized treatment. For instance, AI-powered tools can analyze medical images to detect diseases, predict patient outcomes using machine learning models, and recommend tailored treatment plans."
  }
]

Here is the transcript:
`;



// Main function to process transcript with Groq
const processTranscriptWithGroq = async (transcript) => {
  // Extract input text from the transcript
  const inputText = transcript.map((line) => line.text).join("\n");

  const userPrompt = `Please structure the following transcript into notes adhering to the above guidelines:

${inputText}`;

  try {
    console.log("Processing transcript with Groq...");
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const structuredNotes = result.choices[0].message.content;
    console.log("Transcript processed successfully!");
    return structuredNotes;
  } catch (error) {
    console.error("Error processing transcript with Groq:", error);
    throw error;
  }
};

// Main Function to process YouTube transcript
const processYouTubeTranscript = async (videoUrl) => {
  console.log("Fetching transcript...");
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
    console.log("Transcript fetched successfully!");

    // Save raw transcript to a file
    const rawNotes = transcript.map((line) => line.text).join("\n");
    fs.writeFileSync("raw_transcript.txt", rawNotes, "utf8");
    console.log("Raw transcript saved to raw_transcript.txt");

    // Process with Groq
    const structuredNotes = await processTranscriptWithGroq(transcript);

    // Save structured notes to a file
    fs.writeFileSync("structured_notes.json", structuredNotes, "utf8");
    console.log("Structured notes saved to structured_notes.json");
  } catch (error) {
    console.error("Error in processing:", error);
  }
};

// Replace with your YouTube video link
const videoUrl = "https://youtu.be/AXrF0AmMYlc?si=rpqw0fRBqVJpDxqr";
processYouTubeTranscript(videoUrl);
