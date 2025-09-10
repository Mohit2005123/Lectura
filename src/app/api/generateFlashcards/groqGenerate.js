import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateFlashcards(data) {
  const flashcards = await getShortenedFlashcards(data);
  return flashcards;
}

// Function to process the array and shorten each content using AI
async function getShortenedFlashcards(dataArray) {
  const flashcards = [];

  for (const element of dataArray) {
    const flashcardContent = await getGroqChatCompletion(element.heading, element.content);
    try {
      // Create JSON object manually
      flashcards.push({
        heading: element.heading,
        content: flashcardContent
      });
    } catch (error) {
      console.error("Error processing flashcard:", error);
      flashcards.push({ heading: element.heading, content: "Failed to generate flashcard." });
    }
  }
  console.log(flashcards);
  return flashcards;
}

// Function to interact with Groq AI and get JSON-formatted flashcard
export async function getGroqChatCompletion(heading, content) {
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `d 
You are a highly skilled assistant that extracts only the crucial information for flashcards.
Your task is to create a single-line summary of only the essential core concepts.

Guidelines:
1. STRICT 50-word maximum limit
2. Output must be a single continuous line with no line breaks
3. Do NOT include phrases like "Here is a summary" or "This is about"
4. Start directly with the key information
5. Use simple, clear language
6. Use only regular letters (a-z, A-Z) and basic punctuation
7. Focus only on the core facts and concepts

Example:
Input: "Course 804 explores quantum mechanics fundamentals with focus on intuition over calculations."

Output: Course 804 explores quantum mechanics fundamentals with focus on intuition over calculations.
`
      },
      {
        role: "user",
        content: `Extract only the key information in 50 words or less:\n${content}`
      },
    ],
    model: 'openai/gpt-oss-120b',
  });

  // Remove any line breaks and meta-text patterns
  let cleanedResponse = response.choices[0]?.message?.content.replace(/(\r\n|\n|\r)/gm, "") || 'Failed to generate summary';
  cleanedResponse = cleanedResponse.replace(/^(here is|this is|summary:|summary of|a summary of|brief summary of).*?:/i, '').trim();
  return cleanedResponse;
}