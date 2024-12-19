"use client";
import { useState } from "react";
import { generateGroqResponse } from "@/app/api/chat/generateresponse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, Send } from "lucide-react";

export default function ChatBox({ userNotes}) { // Default to an empty array
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]); // Store messages
  const [userNote, setUserNote] = useState(""); // Store user-submitted notes
  const [loading, setLoading] = useState(false); // Loading state for API requests

  // Handle note input changes
  const handleNoteChange = (event) => {
    setUserNote(event.target.value);
  };

  // Handle form submission for notes
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userNote.trim()) return; // Avoid sending empty notes

    // Add the user's note to the chat
    const newMessages = [...messages, { role: "user", content: userNote }];
    setMessages(newMessages);
    setUserNote(""); // Clear input
    setLoading(true); // Start loading state

    try {
      // Prepare the context with the current chat history and notes
      const context = {
        chatHistory: newMessages,
        notes: userNotes, // Include userNotes passed as props
      };

      console.log("Request context:", context);

      // Generate Groq response
      const response = await generateGroqResponse(context);

      const assistantMessage = typeof response === "object" ? response.message : response;

      // Add AI response to chat
      setMessages([...newMessages, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong!" }]);
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <Card
      className={`fixed bg-white bottom-4 right-4 w-80 transition-all duration-300 ease-in-out ${
        isExpanded ? "h-[80vh]" : "h-14"
      }`}
    >
      <CardHeader
        className="p-3 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-lg">AI Chat</CardTitle>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </CardHeader>
      {isExpanded && (
        <>
          <CardContent>
            <ScrollArea className="h-[calc(80vh-8rem)] w-full pr-4">
              {messages.map((m, index) => (
                <div key={index} className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}>
                  <span
                    className={`inline-block p-2 rounded-lg ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {m.content}
                  </span>
                </div>
              ))}
              {loading && <div className="text-gray-500 text-center">AI is typing...</div>}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Input
                value={userNote}
                onChange={handleNoteChange}
                placeholder="Type a note..."
                className="flex-grow"
                disabled={loading} // Disable input during loading
              />
              <Button type="submit" size="icon" disabled={loading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  );
}







