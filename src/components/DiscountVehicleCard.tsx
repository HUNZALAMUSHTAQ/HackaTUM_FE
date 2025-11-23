import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Deal, upgradeVehicle } from '../services/api'
import { useApp } from '../context/AppContext'
import './VehicleCard.css'

interface DiscountVehicleCardProps {
  deal: Deal
  isLocked: boolean
  showUpgradeButton: boolean
}

export default function DiscountVehicleCard({ deal, isLocked, showUpgradeButton }: DiscountVehicleCardProps) {
  const navigate = useNavigate()
  const { bookingDetails } = useApp()
  const { vehicle, pricing } = deal
  const [isUpgrading, setIsUpgrading] = useState(false)

  const getBadges = () => {
    const badges = []
    if (vehicle.isRecommended) badges.push({ text: 'Recommended', icon: '⭐', className: 'recommended' })
    if (vehicle.isExcitingDiscount) badges.push({ text: 'Exciting Discount', icon: '⚡', className: 'discount' })
    if (vehicle.fuelType === 'Electric') badges.push({ text: 'Electric', icon: '🔋', className: 'electric' })
    if (vehicle.fuelType === 'Hybrid') badges.push({ text: 'Hybrid', icon: '🔋', className: 'hybrid' })
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

  // Calculate hourly price
  const hourlyPrice = pricing.displayPrice.amount / 24
  const priceMessage = hourlyPrice < 2 ? 'Less than a coffee ☕' : 'Less than a burger 🍔'

  const handleUpgrade = async () => {
    if (!isLocked && bookingDetails?.id) {
      try {
        setIsUpgrading(true)
        await upgradeVehicle(bookingDetails.id, vehicle.id)
        // After successful upgrade, navigate to protection page
        navigate('/protection')
      } catch (err: any) {
        console.error('Error upgrading vehicle:', err)
        alert(`Failed to upgrade vehicle: ${err.message}`)
      } finally {
        setIsUpgrading(false)
      }
    } else if (!bookingDetails?.id) {
      // Try to get booking ID from localStorage
      const bookingId = localStorage.getItem('bookingId')
      if (bookingId) {
        try {
          setIsUpgrading(true)
          await upgradeVehicle(bookingId, vehicle.id)
          navigate('/protection')
        } catch (err: any) {
          console.error('Error upgrading vehicle:', err)
          alert(`Failed to upgrade vehicle: ${err.message}`)
        } finally {
          setIsUpgrading(false)
        }
      } else {
        alert('No booking found. Please create a booking first.')
      }
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
            <span className="price-amount hourly-price">
              {formatPrice(hourlyPrice, pricing.displayPrice.currency)}
              <span className="price-unit">/hour</span>
            </span>
          </div>
          <div className="price-message">
            {priceMessage}
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
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <>
                <span className="button-spinner"></span>
                Upgrading...
              </>
            ) : (
              <>
                Upgrade for {formatPrice(hourlyPrice, pricing.displayPrice.currency)}/hour
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

