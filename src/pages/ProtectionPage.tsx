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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Unlock, Loader2, ChevronDown, ChevronRight, Check, AlertCircle, Shield } from 'lucide-react'

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
    packages.forEach(pkg => {
      const isSelected = selectedPackageId === pkg.id
      const tracking = timeTrackingRef.current[pkg.id]
      
      if (isSelected && !tracking?.isSelected) {
        timeTrackingRef.current[pkg.id] = {
          startTime: Date.now(),
          isSelected: true,
        }
      } else if (!isSelected && tracking?.isSelected) {
        const timeSpent = Date.now() - tracking.startTime
        updateBehavior(pkg.id, 'timeSpendSelected', timeSpent)
        timeTrackingRef.current[pkg.id] = {
          startTime: 0,
          isSelected: false,
        }
      }
    })

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
      updateBehavior(packageId, 'Unselected', 1)
      setSelectedPackageId(null)
    } else {
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
    if (selectedPackageId) {
      const tracking = timeTrackingRef.current[selectedPackageId]
      if (tracking?.isSelected) {
        const timeSpent = Date.now() - tracking.startTime
        updateBehavior(selectedPackageId, 'timeSpendSelected', timeSpent)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 100))

    const bookingId = getBookingId()
    const userId = getUserId()

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
      }
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

      if (selectedPackageId) {
        const tracking = timeTrackingRef.current[selectedPackageId]
        if (tracking?.isSelected) {
          const timeSpent = Date.now() - tracking.startTime
          updateBehavior(selectedPackageId, 'timeSpendSelected', timeSpent)
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100))

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
        }
      }

      await assignProtectionPackage(bookingId, selectedPackageId)
      const vehiclesResponse = await getAvailableVehicles(bookingId)

      const discountDeals = vehiclesResponse.deals
        .filter((deal: any) => deal.dealInfo === 'DISCOUNT')
        .sort((a: any, b: any) => b.pricing.discountPercentage - a.pricing.discountPercentage)
        .slice(0, 2)

      if (discountDeals.length > 0) {
        const agenticResponse = await callAgenticSelector({
          UserId: userId,
          deals: discountDeals,
        })

        if (agenticResponse.task_id) {
          localStorage.setItem('agenticTaskId', agenticResponse.task_id)
        }
      }

      navigate('/personalized-deals')
    } catch (err: any) {
      console.error('Error proceeding to unlock:', err)
      alert(`Failed to proceed: ${err.message}`)
      navigate('/personalized-deals')
    } finally {
      setIsProceeding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading protection packages...</p>
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
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                <Shield className="h-5 w-5" />
                Choose Your Protection
              </h1>
              <p className="text-xs opacity-90 mt-1">Select the protection package that suits your needs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(pkg => {
            const isSelected = selectedPackageId === pkg.id
            const expanded = expandedStates[pkg.id] || {
              price: false,
              includes: false,
              excludes: false,
              description: false,
            }

            return (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'border-2 border-primary shadow-lg' : ''
                }`}
                onClick={() => handleSelectPackage(pkg.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1">{pkg.name}</CardTitle>
                      {pkg.ratingStars > 0 && (
                        <div className="text-xs">
                          {'⭐'.repeat(pkg.ratingStars)}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {pkg.description && (
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs w-full justify-between p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleDescription(pkg.id)
                        }}
                      >
                        <span>Description</span>
                        {expanded.description ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </Button>
                      {expanded.description && (
                        <p className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded-md">{pkg.description}</p>
                      )}
                    </div>
                  )}

                  <div className="p-3 bg-muted rounded-md">
                    <div className="flex items-baseline gap-2 flex-wrap mb-2">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(pkg.price.displayPrice.amount, pkg.price.displayPrice.currency)}
                      </span>
                      <span className="text-xs text-muted-foreground">{pkg.price.displayPrice.suffix}</span>
                      {pkg.price.discountPercentage > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {pkg.price.discountPercentage}% OFF
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs w-full justify-between p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTogglePrice(pkg.id)
                      }}
                    >
                      <span>Price Breakdown</span>
                      {expanded.price ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                    {expanded.price && (
                      <div className="mt-2 space-y-1 text-xs">
                        {pkg.price.listPrice && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">List Price:</span>
                            <span className="line-through">
                              {formatPrice(pkg.price.listPrice.amount, pkg.price.listPrice.currency)}
                              {pkg.price.listPrice.suffix}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Display Price:</span>
                          <span>
                            {formatPrice(pkg.price.displayPrice.amount, pkg.price.displayPrice.currency)}
                            {pkg.price.displayPrice.suffix}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold">
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
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs w-full justify-between p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleIncludes(pkg.id)
                        }}
                      >
                        <span>Includes ({pkg.includes.length})</span>
                        {expanded.includes ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </Button>
                      {expanded.includes && (
                        <div className="mt-2 space-y-2">
                          {pkg.includes.map((include, idx) => (
                            <div key={idx} className="p-2 bg-green-50 dark:bg-green-950 border-l-4 border-green-500 rounded-r-md">
                              <p className="text-xs font-semibold text-green-900 dark:text-green-100">{include.title}</p>
                              <p className="text-xs text-green-700 dark:text-green-300 mt-1">{include.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {pkg.excludes.length > 0 && (
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs w-full justify-between p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleExcludes(pkg.id)
                        }}
                      >
                        <span>Excludes ({pkg.excludes.length})</span>
                        {expanded.excludes ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </Button>
                      {expanded.excludes && (
                        <div className="mt-2 space-y-2">
                          {pkg.excludes.map((exclude, idx) => (
                            <div key={idx} className="p-2 bg-red-50 dark:bg-red-950 border-l-4 border-red-500 rounded-r-md">
                              <p className="text-xs font-semibold text-red-900 dark:text-red-100">{exclude.title}</p>
                              <p className="text-xs text-red-700 dark:text-red-300 mt-1">{exclude.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Deductible: {formatPrice(pkg.deductibleAmount.value, pkg.deductibleAmount.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            className="h-10 gap-2"
            onClick={handleProceedToUnlock}
            disabled={isProceeding || !selectedPackageId}
          >
            {isProceeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Proceed to Unlock
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
