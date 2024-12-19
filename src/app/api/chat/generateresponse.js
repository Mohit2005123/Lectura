import axios from "axios";

// Set up your API client for Groq
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Corrected endpoint for local dev

export const generateGroqResponse = async (
  context = {}, // Default context to an empty object
  model = "llama-3.1-8b-instant"
) => {
  try {
   
    // Safely destructure chatHistory and notes with defaults
    const { chatHistory = [], notes = [] } = context;

    // Combine chat history and notes into a single message list (context)
    const messages = [
      ...chatHistory, // Include chat history messages
      ...notes.map((note) => ({
        role: "assistant",
        content: `Title: ${note.title}\nContent: ${note.content}`, // Format the notes for context
      })),
    ];

    // Log the combined messages for debugging purposes
    console.log("Sending combined messages:", messages);

    // Send the combined context to the API
    const response = await axios.post(
      '/api/chat',
      {
        model: model, // Use the dynamic model parameter
        messages: messages, // Send combined messages (chat + notes)
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`, // Ensure the key is set in env
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response data structure is as expected
    if (response.data && response.data.message) {
      // Successfully parse and return the response content
      return {
        success: true,
        message: response.data.message, // Assuming message contains the AI response
      };
    } else {
      console.error("Unexpected response structure:", response.data);
      return {
        success: false,
        message: "No valid response from the AI model. Please try again.",
      };
    }
  } catch (error) {
    console.log(context)
    console.error("Error fetching Groq response:", error.message || error);
    return {
      success: false,
      message: "Sorry, something went wrong! Please try again later.",
    };
  }
};





  
