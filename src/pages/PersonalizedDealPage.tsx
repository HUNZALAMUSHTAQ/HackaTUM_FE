import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAgenticSelectorRecords, getTaskStatus, getAvailableVehicles, AgenticSelectorRecord, Deal, TaskStatusResponse } from '../services/api'
import { useApp } from '../context/AppContext'
import VehicleCard from '../components/VehicleCard'
import './PersonalizedDealPage.css'

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

      // Check if task state is SUCCESS
      if (taskStatus.state === 'SUCCESS' || taskStatus.state === 'SUCCESSFUL') {
        setStatusMessage('Fetching your personalized deals...')
        
        // Extract agentic_selector_id from result
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
        
        // Fetch all records
        const allRecords = await getAgenticSelectorRecords(userId)
        console.log('All agentic selector records:', allRecords)
        
        // Filter by agentic_selector_id
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
        
        // Find the vehicle from vehiclesData or fetch from API
        if (filteredRecord.vehicle_id) {
          let vehicle: Deal | null = null
          
          // First try to find in existing vehiclesData
          if (vehiclesData?.deals) {
            vehicle = vehiclesData.deals.find((deal: Deal) => deal.vehicle.id === filteredRecord.vehicle_id) || null
          }
          
          // If not found, fetch from booking API
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
        
        // Clear polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        
        // Remove task_id from localStorage
        localStorage.removeItem('agenticTaskId')
      } else if (taskStatus.state === 'FAILURE' || taskStatus.state === 'FAILED' || taskStatus.state === 'ERROR') {
        setError(taskStatus.error || taskStatus.status || 'Task failed to complete')
        setLoading(false)
        
        // Clear polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      } else {
        // Task is still processing (PENDING, STARTED, etc.)
        setStatusMessage(`Processing your preferences... (${taskStatus.status || taskStatus.state})`)
      }
    } catch (err: any) {
      console.error('Error polling task status:', err)
      // Continue polling even if there's an error (might be temporary)
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
      // No task ID, try to fetch records directly
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

    // Wait 3 seconds before starting to poll
    const initialDelay = setTimeout(() => {
      setStatusMessage('Checking task status...')
      
      // Start polling immediately
      pollTaskStatus(taskId, userId)
      
      // Then poll every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollTaskStatus(taskId, userId)
      }, 2000)
    }, 3000)

    // Cleanup function
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
      // Navigate to best protection page - it will fetch the data there
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{statusMessage}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/vehicles')} className="retry-button">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="personalized-deal-page">
      <header className="deal-header">
        <button className="back-button" onClick={() => navigate('/vehicles')}>
          ← Back
        </button>
        <div className="header-content">
          <h1>Your Personalized Deal</h1>
          <p className="subtitle">AI-powered recommendation just for you</p>
        </div>
      </header>

      <main className="deal-main">
        {!selectedRecord ? (
          <div className="no-deals-message">
            <div className="no-deals-icon">🎯</div>
            <h2>No personalized deal available yet</h2>
            <p>We're still processing your preferences. Please check back soon!</p>
            <button onClick={() => navigate('/vehicles')} className="retry-button">
              Go Back to Vehicles
            </button>
          </div>
        ) : (
          <>
            {selectedVehicle ? (
              <>
                <div className="unlock-section">
                  <button
                    className="unlock-car-button"
                    onClick={handleUnlockCar}
                    disabled={unlocking}
                  >
                    {unlocking ? (
                      <>
                        <span className="button-spinner"></span>
                        Unlocking...
                      </>
                    ) : (
                      <>
                        🔓 Unlock the Car
                      </>
                    )}
                  </button>
                </div>

                <div className="personalized-content">
                  <div className="vehicle-section">
                    <VehicleCard
                      deal={selectedVehicle}
                      isLocked={false}
                      showUpgradeButton={true}
                    />
                  </div>

                  <div className="recommendation-section">
                    <div className="recommendation-card">
                      <h2 className="recommendation-title">Why This Vehicle?</h2>
                      <p className="recommendation-reason">{selectedRecord.REASON}</p>
                    </div>

                    {selectedRecord.FEATURES_BASED_ON_PREFERENCES && selectedRecord.FEATURES_BASED_ON_PREFERENCES.length > 0 && (
                      <div className="features-card">
                        <h3 className="features-title">Key Features</h3>
                        <ul className="features-list">
                          {selectedRecord.FEATURES_BASED_ON_PREFERENCES.map((feature, index) => (
                            <li key={index} className="feature-item">
                              <span className="feature-icon">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRecord.PERSUASIVE_MESSAGES_POINTS && selectedRecord.PERSUASIVE_MESSAGES_POINTS.length > 0 && (
                      <div className="messages-card">
                        <h3 className="messages-title">Why You'll Love It</h3>
                        <ul className="messages-list">
                          {selectedRecord.PERSUASIVE_MESSAGES_POINTS.map((message, index) => (
                            <li key={index} className="message-item">
                              <span className="message-icon">💡</span>
                              <span>{message}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

              </>
            ) : (
              <div className="no-vehicle-message">
                <p>Vehicle information is being loaded...</p>
                <p className="vehicle-id">Vehicle ID: {selectedRecord.vehicle_id}</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

