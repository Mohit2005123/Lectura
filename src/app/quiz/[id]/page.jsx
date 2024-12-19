'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { motion } from 'framer-motion'
import Navbar from '../../../components/landingpage/Navbar'
import { FiAward, FiCheck, FiX, FiCpu } from 'react-icons/fi'

export default function QuizPage() {
  const { id } = useParams()
  const [quizData, setQuizData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.post('/api/generateQuiz', { noteId: id })
        console.log(response.data.quizData);
        setQuizData(response.data.quizData)
        setIsLoading(false)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch quiz data. Please try again later.')
        setIsLoading(false)
      }
    }
    fetchQuizData()
  }, [id])

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let score = 0
    console.log(userAnswers);
    quizData.forEach((question, index) => {
      if (userAnswers[question.id] === question.correct) score++
    })
    return score
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await axios.post('/api/analyzeQuiz', {
        quizData,
        userAnswers,
        score: calculateScore()
      })
      setAnalysis(response.data.analysis)
    } catch (err) {
      console.error(err)
      setError('Failed to generate analysis. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading quiz...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        {error}
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white p-6 pt-24">
        <div className="max-w-2xl mx-auto">
          {!showResults ? (
            <motion.div 
              className="bg-[#111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="bg-[#1a1a1a] p-6 border-b border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-3xl font-bold tracking-tight">Quiz Challenge</h1>
                  <div className="bg-gray-800 px-4 py-2 rounded-full text-sm">
                    {currentQuestion + 1}/{quizData.length}
                  </div>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h2 className="text-2xl mb-8 font-semibold">
                  {quizData[currentQuestion].question}
                </h2>
                
                <div className="space-y-4">
                  {quizData[currentQuestion].options.map((option, index) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={option}
                      onClick={() => handleAnswerSelect(currentQuestion, index)}
                      className={`w-full text-left p-6 rounded-xl transition-all duration-300 ${
                        userAnswers[currentQuestion] === index
                          ? 'bg-white/15 border-2 border-white/30'
                          : 'bg-gray-900/50 hover:bg-white/10 border border-gray-800'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {currentQuestion === quizData.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(prev => Math.min(quizData.length - 1, prev + 1))}
                      className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
                    >
                      Next
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111] border border-gray-800 rounded-2xl p-8"
            >
              <div className="text-center mb-8">
                <FiAward className="text-6xl mx-auto mb-6 text-yellow-500" />
                <h2 className="text-3xl font-bold mb-6">Quiz Complete!</h2>
                <div className="text-8xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
                  {calculateScore()}/{quizData.length}
                </div>
                <div className="mb-8">
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FiCheck className="text-green-500" />
                      <span>Correct: {calculateScore()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiX className="text-red-500" />
                      <span>Incorrect: {quizData.length - calculateScore()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {!analysis ? (
                <div className="mb-8">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 w-full disabled:opacity-50"
                  >
                    <FiCpu className="text-xl" />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Using AI'}</span>
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="bg-gray-900/50 p-6 rounded-xl space-y-4">
                    <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">
                      AI Analysis Report
                    </h3>
                    
                    <div>
                      <h4 className="text-green-400 font-medium mb-2">Strengths</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index} className="text-gray-300">{strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-yellow-400 font-medium mb-2">Areas for Improvement</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.areasForImprovement.map((area, index) => (
                          <li key={index} className="text-gray-300">{area}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-blue-400 font-medium mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-300">{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-200">{analysis.summary}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-6 mt-8">
                <h3 className="text-2xl font-semibold mb-4">Detailed Review</h3>
                {quizData.map((question, qIndex) => (
                  <div key={qIndex} className="bg-gray-900/50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => {
                        const isCorrect = oIndex === question.correct;
                        const isSelected = userAnswers[question.id] === oIndex;
                        const notAttempted = userAnswers[question.id] === undefined;

                        let bgColor = "bg-gray-800/50";
                        if (isSelected && isCorrect) bgColor = "bg-green-500/20 border-green-500";
                        else if (isSelected && !isCorrect) bgColor = "bg-red-500/20 border-red-500";
                        else if (isCorrect) bgColor = "bg-green-500/20 border-green-500";

                        return (
                          <div
                            key={oIndex}
                            className={`p-4 rounded-lg border ${bgColor} flex items-center justify-between`}
                          >
                            <span>{option}</span>
                            {isCorrect && <FiCheck className="text-green-500" />}
                            {isSelected && !isCorrect && <FiX className="text-red-500" />}
                          </div>
                        );
                      })}
                    </div>
                    {userAnswers[question.id] === undefined && (
                      <div className="mt-2 text-yellow-500 text-sm">Not attempted</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-opacity"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}