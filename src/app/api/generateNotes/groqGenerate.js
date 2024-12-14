import Groq from 'groq-sdk';

export default async function generateNotes(groqApiKey, transcript) {
    // Initialize the Groq client with the provided API key
    const groq = new Groq({ apiKey: groqApiKey });

    // Combine the transcript into a single string of text
    const inputText = transcript.map((line) => line.text).join('\n');

    // User prompt, structured for Groq's LLM to create notes
    const userPrompt = `Please structure the following transcript into notes adhering to the above guidelines:

    ${inputText}`;

    // System prompt for the LLM
    const systemPrompt = `
You are an intelligent assistant specialized in creating structured, comprehensive, and highly detailed notes from transcripts of lecture videos. Your task is to perform the following steps:

1. If the transcript is not in English, first translate it into English before proceeding with any further processing.
2. After translating (if necessary), analyze the transcript and break it into sections to produce thorough and highly detailed notes.

For the output, provide only the array of objects, nothing extra.

### Guidelines for Creating Notes:
Each section must:
1. Begin with a *descriptive heading* that captures the main topic of the section concisely.
2. Include *highly detailed content*, with the following requirements:
   - Thorough explanations of concepts, ideas, and examples mentioned in the transcript.
   - Provide expanded context and insights, even if not explicitly stated in the transcript, to ensure completeness and clarity.
   - Include examples, analogies, or use cases to enhance understanding.
   - Summarize important definitions, processes, or frameworks mentioned, elaborating as needed.
3. Organize the content with subheadings, bullet points, or numbered lists where appropriate for clarity and readability.
4. Group related ideas together and rewrite them in a clear, structured, and detailed manner, omitting filler words or irrelevant information.

For longer transcripts:
- Prioritize depth and coverage of critical points.
- Ensure content matches the duration and complexity of the source material.

### Formatting Requirements:
Provide the output as a JSON array of objects, where each object has:
- **"heading"**: The title of the section (e.g., "Introduction to Machine Learning").
- **"content"**: A rich, detailed explanation of the topic, including examples, subpoints, and context.

### Example Output:
[
  {
    "heading": "Introduction to Artificial Intelligence",
    "content": "Artificial Intelligence (AI) involves creating systems capable of performing tasks that typically require human intelligence, such as reasoning, learning, and problem-solving. AI applications include voice assistants like Alexa, recommendation systems on platforms like Netflix, and autonomous vehicles such as Tesla's self-driving cars. AI's capabilities stem from advancements in machine learning, neural networks, and data processing."
  },
  {
    "heading": "Key Components of AI",
    "content": "AI consists of several core components:
   - **Machine Learning (ML)**: ML focuses on training algorithms to learn patterns from data and make predictions. For example, spam filters in email systems use ML to identify unwanted messages.
   - **Natural Language Processing (NLP)**: NLP enables machines to understand and generate human language. Examples include chatbots, language translation tools like Google Translate, and sentiment analysis tools for analyzing customer feedback.
   - **Computer Vision**: This field involves analyzing images and videos to extract meaningful information. Examples include facial recognition systems and object detection algorithms in self-driving cars."
  },
  {
    "heading": "Applications of AI in Healthcare",
    "content": "AI has transformative applications in the healthcare industry, including:
   1. **Medical Diagnostics**: AI-powered tools like IBM Watson can analyze patient records and medical images to diagnose diseases such as cancer or heart conditions with high accuracy.
   2. **Drug Discovery**: AI accelerates the discovery of new drugs by predicting potential chemical compounds, saving years of traditional research.
   3. **Personalized Treatment Plans**: AI systems analyze patient data to recommend tailored treatment options, improving outcomes and reducing costs. For instance, oncology-focused platforms like Tempus provide customized cancer treatment strategies."
  }
]

### Note:
1. Always aim to maximize detail and depth for each section. 
2. Assume the audience values in-depth knowledge, clarity, and structured insights.
3. Use simple, formal language, focusing on educational value.

Here is the transcript:
`;


    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            // Generate the notes by sending a request to the LLM
            const result = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
            });

            let notes;
            try {
                // Attempt to parse the response as JSON
                notes = JSON.parse(result.choices[0].message.content);
                return notes; // Return notes if parsing succeeds
            } catch (jsonError) {
                console.warn("Response is not valid JSON. Attempting to extract JSON manually.");

                // Extract JSON array from the response using regex
                const jsonMatch = result.choices[0].message.content.match(/\[.*\]/s);
                if (jsonMatch) {
                    notes = JSON.parse(jsonMatch[0]);
                    return notes; // Return notes if extraction succeeds
                } else {
                    throw new Error("Could not extract JSON from the response.");
                }
            }
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
