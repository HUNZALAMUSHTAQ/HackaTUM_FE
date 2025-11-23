import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser, createUserPreference, getPreferenceById } from '../services/api'
import { useApp } from '../context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, AlertCircle, Clock } from 'lucide-react'

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
      
      if (pref.status === 'generating' || pref.status === 'pending') {
        console.log(`Preference status is ${pref.status}, polling again... (retry ${retryCount + 1}/15)`)
        if (retryCount < 15) {
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
      localStorage.setItem('userId', createdUser.id.toString())
      localStorage.setItem('userData', JSON.stringify(createdUser))
      
      const preferenceResponse = await createUserPreference(createdUser.id)
      console.log('Preference created:', preferenceResponse)
      setPreferenceId(preferenceResponse.id)
      
      await checkPreferenceStatus(preferenceResponse.id)
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl">Create Your Profile</CardTitle>
          <CardDescription className="text-xs">
            Tell us about yourself to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-semibold">Basic Information</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  className="h-8 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-xs">
                    Age <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="30"
                    min="0"
                    required
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="h-8 text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Munich"
                  required
                  disabled={isLoading}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-semibold">Preferences (Optional)</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="driving_style" className="text-xs">Driving Style</Label>
                <Select
                  id="driving_style"
                  name="driving_style"
                  value={formData.driving_style}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-8 text-sm"
                >
                  <option value="">Select driving style</option>
                  <option value="sporty">Sporty</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="balanced">Balanced</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel_preference" className="text-xs">Fuel Preference</Label>
                <Select
                  id="fuel_preference"
                  name="fuel_preference"
                  value={formData.fuel_preference}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-8 text-sm"
                >
                  <option value="">Select fuel preference</option>
                  <option value="petrol">Petrol</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget_sensitivity" className="text-xs">Budget Sensitivity</Label>
                  <Select
                    id="budget_sensitivity"
                    name="budget_sensitivity"
                    value={formData.budget_sensitivity}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-8 text-sm"
                  >
                    <option value="">Select sensitivity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_tolerance" className="text-xs">Risk Tolerance</Label>
                  <Select
                    id="risk_tolerance"
                    name="risk_tolerance"
                    value={formData.risk_tolerance}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-8 text-sm"
                  >
                    <option value="">Select tolerance</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {isCheckingPreference && (
              <div className="flex items-center gap-2 p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-md">
                <Clock className="h-4 w-4" />
                <span>Checking for questions...</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-9"
              disabled={isLoading || isCheckingPreference}
            >
              {isLoading || isCheckingPreference ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLoading ? 'Creating Profile...' : 'Checking Preferences...'}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
