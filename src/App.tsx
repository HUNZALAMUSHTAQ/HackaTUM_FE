import { useState } from 'react'
import { createBooking, getBookingDetails, getAvailableVehicles } from './services/api'
import BookingScreen from './components/BookingScreen'
import CurrentBookingSection from './components/CurrentBookingSection'
import UpsellVehiclesSection from './components/UpsellVehiclesSection'
import QuickFilters from './components/QuickFilters'
import './App.css'

function App() {
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [vehiclesData, setVehiclesData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [showBookingScreen, setShowBookingScreen] = useState(true)

  const handleCreateBooking = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Step 1: Create booking
      const booking = await createBooking()
      
      // Step 2: Get booking details
      const details = await getBookingDetails(booking.id)
      setBookingDetails(details)
      
      // Step 3: Get available vehicles
      const vehicles = await getAvailableVehicles(booking.id)
      setVehiclesData(vehicles)
      
      // Hide booking screen and show main app
      setShowBookingScreen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to initialize booking')
      console.error('Error initializing booking:', err)
      throw err // Re-throw to let BookingScreen handle it
    } finally {
      setLoading(false)
    }
  }

  const handleFilterToggle = (filterKey: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev)
      if (newFilters.has(filterKey)) {
        newFilters.delete(filterKey)
      } else {
        newFilters.add(filterKey)
      }
      return newFilters
    })
  }

  // Show booking screen first
  if (showBookingScreen) {
    return (
      <BookingScreen
        onCreateBooking={handleCreateBooking}
        isLoading={loading}
      />
    )
  }

  // Show loading state while fetching vehicles
  if (loading && !vehiclesData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading vehicles...</p>
      </div>
    )
  }

  // Show error state
  if (error && !vehiclesData) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => setShowBookingScreen(true)} className="retry-button">
          Go Back
        </button>
      </div>
    )
  }

  if (!vehiclesData) {
    return null
  }

  const bookedVehicles = vehiclesData.deals.filter(
    (deal: any) => deal.dealInfo === 'BOOKED_CATEGORY'
  )

  const upsellVehicles = vehiclesData.deals.filter(
    (deal: any) => deal.dealInfo === 'DISCOUNT'
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>Choose Your Vehicle</h1>
        <p className="subtitle">Upgrade to a better experience</p>
      </header>

      <main className="app-main">
        {vehiclesData.quickFilters && (
          <QuickFilters
            filters={vehiclesData.quickFilters}
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
          />
        )}

        {bookedVehicles.length > 0 && (
          <CurrentBookingSection
            vehicles={bookedVehicles}
            bookedCategory={bookingDetails?.bookedCategory}
          />
        )}

        <UpsellVehiclesSection
          vehicles={upsellVehicles}
          activeFilters={activeFilters}
        />
      </main>
    </div>
  )
}

export default App

