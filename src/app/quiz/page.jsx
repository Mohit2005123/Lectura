'use client';

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");  // Store URL input
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    
    // Log the URL to make sure it's being set properly
    console.log("URL being sent to the backend:", url);
  
    try {
      const response = await fetch("/api/generateQuiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: url }),  // Send 'link' here if backend expects 'link'
      });
  
      const data = await response.json();
      
      // Log the response for debugging
      console.log("API response:", data);
      
      if (response.ok) {
        setQuiz(data.quiz);
      } else {
        alert(data.message || "Failed to generate quiz.");
      }
    } catch (error) {
      alert("An error occurred while generating the quiz.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <h1>Quiz Generator</h1>
      <textarea
        value={url}
        onChange={(e) => setUrl(e.target.value)}  // Update URL state
        rows="6"
        cols="50"
        placeholder="Enter URL here to fetch content"
      />
      <br />
      <button onClick={generateQuiz} disabled={loading}>
        {loading ? "Generating Quiz..." : "Generate Quiz"}
      </button>
      <div style={{ marginTop: "20px" }}>
        <h2>Generated Quiz</h2>
        {quiz && Array.isArray(quiz) && quiz.length > 0 ? (
  <ul>
    {quiz.map((item, index) => (
      <li key={index}>
        <strong>Q{index + 1}:</strong> {item.question}
        <ul>
          {item.options.map((option, i) => (
            <li key={i}>{option}</li>
          ))}
        </ul>
        <p><strong>Correct Answer:</strong> {item.correctAnswer}</p>
      </li>
    ))}
  </ul>
) : (
  <p>No quiz found or failed to generate.</p>
)}

      </div>
    </div>
  );
}

