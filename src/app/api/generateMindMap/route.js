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
    1. Create a hierarchical structure with main topics as children of the root
    2. Each node should have a unique id, text content, and children array
    3. Organize the content logically with 2-4 main branches
    4. Each main branch should have 2-5 sub-branches
    5. Keep text concise but descriptive
    6. Return ONLY valid JSON, no additional text or formatting
    7. Use the provided title as the root text if available`;

    const userPrompt = `Create a mind map from this content:
    Title: ${title || "Generated Notes"}
    Content: ${JSON.stringify(videoData)}`;

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
