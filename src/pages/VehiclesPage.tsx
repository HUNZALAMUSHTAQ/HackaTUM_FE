import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CurrentBookingSection from '../components/CurrentBookingSection'
import UpsellVehiclesSection from '../components/UpsellVehiclesSection'
import QuickFilters from '../components/QuickFilters'
import VehicleCard from '../components/VehicleCard'
import DiscountVehicleCard from '../components/DiscountVehicleCard'
import '../App.css'

export default function VehiclesPage() {
  const navigate = useNavigate()
  const { user, bookingDetails, vehiclesData, activeFilters, setActiveFilters } = useApp()

  if (!vehiclesData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading vehicles...</p>
      </div>
    )
  }

  const bookedVehicles = vehiclesData.deals.filter(
    (deal: any) => deal.dealInfo === 'BOOKED_CATEGORY'
  )

  const upsellVehicles = vehiclesData.deals.filter(
    (deal: any) => deal.dealInfo === 'DISCOUNT'
  )

  // Get only the first booked vehicle
  const bookedVehicle = bookedVehicles.length > 0 ? bookedVehicles[0] : null

  // Find the highest discount vehicle
  const highestDiscountVehicle = upsellVehicles.length > 0
    ? upsellVehicles.reduce((highest, current) => {
        return current.pricing.discountPercentage > highest.pricing.discountPercentage
          ? current
          : highest
      }, upsellVehicles[0])
    : null

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>{user?.name ? `${user.name}'s Vehicle Selection` : 'Choose Your Vehicle'}</h1>
        <p className="subtitle">Upgrade to a better experience</p>
      </header>

      <main className="app-main">
        <div className="unlock-section">
          <button 
            className="unlock-button"
            onClick={() => navigate('/protection')}
          >
            🔓 Unlock Your Car
          </button>
        </div>

        {vehiclesData.quickFilters && (
          <QuickFilters
            filters={vehiclesData.quickFilters}
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
          />
        )}

        {bookedVehicle && highestDiscountVehicle && (
          <section className="comparison-section">
            <div className="section-header">
              <h2>Compare Your Options</h2>
              <p className="section-subtitle">Your current booking vs. best discount offer</p>
            </div>
            <div className="comparison-grid">
              <div className="comparison-card booked">
                <div className="comparison-label">
                  <span className="label-badge">Your Current Booking</span>
                  {bookingDetails?.bookedCategory && (
                    <span className="category-badge">Category: {bookingDetails.bookedCategory}</span>
                  )}
                </div>
                <VehicleCard
                  deal={bookedVehicle}
                  isLocked={true}
                  showUpgradeButton={false}
                />
              </div>
              
              <div className="comparison-card discount">
                <div className="comparison-label">
                  <span className="label-badge discount-badge">
                    Best Discount - {highestDiscountVehicle.pricing.discountPercentage}% OFF
                  </span>
                  <span className="deal-info-badge">DISCOUNT</span>
                </div>
                <DiscountVehicleCard
                  deal={highestDiscountVehicle}
                  isLocked={false}
                  showUpgradeButton={true}
                />
              </div>
            </div>
          </section>
        )}

        {bookedVehicle && !highestDiscountVehicle && (
          <CurrentBookingSection
            vehicles={[bookedVehicle]}
            bookedCategory={bookingDetails?.bookedCategory}
          />
        )}

        {upsellVehicles.length > 0 && (
          <UpsellVehiclesSection
            vehicles={upsellVehicles}
            activeFilters={activeFilters}
          />
        )}

        <div className="protection-cta-section">
          <button 
            className="add-protection-button"
            onClick={() => navigate('/protection')}
          >
            Add Protection
          </button>
        </div>
      </main>
    </div>
  )
}

