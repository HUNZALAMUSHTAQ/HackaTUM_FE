import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import QuickFilters from '../components/QuickFilters'
import VehicleCard from '../components/VehicleCard'
import DiscountVehicleCard from '../components/DiscountVehicleCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Unlock, Shield } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { Deal } from '../services/api'

export default function VehiclesPage() {
  const navigate = useNavigate()
  const { user, bookingDetails, vehiclesData, activeFilters, setActiveFilters } = useApp()

  if (!vehiclesData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading vehicles...</p>
        </div>
      </div>
    )
  }

  const bookedVehicles = vehiclesData.deals.filter(
    (deal: any) => deal.dealInfo === 'BOOKED_CATEGORY'
  )

  const upsellVehicles = vehiclesData.deals.filter(
    (deal: any) => deal.dealInfo === 'DISCOUNT'
  )

  const bookedVehicle = bookedVehicles.length > 0 ? bookedVehicles[0] : null

  const highestDiscountVehicle = upsellVehicles.length > 0
    ? upsellVehicles.reduce((highest, current) => {
        return current.pricing.discountPercentage > highest.pricing.discountPercentage
          ? current
          : highest
      }, upsellVehicles[0])
    : null

  // Get other vehicles (excluding the highest discount one that's shown in comparison)
  const otherVehicles = useMemo(() => {
    let filtered = upsellVehicles.filter((deal: Deal) => {
      // Exclude the highest discount vehicle if it exists
      if (highestDiscountVehicle && deal.vehicle.id === highestDiscountVehicle.vehicle.id) {
        return false
      }
      return true
    })

    // Apply quick filters
    if (activeFilters.size > 0) {
      filtered = filtered.filter((deal: Deal) => {
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
    filtered.sort((a: Deal, b: Deal) => {
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
  }, [upsellVehicles, highestDiscountVehicle, activeFilters])

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">{user?.name ? `${user.name}'s Vehicle Selection` : 'Choose Your Vehicle'}</h1>
          <p className="text-xs opacity-90 mt-1">Upgrade to a better experience</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-center">
          <Button 
            size="lg"
            className="h-10 gap-2"
            onClick={() => navigate('/protection')}
          >
            <Unlock className="h-4 w-4" />
            Unlock Your Car
          </Button>
        </div>

        {vehiclesData.quickFilters && (
          <QuickFilters
            filters={vehiclesData.quickFilters}
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
          />
        )}

        {bookedVehicle && highestDiscountVehicle && (
          <section className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold">Compare Your Options</h2>
              <p className="text-xs text-muted-foreground">Your current booking vs. best discount offer</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">Your Current Booking</Badge>
                  {bookingDetails?.bookedCategory && (
                    <Badge variant="outline" className="text-xs">Category: {bookingDetails.bookedCategory}</Badge>
                  )}
                </div>
                <VehicleCard
                  deal={bookedVehicle}
                  isLocked={true}
                  showUpgradeButton={false}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Best Discount - {highestDiscountVehicle.pricing.discountPercentage}% OFF
                  </Badge>
                  <Badge variant="secondary" className="text-xs">DISCOUNT</Badge>
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
          <div className="space-y-2">
            <Badge variant="default" className="text-xs">Your Current Booking</Badge>
            <VehicleCard
              deal={bookedVehicle}
              isLocked={true}
              showUpgradeButton={false}
            />
          </div>
        )}

        {otherVehicles.length > 0 && (
          <section className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold">More Upgrade Options</h2>
              <p className="text-xs text-muted-foreground">Discover better vehicles at great prices</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherVehicles.map((deal: Deal) => (
                <VehicleCard
                  key={deal.vehicle.id}
                  deal={deal}
                  isLocked={false}
                  showUpgradeButton={true}
                />
              ))}
            </div>
          </section>
        )}

        {otherVehicles.length === 0 && upsellVehicles.length > 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No other vehicles match your selected filters.</p>
          </div>
        )}

        <div className="flex justify-center">
          <Button 
            variant="outline"
            size="lg"
            className="h-10 gap-2"
            onClick={() => navigate('/protection')}
          >
            <Shield className="h-4 w-4" />
            Add Protection
          </Button>
        </div>
      </div>
    </div>
  )
}
