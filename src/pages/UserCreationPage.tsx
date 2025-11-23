import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser, createUserPreference, getPreferenceById } from '../services/api'
import { useApp } from '../context/AppContext'
import '../components/UserCreationScreen.css'

export default function UserCreationPage() {
  const navigate = useNavigate()
  const { setUser, setPreferenceId, setPreference } = useApp()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    driving_style: '',
    fuel_preference: '',
    budget_sensitivity: '',
    risk_tolerance: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingPreference, setIsCheckingPreference] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const checkPreferenceStatus = async (prefId: number, retryCount = 0) => {
    try {
      setIsCheckingPreference(true)
      console.log(`Checking preference status for ID: ${prefId}, retry: ${retryCount}`)
      const pref = await getPreferenceById(prefId)
      console.log('Preference fetched:', pref)
      console.log('Preference status:', pref.status)
      console.log('Questions count:', pref.questions?.length || 0)
      setPreference(pref)
      
      // Check if status is completed and has questions
      if (pref.status === 'completed') {
        console.log('Preference status is completed')
        if (pref.questions && pref.questions.length > 0) {
          console.log(`Found ${pref.questions.length} questions`)
          const unansweredQuestions = pref.questions.filter((q: any) => q.answer === null)
          console.log(`Unanswered questions: ${unansweredQuestions.length}`)
          
          if (unansweredQuestions.length > 0) {
            console.log('Navigating to questions page')
            setIsCheckingPreference(false)
            navigate('/questions')
            return
          } else {
            console.log('All questions answered, navigating to booking')
            setIsCheckingPreference(false)
            navigate('/booking')
            return
          }
        } else {
          console.log('No questions found, navigating to booking')
          setIsCheckingPreference(false)
          navigate('/booking')
          return
        }
      } 
      
      // If status is generating or pending, poll again
      if (pref.status === 'generating' || pref.status === 'pending') {
        console.log(`Preference status is ${pref.status}, polling again... (retry ${retryCount + 1}/15)`)
        if (retryCount < 15) { // Increased retries
          setTimeout(() => {
            checkPreferenceStatus(prefId, retryCount + 1)
          }, 2000)
        } else {
          console.log('Max retries reached, navigating to booking')
          setIsCheckingPreference(false)
          navigate('/booking')
        }
        return
      }
      
      // Default: navigate to booking
      console.log('Default case: navigating to booking')
      setIsCheckingPreference(false)
      navigate('/booking')
    } catch (err: any) {
      console.error('Error checking preference status:', err)
      setIsCheckingPreference(false)
      navigate('/booking')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.age || !formData.gender || !formData.location) {
      setError('Please fill in all required fields')
      return
    }

    const age = parseInt(formData.age)
    if (isNaN(age) || age < 0) {
      setError('Please enter a valid age')
      return
    }

    try {
      setIsLoading(true)
      
      const createdUser = await createUser({
        name: formData.name,
        age,
        gender: formData.gender,
        location: formData.location,
        driving_style: formData.driving_style || undefined,
        fuel_preference: formData.fuel_preference || undefined,
        budget_sensitivity: formData.budget_sensitivity || undefined,
        risk_tolerance: formData.risk_tolerance || undefined,
      })
      
      setUser(createdUser)
      // Save user ID to localStorage
      localStorage.setItem('userId', createdUser.id.toString())
      localStorage.setItem('userData', JSON.stringify(createdUser))
      
      const preferenceResponse = await createUserPreference(createdUser.id)
      console.log('Preference created:', preferenceResponse)
      setPreferenceId(preferenceResponse.id)
      
      // Start checking preference status
      await checkPreferenceStatus(preferenceResponse.id)
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="user-creation-screen">
      <div className="user-creation-container">
        <div className="user-creation-header">
          <h1>Create Your Profile</h1>
          <p className="subtitle">Tell us about yourself to get personalized recommendations</p>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age <span className="required">*</span></label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="30"
                  min="0"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender <span className="required">*</span></label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location <span className="required">*</span></label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Munich"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Preferences (Optional)</h3>
            
            <div className="form-group">
              <label htmlFor="driving_style">Driving Style</label>
              <select
                id="driving_style"
                name="driving_style"
                value={formData.driving_style}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select driving style</option>
                <option value="sporty">Sporty</option>
                <option value="relaxed">Relaxed</option>
                <option value="balanced">Balanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fuel_preference">Fuel Preference</label>
              <select
                id="fuel_preference"
                name="fuel_preference"
                value={formData.fuel_preference}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select fuel preference</option>
                <option value="petrol">Petrol</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget_sensitivity">Budget Sensitivity</label>
                <select
                  id="budget_sensitivity"
                  name="budget_sensitivity"
                  value={formData.budget_sensitivity}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select sensitivity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="risk_tolerance">Risk Tolerance</label>
                <select
                  id="risk_tolerance"
                  name="risk_tolerance"
                  value={formData.risk_tolerance}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select tolerance</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {isCheckingPreference && (
            <div className="info-message">
              <span className="info-icon">⏳</span>
              <span>Checking for questions...</span>
            </div>
          )}

          <button
            type="submit"
            className="create-user-button"
            disabled={isLoading || isCheckingPreference}
          >
            {isLoading || isCheckingPreference ? (
              <>
                <span className="button-spinner"></span>
                {isLoading ? 'Creating Profile...' : 'Checking Preferences...'}
              </>
            ) : (
              <>
                <span className="button-icon">✓</span>
                Create Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

