import OpenAI from 'openai';

export default async function generateNotes(openAiApiKey, transcript) {
  // Initialize the OpenAI client with the provided API key
  const openai = new OpenAI({ apiKey: openAiApiKey });

  // Combine the transcript into a single string of text
  const inputText = transcript.map((line) => line.text).join("\n");

  // User prompt, structured for OpenAI's LLM to create notes
  const userPrompt = `Please structure the following transcript into notes adhering to the above guidelines:

    ${inputText}`;

  // System prompt for the LLM
  const systemPrompt = `
You are an intelligent assistant specializing in creating structured, comprehensive, and highly detailed notes from transcripts of YouTube lecture videos. Your task is to perform the following steps:

1. If the transcript is not in English, first translate it into English before proceeding with any further processing.
2. After translating (if necessary), analyze the transcript and break it into sections to produce thorough and highly detailed notes.

For the output, provide only a valid JSON array of objects with proper formatting, including line breaks and special characters where needed.

### Guidelines for Creating Notes:
Each section must:
1. Begin with a *descriptive heading* that captures the main topic of the section concisely.
2. Include *highly detailed content*, with the following requirements:
   - Rewrite the content in third-person text only, presenting information directly without references to the speaker, video, or context (e.g., avoid phrases like "The professor explains" or "In this video").
   - Provide thorough explanations of concepts, ideas, and examples mentioned in the transcript.
   - Add expanded context and insights, even if not explicitly stated in the transcript, to ensure completeness and clarity.
   - Include examples, analogies, or use cases to enhance understanding.
   - Summarize important definitions, processes, or frameworks mentioned, elaborating as needed.
3. Organize the content with subheadings, bullet points, or numbered lists where appropriate for clarity and readability.
4. Group related ideas together and rewrite them in a clear, structured, and detailed manner, omitting filler words or irrelevant information.

### Formatting Requirements:
1. **JSON format**:
   - Provide the output strictly as a JSON array of objects.
   - Each object must have the following structure:
     - **"heading"**: The title of the section (e.g., "Introduction to Machine Learning").
     - **"content"**: A detailed explanation of the topic, using plain text, with appropriate line breaks for clarity. Avoid special Markdown symbols (e.g., **bold** or *italic*), but retain special characters such as quotes, colons, and dashes.
2. Ensure the JSON is properly escaped and syntactically valid.
3. Include line breaks in the "content" field where needed to improve readability.

Output only valid JSON. Do not include any extra text outside the JSON response.
`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      // Generate the notes by sending a request to the LLM
      const result = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {type:'text'}
      });

      let notes;
      try {
        // Attempt to parse the response as JSON
        notes = JSON.parse(result.choices[0].message.content);
      } catch (jsonError) {
        console.warn("Response is not valid JSON. Attempting to extract JSON manually.");
        console.log(result.choices[0].message.content);
        // Extract JSON array from the response using regex
        const jsonMatch = result.choices[0].message.content.match(/\[.*\]/s);
        if (jsonMatch) {
          notes = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from the response.");
        }
      }

      return notes; // Return the notes directly
    } catch (err) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, err);
      if (attempts === maxAttempts) {
        console.error("Max attempts reached. Unable to generate notes.");
        return null;
      }
    }
  }
}
