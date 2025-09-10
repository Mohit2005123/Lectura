import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { quizData, userAnswers, score } = await req.json();
    const percentageScore = (score / quizData.length) * 100;
    const quizSummary = quizData.map((question, index) => ({
      question: question.question,
      correctAnswer: question.options[question.correct],
      userAnswer:
        userAnswers[question.id] !== undefined
          ? question.options[userAnswers[question.id]]
          : "Not attempted",
      isCorrect: userAnswers[question.id] === question.correct,
    }));

    const systemPrompt = `You are an expert educational analyst and mentor with extensive experience in personalized learning assessment. Your task is to provide comprehensive, nuanced, and highly detailed feedback on quiz performance. Your analysis should be thorough and specific to the quiz content and student's response patterns.

Respond with **only raw JSON** data, without any additional comments, explanations, or text. Format your response as a JSON object with the following structure:

{
  "strengths": [
    "Detailed observation of a specific concept or topic where the student demonstrated strong understanding, citing specific questions as evidence",
    "Analysis of pattern recognition or problem-solving abilities shown in correct answers, with specific examples",
    "Identification of complex concepts successfully mastered, referencing specific question performance"
  ],
  "areasForImprovement": [
    "Detailed analysis of specific concept gaps or misconceptions, citing particular questions where errors occurred",
    "In-depth examination of any patterns in incorrect answers that suggest specific knowledge gaps",
    "Identification of specific skills or concept areas needing reinforcement, based on question-level analysis"
  ],
  "recommendations": [
    "Highly specific learning resource suggestion including topic, subtopic, and recommended approach to address identified gaps",
    "Detailed practice strategy targeting the most challenging concepts identified in the quiz",
    "Specific study technique recommendation based on the types of questions missed",
    "Concrete next steps for reinforcing successful learning patterns observed in correct answers"
  ],
  "summary": "A comprehensive 2-3 sentence analysis that ties together the observed strengths and areas for improvement, acknowledges specific achievements, and provides motivational direction for future learning. Include specific performance metrics and notable patterns in question responses."
}

Each array element should contain detailed, specific feedback directly related to the quiz content and performance patterns. Avoid generic statements. Instead, reference specific questions, topics, and patterns observed in the student's responses. The feedback should be actionable, constructive, and grounded in the actual quiz performance data.`;

    const userPrompt = `Here's the quiz performance data:
Total Score: ${score}/${quizData.length} (${percentageScore}%)
Detailed Question Analysis:
${JSON.stringify(quizSummary, null, 2)}
Please analyze this performance and provide structured feedback in raw JSON format.`;

    let retries = 20;
    let analysis = null;
    while (retries > 0) {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "openai/gpt-oss-120b",
      });
      try {
        analysis = JSON.parse(completion.choices[0].message.content);
        if (analysis) {
          break;
        }
      } catch (e) {
        console.warn(
          "Invalid JSON received, retrying...",
          completion.choices[0]?.message?.content
        );
        retries--;
      }
    }

    if (!analysis) {
      throw new Error("Failed to get valid JSON after multiple retries");
    }

    return new Response(JSON.stringify({ analysis }), { status: 200 });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze quiz results" }),
      { status: 500 }
    );
  }
}