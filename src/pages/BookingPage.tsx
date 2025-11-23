import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBooking, getBookingDetails, getAvailableVehicles } from '../services/api'
import { useApp } from '../context/AppContext'
import '../components/BookingScreen.css'

export default function BookingPage() {
  const navigate = useNavigate()
  const { user, setBookingDetails, setVehiclesData } = useApp()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateBooking = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const booking = await createBooking()
      const details = await getBookingDetails(booking.id)
      setBookingDetails(details)
      
      // Save booking ID to localStorage
      localStorage.setItem('bookingId', booking.id)
      localStorage.setItem('bookingDetails', JSON.stringify(details))
      
      const vehicles = await getAvailableVehicles(booking.id)
      setVehiclesData(vehicles)
      
      navigate('/vehicles')
    } catch (err: any) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="booking-screen">
      <div className="booking-container">
        <div className="booking-header">
          <h1>{user?.name ? `Welcome, ${user.name}!` : 'Welcome to Sixt'}</h1>
          <p className="subtitle">Let's get your booking started</p>
        </div>

        <div className="booking-content">
          <div className="booking-icon">
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 6.5H17.5L19.11 11H4.89L6.5 6.5ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="booking-info">
            <h2>Create Your Booking</h2>
            <p>
              Click the button below to create a new booking and explore our available vehicles.
            </p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            className="create-booking-button"
            onClick={handleCreateBooking}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="button-spinner"></span>
                Creating Booking...
              </>
            ) : (
              <>
                <span className="button-icon">🚗</span>
                Create Booking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

