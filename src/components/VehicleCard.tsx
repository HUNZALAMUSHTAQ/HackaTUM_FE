import { useNavigate } from 'react-router-dom'
import { Deal } from '../services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Zap, Battery, Lock, Check } from 'lucide-react'

interface VehicleCardProps {
  deal: Deal
  isLocked: boolean
  showUpgradeButton: boolean
}

export default function VehicleCard({ deal, isLocked, showUpgradeButton }: VehicleCardProps) {
  const navigate = useNavigate()
  const { vehicle, pricing } = deal

  const getBadges = () => {
    const badges = []
    if (vehicle.isRecommended) badges.push({ text: 'Recommended', icon: Star, variant: 'default' as const })
    if (vehicle.isExcitingDiscount) badges.push({ text: 'Exciting Discount', icon: Zap, variant: 'secondary' as const })
    if (vehicle.fuelType === 'Electric') badges.push({ text: 'Electric', icon: Battery, variant: 'outline' as const })
    if (vehicle.fuelType === 'Hybrid') badges.push({ text: 'Hybrid', icon: Battery, variant: 'outline' as const })
    if (isLocked) badges.push({ text: 'Your Current Booking', icon: Lock, variant: 'default' as const })
    return badges
  }

  const formatPrice = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleUpgrade = () => {
    if (!isLocked) {
      navigate('/protection')
    }
  }

  return (
    <Card className={`overflow-hidden ${isLocked ? 'border-primary opacity-90' : 'hover:shadow-lg transition-shadow'}`}>
      <div className="relative h-40 bg-muted overflow-hidden">
        <img 
          src={vehicle.images[0] || '/placeholder-car.png'} 
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image'
          }}
        />
        {pricing.discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs">
            {pricing.discountPercentage}% OFF
          </Badge>
        )}
        {deal.priceTag && (
          <Badge variant="outline" className="absolute bottom-2 left-2 bg-background/90 text-xs">
            {deal.priceTag}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="text-base font-bold leading-tight">
            {vehicle.brand} {vehicle.model}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {getBadges().map((badge, idx) => {
              const Icon = badge.icon
              return (
                <Badge key={idx} variant={badge.variant} className="text-xs py-0.5">
                  <Icon className="h-3 w-3 mr-1" />
                  {badge.text}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-2 bg-muted rounded-md text-xs">
          <div>
            <span className="text-muted-foreground uppercase text-[10px] tracking-wide">Fuel</span>
            <p className="font-semibold">{vehicle.fuelType || 'N/A'}</p>
          </div>
          <div>
            <span className="text-muted-foreground uppercase text-[10px] tracking-wide">Transmission</span>
            <p className="font-semibold">{vehicle.transmissionType}</p>
          </div>
          <div>
            <span className="text-muted-foreground uppercase text-[10px] tracking-wide">Seats</span>
            <p className="font-semibold">{vehicle.passengersCount}</p>
          </div>
          {vehicle.bagsCount > 0 && (
            <div>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wide">Bags</span>
              <p className="font-semibold">{vehicle.bagsCount}</p>
            </div>
          )}
        </div>

        {vehicle.attributes.filter(attr => attr.attributeType === 'UPSELL_ATTRIBUTE').length > 0 && (
          <div className="space-y-1">
            {vehicle.attributes
              .filter(attr => attr.attributeType === 'UPSELL_ATTRIBUTE')
              .slice(0, 3)
              .map((attr, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <Check className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{attr.title}</span>
                </div>
              ))}
          </div>
        )}

        <Separator />

        <div className="space-y-1.5">
          {pricing.listPrice && pricing.listPrice.amount > pricing.displayPrice.amount && (
            <p className="text-xs text-muted-foreground line-through">
              {pricing.listPrice.prefix}
              {formatPrice(pricing.listPrice.amount, pricing.listPrice.currency)}
              {pricing.listPrice.suffix}
            </p>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">Price:</span>
            <span className="text-lg font-bold text-primary">
              {pricing.displayPrice.prefix}
              {formatPrice(pricing.displayPrice.amount, pricing.displayPrice.currency)}
              {pricing.displayPrice.suffix}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Total: {pricing.totalPrice.prefix}
            {formatPrice(pricing.totalPrice.amount, pricing.totalPrice.currency)}
            {pricing.totalPrice.suffix}
          </p>
        </div>

        {showUpgradeButton && !isLocked && (
          <Button 
            className="w-full h-8 text-xs"
            onClick={handleUpgrade}
          >
            Upgrade for {pricing.displayPrice.prefix}
            {formatPrice(pricing.displayPrice.amount, pricing.displayPrice.currency)}
            {pricing.displayPrice.suffix}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
