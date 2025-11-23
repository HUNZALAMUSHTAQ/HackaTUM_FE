import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPreferenceById, updateQuestionAnswer } from '../services/api'
import { useApp } from '../context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!preference.questions || preference.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-lg font-semibold mb-2">No questions available</h2>
            <p className="text-sm text-muted-foreground">Redirecting to booking...</p>
          </CardContent>
        </Card>
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
    if (isSubmitting) {
      return
    }

    const now = Date.now()
    const recentClicks = clickTimestamps.filter(ts => now - ts < 1000)
    const newClicks = [...recentClicks, now]
    setClickTimestamps(newClicks)
    
    const shouldMarkFrustrated = newClicks.length >= 2
    if (shouldMarkFrustrated) {
      console.log('Rapid clicks detected, marking as frustrated')
      setIsFrustrated(true)
    }
    
    setSelectedAnswer(answer)
    setError(null)
    
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
        undefined,
        undefined,
        shouldMarkFrustrated
      )
      console.log('Answer submitted successfully')
      
      if (preferenceId) {
        const updatedPref = await getPreferenceById(preferenceId)
        console.log('Updated preference:', updatedPref)
        setPreference(updatedPref)
        
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
      
      setIsFrustrated(false)
      setClickTimestamps([])
      setSelectedAnswer('')
      
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
      
      await updateQuestionAnswer(
        currentQuestion.id, 
        '',
        undefined,
        undefined,
        true
      )
      
      navigate('/booking')
    } catch (err: any) {
      console.error('Error skipping question:', err)
      navigate('/booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-lg font-semibold mb-2">All questions completed!</h2>
            <p className="text-sm text-muted-foreground">Preparing your personalized recommendations...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3 pb-4">
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Question {effectiveIndex + 1} of {totalQuestions}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                {currentQuestion.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <h2 className="text-lg font-semibold leading-tight">{currentQuestion.question}</h2>
            </div>

            <div className="space-y-2">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className="w-full h-9 justify-start text-sm"
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isSubmitting}
                  >
                    {option}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No options available for this question</p>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting...</span>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full h-8 text-xs"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip Questions
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
