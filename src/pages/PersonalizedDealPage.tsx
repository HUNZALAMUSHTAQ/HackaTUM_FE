import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAgenticSelectorRecords, getTaskStatus, getAvailableVehicles, AgenticSelectorRecord, Deal, TaskStatusResponse } from '../services/api'
import { useApp } from '../context/AppContext'
import VehicleCard from '../components/VehicleCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Unlock, Loader2, AlertCircle, Sparkles, Check, Lightbulb } from 'lucide-react'

export default function PersonalizedDealPage() {
  const navigate = useNavigate()
  const { user, vehiclesData, bookingDetails } = useApp()
  const [records, setRecords] = useState<AgenticSelectorRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<AgenticSelectorRecord | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('Preparing your personalized deals...')
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getUserId = () => {
    if (user?.id) {
      return user.id
    }
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      return parseInt(storedUserId, 10)
    }
    return null
  }

  const pollTaskStatus = async (taskId: string, userId: number) => {
    try {
      const taskStatus = await getTaskStatus(taskId)
      console.log('Task status:', taskStatus)

      if (taskStatus.state === 'SUCCESS' || taskStatus.state === 'SUCCESSFUL') {
        setStatusMessage('Fetching your personalized deals...')
        
        const agenticSelectorId = taskStatus.result?.agentic_selector_id
        console.log('Agentic selector ID from task result:', agenticSelectorId)
        
        if (!agenticSelectorId) {
          setError('No agentic selector ID found in task result')
          setLoading(false)
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          localStorage.removeItem('agenticTaskId')
          return
        }
        
        const allRecords = await getAgenticSelectorRecords(userId)
        console.log('All agentic selector records:', allRecords)
        
        const filteredRecord = allRecords.find(record => record.id === agenticSelectorId)
        console.log('Filtered record by ID:', filteredRecord)
        
        if (!filteredRecord) {
          setError(`No record found with agentic selector ID: ${agenticSelectorId}`)
          setLoading(false)
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          localStorage.removeItem('agenticTaskId')
          return
        }
        
        setSelectedRecord(filteredRecord)
        setRecords(allRecords)
        
        if (filteredRecord.vehicle_id) {
          let vehicle: Deal | null = null
          
          if (vehiclesData?.deals) {
            vehicle = vehiclesData.deals.find((deal: Deal) => deal.vehicle.id === filteredRecord.vehicle_id) || null
          }
          
          if (!vehicle) {
            const bookingId = bookingDetails?.id || localStorage.getItem('bookingId')
            if (bookingId) {
              try {
                setStatusMessage('Fetching vehicle details...')
                const vehiclesResponse = await getAvailableVehicles(bookingId)
                vehicle = vehiclesResponse.deals.find((deal: Deal) => deal.vehicle.id === filteredRecord.vehicle_id) || null
                console.log('Fetched vehicle from API:', vehicle)
              } catch (err) {
                console.error('Error fetching vehicles:', err)
              }
            }
          }
          
          if (vehicle) {
            setSelectedVehicle(vehicle)
            console.log('Found vehicle for personalized deal:', vehicle)
          } else {
            console.warn('Vehicle not found with ID:', filteredRecord.vehicle_id)
          }
        }
        
        setLoading(false)
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        
        localStorage.removeItem('agenticTaskId')
      } else if (taskStatus.state === 'FAILURE' || taskStatus.state === 'FAILED' || taskStatus.state === 'ERROR') {
        setError(taskStatus.error || taskStatus.status || 'Task failed to complete')
        setLoading(false)
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      } else {
        setStatusMessage(`Processing your preferences... (${taskStatus.status || taskStatus.state})`)
      }
    } catch (err: any) {
      console.error('Error polling task status:', err)
    }
  }

  useEffect(() => {
    const userId = getUserId()
    if (!userId) {
      setError('No user found. Please create a user first.')
      setLoading(false)
      return
    }

    const taskId = localStorage.getItem('agenticTaskId')
    
    if (!taskId) {
      const fetchRecords = async () => {
        try {
          setLoading(true)
          setError(null)
          const data = await getAgenticSelectorRecords(userId)
          setRecords(data)
        } catch (err: any) {
          setError(err.message || 'Failed to load personalized deals')
        } finally {
          setLoading(false)
        }
      }
      fetchRecords()
      return
    }

    const initialDelay = setTimeout(() => {
      setStatusMessage('Checking task status...')
      
      pollTaskStatus(taskId, userId)
      
      pollingIntervalRef.current = setInterval(() => {
        pollTaskStatus(taskId, userId)
      }, 2000)
    }, 3000)

    return () => {
      clearTimeout(initialDelay)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [user])

  const handleUnlockCar = async () => {
    const userId = getUserId()

    if (!userId) {
      alert('No user found. Please create a user first.')
      return
    }

    try {
      setUnlocking(true)
      navigate('/best-protection')
    } catch (err: any) {
      console.error('Error navigating to unlock:', err)
      alert(`Failed to unlock: ${err.message}`)
    } finally {
      setUnlocking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground text-center">{statusMessage}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-lg font-semibold">Error</h2>
            <p className="text-sm text-muted-foreground text-center">{error}</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/vehicles')}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate('/vehicles')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                Your Personalized Deal
              </h1>
              <p className="text-xs opacity-90 mt-1">AI-powered recommendation just for you</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {!selectedRecord ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-4xl">🎯</div>
              <h2 className="text-lg font-semibold">No personalized deal available yet</h2>
              <p className="text-sm text-muted-foreground text-center">
                We're still processing your preferences. Please check back soon!
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/vehicles')}>
                Go Back to Vehicles
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {selectedVehicle ? (
              <>
                <div className="flex justify-center mb-6">
                  <Button
                    size="lg"
                    className="h-10 gap-2"
                    onClick={handleUnlockCar}
                    disabled={unlocking}
                  >
                    {unlocking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4" />
                        Unlock the Car
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <VehicleCard
                      deal={selectedVehicle}
                      isLocked={false}
                      showUpgradeButton={true}
                    />
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Why This Vehicle?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedRecord.REASON}</p>
                      </CardContent>
                    </Card>

                    {selectedRecord.FEATURES_BASED_ON_PREFERENCES && selectedRecord.FEATURES_BASED_ON_PREFERENCES.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Key Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedRecord.FEATURES_BASED_ON_PREFERENCES.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {selectedRecord.PERSUASIVE_MESSAGES_POINTS && selectedRecord.PERSUASIVE_MESSAGES_POINTS.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Why You'll Love It
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedRecord.PERSUASIVE_MESSAGES_POINTS.map((message, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{message}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-2">
                  <p className="text-sm text-muted-foreground">Vehicle information is being loaded...</p>
                  <Badge variant="outline" className="text-xs">
                    Vehicle ID: {selectedRecord.vehicle_id}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
