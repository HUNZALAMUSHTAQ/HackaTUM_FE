import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBooking, getBookingDetails, getAvailableVehicles } from '../services/api'
import { useApp } from '../context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Car, AlertCircle } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-xl">
            {user?.name ? `Welcome, ${user.name}!` : 'Welcome to Sixt'}
          </CardTitle>
          <CardDescription className="text-xs">
            Let's get your booking started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Car className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-base font-semibold">Create Your Booking</h2>
            <p className="text-xs text-muted-foreground">
              Click the button below to create a new booking and explore our available vehicles.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            className="w-full h-9"
            onClick={handleCreateBooking}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Booking...
              </>
            ) : (
              <>
                <Car className="mr-2 h-4 w-4" />
                Create Booking
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
