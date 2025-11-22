import { useMemo } from 'react'
import { Deal } from '../services/api'
import VehicleCard from './VehicleCard'
import './UpsellVehiclesSection.css'

interface UpsellVehiclesSectionProps {
  vehicles: Deal[]
  activeFilters: Set<string>
}

export default function UpsellVehiclesSection({ vehicles, activeFilters }: UpsellVehiclesSectionProps) {
  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = [...vehicles]

    // Apply quick filters
    if (activeFilters.size > 0) {
      filtered = filtered.filter((deal) => {
        const vehicle = deal.vehicle
        
        if (activeFilters.has('MCI_P100_QUICKFILTER_RECOMMENDED') && !vehicle.isRecommended) {
          return false
        }
        if (activeFilters.has('MCI_P100_QUICKFILTER_EXCITING_DISCOUNTS') && !vehicle.isExcitingDiscount) {
          return false
        }
        if (activeFilters.has('MCI_P100_QUICKFILTER_NEW_CAR') && !vehicle.isNewCar) {
          return false
        }
        if (activeFilters.has('MCI_P100_QUICKFILTER_ELECTRIC_VEHICLES') && 
            vehicle.fuelType !== 'Electric' && vehicle.fuelType !== 'Hybrid') {
          return false
        }
        
        return true
      })
    }

    // Smart sorting: isRecommended first, then highest discount, then lowest total price
    filtered.sort((a, b) => {
      // First: isRecommended (true comes first)
      if (a.vehicle.isRecommended !== b.vehicle.isRecommended) {
        return a.vehicle.isRecommended ? -1 : 1
      }
      
      // Second: Highest discountPercentage
      if (a.pricing.discountPercentage !== b.pricing.discountPercentage) {
        return b.pricing.discountPercentage - a.pricing.discountPercentage
      }
      
      // Third: Lowest totalPrice
      return a.pricing.totalPrice.amount - b.pricing.totalPrice.amount
    })

    return filtered
  }, [vehicles, activeFilters])

  if (filteredAndSortedVehicles.length === 0) {
    return (
      <section className="upsell-vehicles-section">
        <div className="section-header">
          <h2>Upgrade Options</h2>
        </div>
        <div className="no-results">
          <p>No vehicles match your selected filters.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="upsell-vehicles-section">
      <div className="section-header">
        <h2>Upgrade Options</h2>
        <p className="section-subtitle">Discover better vehicles at great prices</p>
      </div>
      <div className="vehicles-grid">
        {filteredAndSortedVehicles.map((deal) => (
          <VehicleCard
            key={deal.vehicle.id}
            deal={deal}
            isLocked={false}
            showUpgradeButton={true}
          />
        ))}
      </div>
    </section>
  )
}

