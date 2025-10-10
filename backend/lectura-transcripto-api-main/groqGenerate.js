import Groq from 'groq-sdk';

export default async function generateNotes(groqApiKey, transcript) {
  // Initialize the Groq client with the provided API key
  const groq = new Groq({ apiKey: groqApiKey });

  // Combine the transcript into a single string of text
  const inputText = transcript.map((line) => line.text).join("\n");
  // User prompt, structured for Groq's LLM to create notes
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

### Example Output:
[
  {
    "heading": "Introduction to Artificial Intelligence",
    "content": "Artificial Intelligence (AI) involves creating systems capable of performing tasks that typically require human intelligence, such as reasoning, learning, and problem-solving.\\n\\nApplications of AI include voice assistants like Alexa, recommendation systems on platforms like Netflix, and autonomous vehicles such as Tesla's self-driving cars.\\n\\nAI's capabilities stem from advancements in machine learning, neural networks, and data processing."
  },
  {
    "heading": "Key Components of AI",
    "content": "AI consists of several core components:\\n- **Machine Learning (ML)**: ML focuses on training algorithms to learn patterns from data and make predictions. For example, spam filters in email systems use ML to identify unwanted messages.\\n\\n- **Natural Language Processing (NLP)**: NLP enables machines to understand and generate human language. Examples include chatbots, language translation tools like Google Translate, and sentiment analysis tools for analyzing customer feedback.\\n\\n- **Computer Vision**: This field involves analyzing images and videos to extract meaningful information. Examples include facial recognition systems and object detection algorithms in self-driving cars."
  },
  {
    "heading": "Applications of AI in Healthcare",
    "content": "AI has transformative applications in the healthcare industry, including:\\n1. **Medical Diagnostics**: AI-powered tools like IBM Watson can analyze patient records and medical images to diagnose diseases such as cancer or heart conditions with high accuracy.\\n\\n2. **Drug Discovery**: AI accelerates the discovery of new drugs by predicting potential chemical compounds, saving years of traditional research.\\n\\n3. **Personalized Treatment Plans**: AI systems analyze patient data to recommend tailored treatment options, improving outcomes and reducing costs. For instance, oncology-focused platforms like Tempus provide customized cancer treatment strategies."
  }
]

For longer transcripts:
- Prioritize depth and coverage of critical points.
- Ensure the content matches the duration and complexity of the source material.

Output only valid JSON. Do not include any extra text outside the JSON response.
`;


  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      // Generate the notes by sending a request to the LLM
      const result = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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

            // Enhance the detail of each note
            const detailedNotes = [];
            for (const note of notes) {
                // const detailPrompt = `
                // You are an expert in expanding content to create comprehensive and detailed explanations. Using the following text as input, rewrite it to make it more detailed, clear, and insightful while maintaining the same context:

                // "${note.content}"

                // Provide only the rewritten text, nothing else.
                // `;
                const detailPrompt = `
You are an expert in expanding content to create comprehensive and detailed explanations. Using the following text as input, rewrite it to make it more detailed, clear, and insightful while maintaining the same context. 

### Important Guidelines:
1. Avoid all markdown or special formatting (e.g., **bold**, *italic*).
2. Provide plain text output with no additional symbols or characters.
3. Ensure the content remains clear, comprehensive, and insightful.

Input text:
"${note.content}"

Provide only the rewritten text in plain text, nothing else.
`;


                try {
                    const detailResult = await groq.chat.completions.create({
                        model: "llama-3.1-8b-instant",
                        messages: [
                            { role: "user", content: detailPrompt },
                        ],
                    });

                    // Extract and append the detailed content
                    const expandedContent = detailResult.choices[0].message.content;
                    detailedNotes.push({
                        heading: note.heading,
                        content: expandedContent,
                    });
                } catch (expansionError) {
                    console.error("Error expanding note content:", expansionError);
                }
            }

            return detailedNotes; // Return the fully detailed notes
        } catch (err) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, err);
            console.log()
            if (attempts === maxAttempts) {
                console.error("Max attempts reached. Unable to generate notes.");
                return null;
            }
        }
      }
    } 