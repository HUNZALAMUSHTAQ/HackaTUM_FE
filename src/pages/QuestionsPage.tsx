import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPreferenceById, updateQuestionAnswer } from '../services/api'
import { useApp } from '../context/AppContext'
import '../components/QuestionScreen.css'

export default function QuestionsPage() {
  const navigate = useNavigate()
  const { preference, setPreference, preferenceId } = useApp()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([])
  const [isFrustrated, setIsFrustrated] = useState(false)

  useEffect(() => {
    const fetchPreference = async () => {
      if (!preference && preferenceId) {
        console.log('Fetching preference in QuestionsPage:', preferenceId)
        try {
          const pref = await getPreferenceById(preferenceId)
          console.log('Preference fetched in QuestionsPage:', pref)
          setPreference(pref)
        } catch (err) {
          console.error('Error fetching preference:', err)
        }
      }
    }
    fetchPreference()
  }, [preference, preferenceId, setPreference])

  if (!preference) {
    return (
      <div className="question-screen">
        <div className="question-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading questions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!preference.questions || preference.questions.length === 0) {
    return (
      <div className="question-screen">
        <div className="question-container">
          <div className="completion-message">
            <div className="completion-icon">✓</div>
            <h2>No questions available</h2>
            <p>Redirecting to booking...</p>
          </div>
        </div>
      </div>
    )
  }

  const questions = preference.questions
  const unansweredIndex = questions.findIndex((q: any) => q.answer === null)
  const effectiveIndex = unansweredIndex >= 0 ? unansweredIndex : currentQuestionIndex

  useEffect(() => {
    if (unansweredIndex >= 0 && unansweredIndex !== currentQuestionIndex) {
      setCurrentQuestionIndex(unansweredIndex)
      setSelectedAnswer('')
      setIsFrustrated(false)
      setClickTimestamps([])
    }
  }, [unansweredIndex, currentQuestionIndex])

  const currentQuestion = questions[effectiveIndex] || questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const answeredQuestions = questions.filter((q: any) => q.answer !== null).length
  const progress = totalQuestions > 0 ? ((answeredQuestions + (selectedAnswer ? 1 : 0)) / totalQuestions) * 100 : 0

  useEffect(() => {
    const allAnswered = questions.every((q: any) => q.answer !== null)
    if (allAnswered && questions.length > 0 && currentQuestionIndex >= totalQuestions - 1) {
      setTimeout(() => {
        navigate('/booking')
      }, 1000)
    }
  }, [questions, currentQuestionIndex, totalQuestions, navigate])

  const handleAnswerSelect = (answer: string) => {
    // Prevent action if already submitting
    if (isSubmitting) {
      return
    }

    const now = Date.now()
    const recentClicks = clickTimestamps.filter(ts => now - ts < 1000) // Clicks within last 1 second
    const newClicks = [...recentClicks, now]
    setClickTimestamps(newClicks)
    
    // If 2 or more clicks within 1 second, mark as frustrated
    const shouldMarkFrustrated = newClicks.length >= 2
    if (shouldMarkFrustrated) {
      console.log('Rapid clicks detected, marking as frustrated')
      setIsFrustrated(true)
    }
    
    setSelectedAnswer(answer)
    setError(null)
    
    // Auto-submit after a short delay to show selection
    setTimeout(() => {
      handleSubmit(answer, shouldMarkFrustrated)
    }, 300)
  }

  const handleSubmit = async (answer?: string, frustrated: boolean = false) => {
    const answerToSubmit = answer || selectedAnswer
    
    if (!answerToSubmit) {
      setError('Please select an answer')
      return
    }

    if (!currentQuestion) {
      return
    }

    // Prevent double submission
    if (isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      const shouldMarkFrustrated = frustrated || isFrustrated
      console.log('Submitting answer:', { 
        questionId: currentQuestion.id, 
        answer: answerToSubmit,
        frustrated: shouldMarkFrustrated 
      })
      
      await updateQuestionAnswer(
        currentQuestion.id, 
        answerToSubmit,
        undefined, // answerScore
        undefined, // importance
        shouldMarkFrustrated
      )
      console.log('Answer submitted successfully')
      
      // Refresh preference to get updated questions
      if (preferenceId) {
        const updatedPref = await getPreferenceById(preferenceId)
        console.log('Updated preference:', updatedPref)
        setPreference(updatedPref)
        
        // Check if all questions are now answered
        if (updatedPref.questions) {
          const allAnswered = updatedPref.questions.every((q: any) => q.answer !== null)
          console.log('All questions answered:', allAnswered)
          
          if (allAnswered) {
            console.log('All questions completed, navigating to booking')
            setTimeout(() => {
              navigate('/booking')
            }, 1000)
            return
          }
        }
      }
      
      // Reset frustration state for next question
      setIsFrustrated(false)
      setClickTimestamps([])
      setSelectedAnswer('')
      
      // Find next unanswered question
      if (preference && preference.questions) {
        const nextUnansweredIndex = preference.questions.findIndex((q: any, idx: number) => 
          idx > currentQuestionIndex && q.answer === null
        )
        
        if (nextUnansweredIndex >= 0) {
          setCurrentQuestionIndex(nextUnansweredIndex)
        } else if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex(prev => prev + 1)
        }
      }
    } catch (err: any) {
      console.error('Error submitting answer:', err)
      setError(err.message || 'Failed to submit answer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    if (!currentQuestion) {
      navigate('/booking')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      console.log('Skipping question:', { 
        questionId: currentQuestion.id,
        frustrated: true 
      })
      
      // Mark current question as frustrated and skip
      await updateQuestionAnswer(
        currentQuestion.id, 
        '', // No answer
        undefined, // answerScore
        undefined, // importance
        true // frustrated
      )
      
      // Navigate to booking screen
      navigate('/booking')
    } catch (err: any) {
      console.error('Error skipping question:', err)
      // Even if error, navigate to booking
      navigate('/booking')
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
                  className={`option-button ${selectedAnswer === option ? 'selected' : ''} ${isSubmitting ? 'submitting' : ''}`}
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

          {isSubmitting && (
            <div className="submitting-indicator">
              <span className="button-spinner"></span>
              <span>Submitting...</span>
            </div>
          )}

          <div className="action-buttons">
            <button
              className="skip-button"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

