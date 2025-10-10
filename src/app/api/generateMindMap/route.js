import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { videoData, title } = body;

    if (!videoData) {
      return NextResponse.json(
        { error: "Missing required field: videoData" },
        { status: 400 }
      );
    }

    // System prompt for generating mind map data
    const systemPrompt = `You are an AI assistant that creates mind maps from structured content.
    Generate a mind map in JSON format with the following structure:
    {
      "id": "root",
      "text": "Main Topic",
      "children": [
        {
          "id": "child1",
          "text": "Sub-topic 1",
          "children": [
            {
              "id": "child1-1",
              "text": "Detail 1",
              "children": []
            }
          ]
        }
      ]
    }
    
    Rules:
    1. Create a hierarchical structure that fully covers ALL provided notes/content. Use as many levels as needed to represent concepts clearly (typically 3–6 levels). Depth can vary by branch depending on the material.
    2. Each node must include: a unique "id" (kebab-case), a short, human-readable "text", and a "children" array (empty if leaf).
    3. Organize logically: 2–6 main branches under root, each with 2–8 sub-branches. Deeper levels should capture examples, steps, formulas, definitions, or checkpoints related to their parent.
    4. Keep text concise and scannable. Prefer concise phrases over sentences. Avoid punctuation-heavy blocks.
    5. Ensure coverage over the entire input; do not omit major sections. If a concept is large, break it into multiple levels rather than overly long labels.
    6. Limit overall size: aim for 20–60 total nodes. Merge redundant items; collapse trivial repetition.
    7. Output ONLY valid JSON (no markdown fences or explanations).
    8. Use the provided title as the root's "text" if available.`;

    const userPrompt = `Create a mind map from this content.
    Title: ${title || "Generated Notes"}
    Content (array of sections with heading + content HTML): ${JSON.stringify(videoData)}

    Requirements:
    - Include as many levels as necessary to faithfully represent details (definitions, steps, tips, examples, formulas), balancing depth across branches.
    - Aggregate tiny details under meaningful parents; split very long items into multiple sub-nodes.
    - Prefer consistent naming for similar types (e.g., Steps, Tips, Examples).
    - Output JSON only.`;

    // Get the response from Groq
    const groqResponse = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "openai/gpt-oss-120b",
    });

    const responseContent = groqResponse.choices[0]?.message?.content || "";
    console.log("AI Response:", responseContent);

    // Validate and parse the JSON response
    let mindMapData;
    try {
      // Clean the response content to remove any markdown formatting
      const cleanedContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      mindMapData = JSON.parse(cleanedContent);

      // Validate the structure
      if (!mindMapData.id || !mindMapData.text) {
        throw new Error("Invalid mind map structure: missing required fields");
      }

      console.log("Parsed mind map data:", mindMapData);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", responseContent);
      console.error("Parse error:", parseError);

      // Return a fallback structure
      mindMapData = {
        id: "root",
        text: title || "Generated Notes",
        children: [
          {
            id: "main1",
            text: "Main Topic 1",
            children: []
          },
          {
            id: "main2",
            text: "Main Topic 2",
            children: []
          }
        ]
      };
    }

    return NextResponse.json({ mindMap: mindMapData });
  } catch (error) {
    console.error("Error in /api/generateMindMap POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
