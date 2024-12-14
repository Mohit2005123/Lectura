import Groq from 'groq-sdk';

export default async function generatequiz(groqApiKey, transcript) {
    // Initialize the Groq client with the provided API key
    const groq = new Groq({ apiKey: groqApiKey });

    // Combine the transcript into a single string of text
    const inputText = transcript.map((line) => line.text).join('\n');

    // User prompt for quiz generation
    const userPrompt = `Based on the following transcript, create 5 multiple-choice questions (MCQs). Each question should include:
    1. A clear question.
    2. Four answer options (A, B, C, D).
    3. The correct answer clearly marked.

    Transcript:
    ${inputText}`;

    // System prompt for the LLM
    const systemPrompt = `You are a quiz generator. Your task is to generate 5 multiple-choice questions (MCQs) with the correct format, clear structure, and relevant content based on the provided input text.`;

    try {
        // Generate the quiz by sending a request to the LLM
        const result = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        });

        // Get the raw response content
        const content = result.choices[0].message.content;

        // Log the raw response to the console for debugging
        console.log("Raw response content:", content);

        // Attempt to parse the content into an array of quiz objects
        let quiz = [];

        try {
            // Assuming the response is in a well-structured JSON format
            quiz = JSON.parse(content);  // Try to parse the JSON if it's valid

            // If parsing succeeds, return the quiz
            return quiz;
        } catch (jsonError) {
            console.warn("Response is not valid JSON. Returning raw content for debugging.");
            return [];  // Return empty array if parsing fails
        }

    } catch (error) {
        console.error("Error generating quiz:", error.message);
        return [];  // Return empty array in case of an error
    }
}










