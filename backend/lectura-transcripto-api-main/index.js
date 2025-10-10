import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import getTranscript from "./generateTranscript.js";
import generateNotes from "./groqGenerate1.js";
import cors from "cors";
import ApiKeyManager from "./apiKeyManager.js";
// import generateNotes from "./gptGenerate.js";
dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json()); // To parse JSON body
app.use(cors()); // To enable CORS

// Initialize API key managers
// const groqKeyManager = new ApiKeyManager(JSON.parse(process.env.GROQ_API_KEY_JSON));
const transcriptKeyManager = new ApiKeyManager(JSON.parse(process.env.TRANSCRIPT_API_KEY_JSON));
const groqApiKey = process.env.GROQ_API_KEY;
// Updated key selection functions
// const getNextGroqKey = () => groqKeyManager.getNextKey();
const getNextTranscriptKey = () => transcriptKeyManager.getNextKey();

async function tryGetTranscript(link, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const apiKey = getNextTranscriptKey();
    try {
      const transcript = await getTranscript(link, apiKey);
      if (transcript) {
        return transcript;
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt === maxAttempts) {
        throw new Error('All transcript generation attempts failed');
      }
    }
  }
  return null;
}

// Route to handle POST requests
app.post("/api/generate", async (req, res) => {
  try {
    const { link, language } = req.body; // Extract the link from the request body
    // Validate the link
    if (!link) {
      return res.status(400).json({ message: "Link not provided" });
    }

    // Try to generate transcript with retries
    const transcript = await tryGetTranscript(link);
    if (!transcript) {
      return res.status(500).json({ message: "Transcript generation failed after multiple attempts" });
    }
    const notes = await generateNotes(groqApiKey, transcript, language);
    if (!notes) {
      return res.status(500).json({ message: "Notes generation from AI failed" });
    }
    res.status(200).json({
      message: "Successful",
      notes: notes,
      link: link,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});