import { Deal } from '../services/api'
import VehicleCard from './VehicleCard'
import './CurrentBookingSection.css'

interface CurrentBookingSectionProps {
  vehicles: Deal[]
  bookedCategory: string | undefined
}

export default function CurrentBookingSection({ vehicles, bookedCategory }: CurrentBookingSectionProps) {
  if (vehicles.length === 0) {
    return null
  }

  return (
    <section className="current-booking-section">
      <div className="section-header">
        <h2>Your Current Booking</h2>
        {bookedCategory && (
          <span className="category-badge">Category: {bookedCategory}</span>
        )}
      </div>
      <div className="vehicles-grid">
        {vehicles.map((deal) => (
          <VehicleCard
            key={deal.vehicle.id}
            deal={deal}
            isLocked={true}
            showUpgradeButton={false}
          />
        ))}
      </div>
    </section>
  )
}

