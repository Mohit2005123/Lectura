import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function generateQuiz(data) {
  let attempts = 0;
  let quizData = null;

  while (attempts < 5) {
    const chatCompletion = await getGroqChatCompletion(data);
    const responseContent = chatCompletion.choices[0]?.message?.content || "";

    if (isValidJSONArray(responseContent)) {
      quizData = JSON.parse(responseContent);
      
      // Assign unique IDs starting from 1
      quizData = quizData.map((question, index) => ({
        ...question,
        id: index , // Assign id starting from 1
      }));
      
      break;
    }

    attempts++;
    console.warn(`Attempt ${attempts}: AI response was not a valid JSON array. Retrying...`);
    console.log(responseContent);
  }

  if (!quizData) {
    throw new Error("Failed to generate valid JSON data after 5 attempts.");
  }

  return quizData;
}

export async function getGroqChatCompletion(data) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant designed to generate quizzes in JSON format from structured data.
Always follow these rules:
1. Use only the facts explicitly provided in the data.
2. Avoid assumptions or referencing external information.
3. Respond with **valid JSON data only**.
4. Do not include any additional explanations, introductory text, or comments. Only output the JSON data.
5. Each item in the output JSON array must be a quiz question object containing:
   - "question": A string with the quiz question.
   - "options": An array of possible answers.
   - "correct": An integer representing the index of the correct answer in the "options" array.`
      },
      {
        role: "user",
        content: `Here is the data: ${JSON.stringify(data)}. 
Please generate a quiz based on this data.`,
      }
    ],
    model: "openai/gpt-oss-120b"
  });
}

function isValidJSONArray(responseContent) {
  try {
    const parsedContent = JSON.parse(responseContent);
    return Array.isArray(parsedContent); // Ensure it's an array
  } catch (error) {
    return false;
  }
}
