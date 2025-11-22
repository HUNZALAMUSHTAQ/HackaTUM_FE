import { Deal } from '../services/api'
import './VehicleCard.css'

interface VehicleCardProps {
  deal: Deal
  isLocked: boolean
  showUpgradeButton: boolean
}

export default function VehicleCard({ deal, isLocked, showUpgradeButton }: VehicleCardProps) {
  const { vehicle, pricing } = deal

  const getBadges = () => {
    const badges = []
    if (vehicle.isRecommended) badges.push({ text: 'Recommended', icon: '⭐', className: 'recommended' })
    if (vehicle.isExcitingDiscount) badges.push({ text: 'Exciting Discount', icon: '⚡', className: 'discount' })
    if (vehicle.fuelType === 'Electric') badges.push({ text: 'Electric', icon: '🔋', className: 'electric' })
    if (vehicle.fuelType === 'Hybrid') badges.push({ text: 'Hybrid', icon: '🔋', className: 'hybrid' })
    if (isLocked) badges.push({ text: 'Your Current Booking', icon: '🔒', className: 'current' })
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
      alert(`Upgrade to ${vehicle.brand} ${vehicle.model} for ${formatPrice(pricing.displayPrice.amount)}/day`)
      // Here you would typically make an API call to update the booking
    }
  }

  return (
    <div className={`vehicle-card ${isLocked ? 'locked' : ''}`}>
      <div className="card-image-container">
        <img 
          src={vehicle.images[0] || '/placeholder-car.png'} 
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="vehicle-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image'
          }}
        />
        {pricing.discountPercentage > 0 && (
          <div className="discount-badge">
            {pricing.discountPercentage}% OFF
          </div>
        )}
        {deal.priceTag && (
          <div className="price-tag">{deal.priceTag}</div>
        )}
      </div>

      <div className="card-content">
        <div className="vehicle-header">
          <h3 className="vehicle-name">
            {vehicle.brand} {vehicle.model}
          </h3>
          <div className="badges-container">
            {getBadges().map((badge, idx) => (
              <span key={idx} className={`badge ${badge.className}`}>
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-text">{badge.text}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="vehicle-specs">
          <div className="spec-item">
            <span className="spec-label">Fuel:</span>
            <span className="spec-value">{vehicle.fuelType}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Transmission:</span>
            <span className="spec-value">{vehicle.transmissionType}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Seats:</span>
            <span className="spec-value">{vehicle.passengersCount}</span>
          </div>
          {vehicle.bagsCount > 0 && (
            <div className="spec-item">
              <span className="spec-label">Bags:</span>
              <span className="spec-value">{vehicle.bagsCount}</span>
            </div>
          )}
        </div>

        <div className="vehicle-attributes">
          {vehicle.attributes
            .filter(attr => attr.attributeType === 'UPSELL_ATTRIBUTE')
            .slice(0, 3)
            .map((attr, idx) => (
              <div key={idx} className="attribute-item">
                <span className="attribute-icon">✓</span>
                <span className="attribute-text">{attr.title}</span>
              </div>
            ))}
        </div>

        <div className="pricing-section">
          {pricing.listPrice && pricing.listPrice.amount > pricing.displayPrice.amount && (
            <div className="original-price">
              {pricing.listPrice.prefix}
              {formatPrice(pricing.listPrice.amount, pricing.listPrice.currency)}
              {pricing.listPrice.suffix}
            </div>
          )}
          <div className="current-price">
            <span className="price-label">Price:</span>
            <span className="price-amount">
              {pricing.displayPrice.prefix}
              {formatPrice(pricing.displayPrice.amount, pricing.displayPrice.currency)}
              {pricing.displayPrice.suffix}
            </span>
          </div>
          <div className="total-price">
            {pricing.totalPrice.prefix}
            {formatPrice(pricing.totalPrice.amount, pricing.totalPrice.currency)}
            {pricing.totalPrice.suffix}
          </div>
        </div>

        {showUpgradeButton && !isLocked && (
          <button 
            className="upgrade-button"
            onClick={handleUpgrade}
          >
            Upgrade for {pricing.displayPrice.prefix}
            {formatPrice(pricing.displayPrice.amount, pricing.displayPrice.currency)}
            {pricing.displayPrice.suffix}
          </button>
        )}
      </div>
    </div>
  )
}

