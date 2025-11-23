import { useState, useEffect } from 'react'
import { PreferenceResponse } from '../services/api'
import './QuestionScreen.css'

interface QuestionScreenProps {
  preference: PreferenceResponse
  onAnswerQuestion: (questionId: number, answer: string) => Promise<void>
  onComplete: () => void
}

export default function QuestionScreen({ preference, onAnswerQuestion, onComplete }: QuestionScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const questions = preference.questions || []
  
  // Find the first unanswered question
  const unansweredIndex = questions.findIndex((q: any) => q.answer === null)
  const effectiveIndex = unansweredIndex >= 0 ? unansweredIndex : currentQuestionIndex
  
  // Update current question index if preference was updated
  useEffect(() => {
    if (unansweredIndex >= 0 && unansweredIndex !== currentQuestionIndex) {
      setCurrentQuestionIndex(unansweredIndex)
      setSelectedAnswer('')
    }
  }, [unansweredIndex, currentQuestionIndex])
  
  const currentQuestion = questions[effectiveIndex] || questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const answeredQuestions = questions.filter((q: any) => q.answer !== null).length
  const progress = totalQuestions > 0 ? ((answeredQuestions + (selectedAnswer ? 1 : 0)) / totalQuestions) * 100 : 0

  useEffect(() => {
    // Check if all questions are answered
    const allAnswered = questions.every((q: any) => q.answer !== null)
    if (allAnswered && questions.length > 0 && currentQuestionIndex >= totalQuestions - 1) {
      // Small delay to show completion
      setTimeout(() => {
        onComplete()
      }, 1000)
    }
  }, [questions, currentQuestionIndex, totalQuestions, onComplete])

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      setError('Please select an answer')
      return
    }

    if (!currentQuestion) {
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      await onAnswerQuestion(currentQuestion.id, selectedAnswer)
      
      // Reset selection for next question
      setSelectedAnswer('')
      
      // Move to next question if available
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentQuestion) {
    return (
      <div className="question-screen">
        <div className="question-container">
          <div className="completion-message">
            <div className="completion-icon">✓</div>
            <h2>All questions completed!</h2>
            <p>Preparing your personalized recommendations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="question-screen">
      <div className="question-container">
        <div className="question-header">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="question-counter">
            Question {effectiveIndex + 1} of {totalQuestions}
          </div>
        </div>

        <div className="question-content">
          <div className="question-category">
            {currentQuestion.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
          
          <h2 className="question-text">{currentQuestion.question}</h2>

          <div className="options-container">
            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${selectedAnswer === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isSubmitting}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="no-options">No options available for this question</div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            className="submit-answer-button"
            onClick={handleSubmit}
            disabled={!selectedAnswer || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                Submitting...
              </>
            ) : currentQuestionIndex < totalQuestions - 1 ? (
              <>
                Next Question
                <span className="button-arrow">→</span>
              </>
            ) : (
              <>
                Complete
                <span className="button-check">✓</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

