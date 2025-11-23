import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getProtectionPackages, 
  trackProtectionPlan, 
  assignProtectionPackage,
  getAvailableVehicles,
  callAgenticSelector,
  ProtectionPackage, 
  ProtectionBehavior 
} from '../services/api'
import { useApp } from '../context/AppContext'
import './ProtectionPage.css'

export default function ProtectionPage() {
  const navigate = useNavigate()
  const { bookingDetails, user } = useApp()
  const [packages, setPackages] = useState<ProtectionPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [behaviors, setBehaviors] = useState<ProtectionBehavior[]>([])
  const [expandedStates, setExpandedStates] = useState<Record<string, {
    price: boolean
    includes: boolean
    excludes: boolean
    description: boolean
  }>>({})
  const timeTrackingRef = useRef<Record<string, { startTime: number; isSelected: boolean }>>({})
  const [isProceeding, setIsProceeding] = useState(false)

  // Get booking ID from context or localStorage
  const getBookingId = () => {
    if (bookingDetails?.id) {
      return bookingDetails.id
    }
    const storedBookingId = localStorage.getItem('bookingId')
    if (storedBookingId) {
      return storedBookingId
    }
    return null
  }

  // Get user ID from context or localStorage
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

  useEffect(() => {
    const bookingId = getBookingId()
    if (bookingId) {
      const fetchData = async () => {
        try {
          setLoading(true)
          setError(null)
          const data = await getProtectionPackages(bookingId)
          setPackages(data.protectionPackages)
          
          // Set initially selected package
          const initiallySelected = data.protectionPackages.find(pkg => pkg.isSelected)
          if (initiallySelected) {
            setSelectedPackageId(initiallySelected.id)
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load protection packages')
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    } else {
      setError('No booking found. Please create a booking first.')
      setLoading(false)
    }
  }, [bookingDetails])

  useEffect(() => {
    // Initialize behavior tracking for each package
    if (packages.length > 0 && behaviors.length === 0) {
      const initialBehaviors = packages.map(pkg => ({
        protectionPackageId: pkg.id,
        clickedIncludes: 0,
        clickedUnIncludes: 0,
        clickedPriceDistribution: 0,
        clickedDescription: 0,
        timeSpendSelected: 0,
        Unselected: 0,
        Selected: 0,
      }))
      setBehaviors(initialBehaviors)
      
      // Initialize expanded states
      const initialExpanded: Record<string, any> = {}
      packages.forEach(pkg => {
        initialExpanded[pkg.id] = {
          price: false,
          includes: false,
          excludes: false,
          description: false,
        }
      })
      setExpandedStates(initialExpanded)
    }
  }, [packages])

  useEffect(() => {
    // Track time when package is selected
    packages.forEach(pkg => {
      const isSelected = selectedPackageId === pkg.id
      const tracking = timeTrackingRef.current[pkg.id]
      
      if (isSelected && !tracking?.isSelected) {
        // Package just got selected
        timeTrackingRef.current[pkg.id] = {
          startTime: Date.now(),
          isSelected: true,
        }
      } else if (!isSelected && tracking?.isSelected) {
        // Package just got unselected
        const timeSpent = Date.now() - tracking.startTime
        updateBehavior(pkg.id, 'timeSpendSelected', timeSpent)
        timeTrackingRef.current[pkg.id] = {
          startTime: 0,
          isSelected: false,
        }
      }
    })

    // Cleanup on unmount - save any remaining time
    return () => {
      Object.keys(timeTrackingRef.current).forEach(pkgId => {
        const tracking = timeTrackingRef.current[pkgId]
        if (tracking?.isSelected) {
          const timeSpent = Date.now() - tracking.startTime
          updateBehavior(pkgId, 'timeSpendSelected', timeSpent)
        }
      })
    }
  }, [selectedPackageId, packages])

  const updateBehavior = (packageId: string, field: keyof ProtectionBehavior, value: number) => {
    setBehaviors(prev => {
      const updated = prev.map(behavior => {
        if (behavior.protectionPackageId === packageId) {
          const newValue = field === 'timeSpendSelected' 
            ? (behavior[field] as number) + value 
            : (behavior[field] as number) + 1
          return { ...behavior, [field]: newValue }
        }
        return behavior
      })
      console.log('Behavior Data:', JSON.stringify(updated, null, 2))
      return updated
    })
  }

  const handleTogglePrice = (packageId: string) => {
    const isExpanded = expandedStates[packageId]?.price || false
    setExpandedStates(prev => ({
      ...prev,
      [packageId]: { ...prev[packageId], price: !isExpanded }
    }))
    updateBehavior(packageId, 'clickedPriceDistribution', 1)
  }

  const handleToggleIncludes = (packageId: string) => {
    const isExpanded = expandedStates[packageId]?.includes || false
    setExpandedStates(prev => ({
      ...prev,
      [packageId]: { ...prev[packageId], includes: !isExpanded }
    }))
    if (isExpanded) {
      updateBehavior(packageId, 'clickedUnIncludes', 1)
    } else {
      updateBehavior(packageId, 'clickedIncludes', 1)
    }
  }

  const handleToggleExcludes = (packageId: string) => {
    const isExpanded = expandedStates[packageId]?.excludes || false
    setExpandedStates(prev => ({
      ...prev,
      [packageId]: { ...prev[packageId], excludes: !isExpanded }
    }))
    if (isExpanded) {
      updateBehavior(packageId, 'clickedUnIncludes', 1)
    } else {
      updateBehavior(packageId, 'clickedIncludes', 1)
    }
  }

  const handleToggleDescription = (packageId: string) => {
    const isExpanded = expandedStates[packageId]?.description || false
    setExpandedStates(prev => ({
      ...prev,
      [packageId]: { ...prev[packageId], description: !isExpanded }
    }))
    updateBehavior(packageId, 'clickedDescription', 1)
  }

  const handleSelectPackage = (packageId: string) => {
    const previousSelected = selectedPackageId
    
    if (previousSelected === packageId) {
      // Unselecting
      updateBehavior(packageId, 'Unselected', 1)
      setSelectedPackageId(null)
    } else {
      // Selecting new package
      if (previousSelected) {
        updateBehavior(previousSelected, 'Unselected', 1)
      }
      updateBehavior(packageId, 'Selected', 1)
      setSelectedPackageId(packageId)
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleBack = async () => {
    // Save time for currently selected package before leaving
    if (selectedPackageId) {
      const tracking = timeTrackingRef.current[selectedPackageId]
      if (tracking?.isSelected) {
        const timeSpent = Date.now() - tracking.startTime
        updateBehavior(selectedPackageId, 'timeSpendSelected', timeSpent)
      }
    }

    // Wait a bit for state to update
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get booking ID and user ID from context or localStorage
    const bookingId = getBookingId()
    const userId = getUserId()

    // Send tracking data for all packages
    if (behaviors.length > 0 && bookingId && userId) {
      try {
        const trackingPromises = behaviors.map(behavior => 
          trackProtectionPlan({
            BookingId: bookingId,
            UserId: userId,
            protectionPackageId: behavior.protectionPackageId,
            Selected: behavior.Selected,
            Unselected: behavior.Unselected,
            clickedDescription: behavior.clickedDescription,
            clickedIncludes: behavior.clickedIncludes,
            clickedUnIncludes: behavior.clickedUnIncludes,
            clickedPriceDistribution: behavior.clickedPriceDistribution,
            timeSpendSelected: behavior.timeSpendSelected,
          })
        )
        
        await Promise.all(trackingPromises)
        console.log('All protection plan tracking data sent successfully')
      } catch (err: any) {
        console.error('Error sending tracking data:', err)
        // Still navigate even if tracking fails
      }
    } else {
      console.warn('Missing booking ID or user ID. Booking ID:', bookingId, 'User ID:', userId)
    }
    
    navigate('/vehicles')
  }

  const handleProceedToUnlock = async () => {
    const bookingId = getBookingId()
    const userId = getUserId()

    if (!bookingId || !userId) {
      alert('No booking or user found. Please create a booking first.')
      return
    }

    if (!selectedPackageId) {
      alert('Please select a protection package first.')
      return
    }

    try {
      setIsProceeding(true)

      // 0. Finalize time tracking and send behavior data
      // Save time for currently selected package before leaving
      if (selectedPackageId) {
        const tracking = timeTrackingRef.current[selectedPackageId]
        if (tracking?.isSelected) {
          const timeSpent = Date.now() - tracking.startTime
          updateBehavior(selectedPackageId, 'timeSpendSelected', timeSpent)
        }
      }

      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 100))

      // Send tracking data for all packages
      if (behaviors.length > 0) {
        try {
          const trackingPromises = behaviors.map(behavior => 
            trackProtectionPlan({
              BookingId: bookingId,
              UserId: userId,
              protectionPackageId: behavior.protectionPackageId,
              Selected: behavior.Selected,
              Unselected: behavior.Unselected,
              clickedDescription: behavior.clickedDescription,
              clickedIncludes: behavior.clickedIncludes,
              clickedUnIncludes: behavior.clickedUnIncludes,
              clickedPriceDistribution: behavior.clickedPriceDistribution,
              timeSpendSelected: behavior.timeSpendSelected,
            })
          )
          
          await Promise.all(trackingPromises)
          console.log('All protection plan tracking data sent successfully before proceeding')
        } catch (err: any) {
          console.error('Error sending tracking data:', err)
          // Continue even if tracking fails
        }
      }

      // 1. Assign protection package
      console.log('Assigning protection package:', selectedPackageId)
      await assignProtectionPackage(bookingId, selectedPackageId)

      // 2. Fetch vehicles from booking
      console.log('Fetching vehicles for booking:', bookingId)
      const vehiclesResponse = await getAvailableVehicles(bookingId)

      // 3. Filter deals to only DISCOUNT and take top 2
      const discountDeals = vehiclesResponse.deals
        .filter((deal: any) => deal.dealInfo === 'DISCOUNT')
        .sort((a: any, b: any) => b.pricing.discountPercentage - a.pricing.discountPercentage)
        .slice(0, 2)

      console.log('Filtered discount deals (top 2):', discountDeals)

      // 4. Call agentic selector API (if deals available)
      if (discountDeals.length > 0) {
        console.log('Calling agentic selector with UserId:', userId, 'and deals:', discountDeals)
        const agenticResponse = await callAgenticSelector({
          UserId: userId,
          deals: discountDeals,
        })

        // Save task_id to localStorage
        if (agenticResponse.task_id) {
          localStorage.setItem('agenticTaskId', agenticResponse.task_id)
          console.log('Saved task_id to localStorage:', agenticResponse.task_id)
        }
      } else {
        console.log('No discount deals available, skipping agentic selector')
      }

      // 5. Navigate to personalized deals page (at every cost)
      navigate('/personalized-deals')
    } catch (err: any) {
      console.error('Error proceeding to unlock:', err)
      alert(`Failed to proceed: ${err.message}`)
      // Navigate to personalized deals page even on error (at every cost)
      navigate('/personalized-deals')
    } finally {
      setIsProceeding(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading protection packages...</p>
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
    <div className="protection-page">
      <header className="protection-header">
        <div className="header-content">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <div className="header-text">
            <h1>Choose Your Protection</h1>
            <p className="subtitle">Select the protection package that suits your needs</p>
          </div>
        </div>
      </header>

      <main className="protection-main">
        <div className="protection-packages-grid">
          {packages.map(pkg => {
            const isSelected = selectedPackageId === pkg.id
            const expanded = expandedStates[pkg.id] || {
              price: false,
              includes: false,
              excludes: false,
              description: false,
            }

            return (
              <div
                key={pkg.id}
                className={`protection-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectPackage(pkg.id)}
              >
                <div className="card-header">
                  <div className="card-title-section">
                    <h3>{pkg.name}</h3>
                    {pkg.ratingStars > 0 && (
                      <div className="rating-stars">
                        {'⭐'.repeat(pkg.ratingStars)}
                      </div>
                    )}
                  </div>
                  <div className="card-selection-indicator">
                    {isSelected ? '✓ Selected' : '○'}
                  </div>
                </div>

                {pkg.description && (
                  <div className="card-description-section">
                    <button
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleDescription(pkg.id)
                      }}
                    >
                      {expanded.description ? '▼' : '▶'} Description
                    </button>
                    {expanded.description && (
                      <p className="description-text">{pkg.description}</p>
                    )}
                  </div>
                )}

                <div className="card-price-section">
                  <div className="price-main">
                    <span className="price-amount">
                      {formatPrice(pkg.price.displayPrice.amount, pkg.price.displayPrice.currency)}
                    </span>
                    <span className="price-suffix">{pkg.price.displayPrice.suffix}</span>
                    {pkg.price.discountPercentage > 0 && (
                      <span className="discount-badge">{pkg.price.discountPercentage}% OFF</span>
                    )}
                  </div>
                  <button
                    className="expand-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTogglePrice(pkg.id)
                    }}
                  >
                    {expanded.price ? '▼' : '▶'} Price Breakdown
                  </button>
                  {expanded.price && (
                    <div className="price-breakdown">
                      {pkg.price.listPrice && (
                        <div className="breakdown-item">
                          <span>List Price:</span>
                          <span className="original-price">
                            {formatPrice(pkg.price.listPrice.amount, pkg.price.listPrice.currency)}
                            {pkg.price.listPrice.suffix}
                          </span>
                        </div>
                      )}
                      <div className="breakdown-item">
                        <span>Display Price:</span>
                        <span>
                          {formatPrice(pkg.price.displayPrice.amount, pkg.price.displayPrice.currency)}
                          {pkg.price.displayPrice.suffix}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span>Total Price:</span>
                        <span>
                          {formatPrice(pkg.price.totalPrice.amount, pkg.price.totalPrice.currency)}
                          {pkg.price.totalPrice.suffix}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {pkg.includes.length > 0 && (
                  <div className="card-includes-section">
                    <button
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleIncludes(pkg.id)
                      }}
                    >
                      {expanded.includes ? '▼' : '▶'} Includes ({pkg.includes.length})
                    </button>
                    {expanded.includes && (
                      <div className="includes-list">
                        {pkg.includes.map((include, idx) => (
                          <div key={idx} className="include-item">
                            <h4>{include.title}</h4>
                            <p>{include.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {pkg.excludes.length > 0 && (
                  <div className="card-excludes-section">
                    <button
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleExcludes(pkg.id)
                      }}
                    >
                      {expanded.excludes ? '▼' : '▶'} Excludes ({pkg.excludes.length})
                    </button>
                    {expanded.excludes && (
                      <div className="excludes-list">
                        {pkg.excludes.map((exclude, idx) => (
                          <div key={idx} className="exclude-item">
                            <h4>{exclude.title}</h4>
                            <p>{exclude.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="card-footer">
                  <div className="deductible-info">
                    Deductible: {formatPrice(pkg.deductibleAmount.value, pkg.deductibleAmount.currency)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="proceed-section">
          <button
            className="proceed-button"
            onClick={handleProceedToUnlock}
            disabled={isProceeding || !selectedPackageId}
          >
            {isProceeding ? (
              <>
                <span className="button-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                🔓 Proceed to Unlock
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}

