// import Groq from 'groq-sdk';

// export default async function generateNotes(groqApiKey, transcript) {
//     // Initialize the Groq client with the provided API key
//     const groq = new Groq({ apiKey: groqApiKey });

//     // Combine the transcript into a single string of text
//     const inputText = transcript.map((line) => line.text).join('\n');

//     // User prompt, structured for Groq's LLM to create notes
//     const userPrompt = `Please structure the following transcript into notes adhering to the above guidelines:

//     ${inputText}`;

//     // System prompt for the LLM
//     const systemPrompt = `
// You are an intelligent assistant specialized in creating structured, comprehensive, and highly detailed notes from transcripts of lecture videos. Your task is to perform the following steps:

// 1. If the transcript is not in English, first translate it into English before proceeding with any further processing.
// 2. After translating (if necessary), analyze the transcript and break it into sections to produce thorough and detailed notes.

// For the output, provide only the array of objects, nothing extra.

// Each section should:
// 1. Start with a *descriptive heading* that summarizes the topic of the section.
// 2. Include *detailed explanations* as the content, providing as much depth and coverage of key points as the transcript allows.

// Guidelines for structuring:
// - Use the entire transcript to create a detailed outline of major topics (headings) and subtopics.
// - If the transcript includes an introduction or overview, summarize it under a heading like "Introduction."
// - Group related ideas together and rewrite them in a clear, detailed, and structured manner, omitting filler words or irrelevant information.
// - For longer transcripts, ensure the level of detail matches the video’s duration, prioritizing in-depth coverage and clarity.
// - When appropriate, use bullet points, numbered lists, or subheadings to organize the content within each section.

// Format the output as a JSON array of objects, where each object has:
// - *"heading"*: The title of the section (e.g., "Introduction to Machine Learning").
// - *"content"*: The key points covered in that section, rewritten for clarity and expanded where possible to include examples, explanations, and context.

// For example:
// [
//   {
//     "heading": "Introduction to Artificial Intelligence",
//     "content": "Artificial Intelligence (AI) involves creating systems capable of performing tasks that typically require human intelligence, such as reasoning, learning, and problem-solving. For example, AI is used in applications like voice assistants, recommendation systems, and autonomous vehicles."
//   },
//   {
//     "heading": "Key Components of AI",
//     "content": "AI includes components such as machine learning, natural language processing, and computer vision. Machine learning focuses on building systems that learn from data to make predictions or decisions. Natural language processing enables machines to understand and generate human language, while computer vision involves analyzing visual data from images and videos."
//   },
//   {
//     "heading": "Applications of AI in Healthcare",
//     "content": "AI is revolutionizing healthcare with applications in diagnostics, drug discovery, and personalized treatment. For instance, AI-powered tools can analyze medical images to detect diseases, predict patient outcomes using machine learning models, and recommend tailored treatment plans."
//   }
// ]

// Here is the transcript:
// `;

//     try {
//         // Generate the notes by sending a request to the LLM
//         const result = await groq.chat.completions.create({
//             model: "llama-3.1-8b-instant",
//             messages: [
//                 { role: "system", content: systemPrompt },
//                 { role: "user", content: userPrompt },
//             ],
//         });

//         let notes;
//         try {
//             // Attempt to parse the response as JSON
//             notes = JSON.parse(result.choices[0].message.content);
//         } catch (jsonError) {
//             console.warn("Response is not valid JSON. Attempting to extract JSON manually.");

//             // Extract JSON array from the response using regex
//             const jsonMatch = result.choices[0].message.content.match(/\[.*\]/s);
//             if (jsonMatch) {
//                 notes = JSON.parse(jsonMatch[0]);
//             } else {
//                 throw new Error("Could not extract JSON from the response.");
//             }
//         }

//         return notes;
//     } catch (err) {
//         console.error("Error generating notes:", err);
//         return null;
//     }
// }

import Groq from "groq-sdk";

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
        console.warn(
          "Response is not valid JSON. Attempting to extract JSON manually."
        );

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
