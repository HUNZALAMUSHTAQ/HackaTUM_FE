import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBestProtectionPackage, getProtectionPackages, assignProtectionPackage, completeBooking, unlockCar, ProtectionPackage } from '../services/api'
import { useApp } from '../context/AppContext'
import './BestProtectionPage.css'

export default function BestProtectionPage() {
  const navigate = useNavigate()
  const { user, bookingDetails } = useApp()
  const [bestProtectionPackage, setBestProtectionPackage] = useState<ProtectionPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingProtection, setAddingProtection] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserId = () => {
    if (user?.id) {
      return user.id
    }
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      return parseInt(storedUserId, 10)
    }
    return null
  }

  useEffect(() => {
    const fetchBestProtection = async () => {
      const userId = getUserId()
      const bookingId = bookingDetails?.id || localStorage.getItem('bookingId')

      if (!userId) {
        setError('No user found. Please create a user first.')
        setLoading(false)
        return
      }

      if (!bookingId) {
        setError('No booking found. Please create a booking first.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // 1. Get best protection package
        console.log('Fetching best protection package for user:', userId)
        const bestPackageResponse = await getBestProtectionPackage(userId)
        console.log('Best protection package response:', bestPackageResponse)

        // 2. Get all protection packages from booking
        console.log('Fetching protection packages for booking:', bookingId)
        const protectionPackagesResponse = await getProtectionPackages(bookingId)
        console.log('All protection packages:', protectionPackagesResponse)

        // 3. Filter by protectionPackageId
        const filteredPackage = protectionPackagesResponse.protectionPackages.find(
          (pkg: ProtectionPackage) => pkg.id === bestPackageResponse.protectionPackageId
        )

        if (!filteredPackage) {
          setError(`Protection package with ID ${bestPackageResponse.protectionPackageId} not found`)
          setLoading(false)
          return
        }

        setBestProtectionPackage(filteredPackage)
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching best protection package:', err)
        setError(err.message || 'Failed to load best protection package')
        setLoading(false)
      }
    }

    fetchBestProtection()
  }, [user, bookingDetails])

  const handleAddProtection = async () => {
    const bookingId = bookingDetails?.id || localStorage.getItem('bookingId')

    if (!bookingId) {
      alert('No booking found. Please create a booking first.')
      return
    }

    if (!bestProtectionPackage) {
      alert('No protection package selected.')
      return
    }

    try {
      setAddingProtection(true)
      setError(null)

      console.log('Assigning protection package:', bestProtectionPackage.id)
      await assignProtectionPackage(bookingId, bestProtectionPackage.id)
      
      // Mark package as selected
      setBestProtectionPackage({ ...bestProtectionPackage, isSelected: true })
      setAddingProtection(false)
    } catch (err: any) {
      console.error('Error adding protection:', err)
      setError(err.message || 'Failed to add protection package')
      setAddingProtection(false)
    }
  }

  const handleUnlockCar = async () => {
    const bookingId = bookingDetails?.id || localStorage.getItem('bookingId')

    if (!bookingId) {
      alert('No booking found. Please create a booking first.')
      return
    }

    try {
      setUnlocking(true)
      setError(null)

      // 1. Complete booking
      console.log('Completing booking:', bookingId)
      await completeBooking(bookingId)

      // 2. Unlock car
      console.log('Unlocking car...')
      await unlockCar()

      // 3. Navigate to car control page
      navigate('/car-control')
    } catch (err: any) {
      console.error('Error unlocking car:', err)
      setError(err.message || 'Failed to unlock car')
      setUnlocking(false)
      // Still navigate to car control page even on error
      navigate('/car-control')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your best protection package...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/personalized-deals')} className="retry-button">
          Go Back
        </button>
      </div>
    )
  }

  if (!bestProtectionPackage) {
    return (
      <div className="error-container">
        <h2>No Protection Package Found</h2>
        <p>Unable to find the best protection package for you.</p>
        <button onClick={() => navigate('/personalized-deals')} className="retry-button">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="best-protection-page">
      <header className="protection-header">
        <button className="back-button" onClick={() => navigate('/personalized-deals')}>
          ← Back
        </button>
        <div className="header-content">
          <h1>🎁 Best Protection Package for You</h1>
          <p className="subtitle">AI-recommended based on your preferences</p>
        </div>
      </header>

      <main className="protection-main">
        <div className="best-protection-card">
          <div className="protection-card-header">
            <h3>{bestProtectionPackage.name}</h3>
            {bestProtectionPackage.ratingStars > 0 && (
              <div className="rating-stars">
                {'⭐'.repeat(bestProtectionPackage.ratingStars)}
              </div>
            )}
          </div>

          {bestProtectionPackage.description && (
            <div className="protection-description">
              <p>{bestProtectionPackage.description}</p>
            </div>
          )}

          <div className="protection-price-section">
            <div className="price-main">
              <span className="price-amount">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: bestProtectionPackage.price.displayPrice.currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(bestProtectionPackage.price.displayPrice.amount)}
              </span>
              <span className="price-suffix">{bestProtectionPackage.price.displayPrice.suffix}</span>
              {bestProtectionPackage.price.discountPercentage > 0 && (
                <span className="discount-badge">{bestProtectionPackage.price.discountPercentage}% OFF</span>
              )}
            </div>
            {bestProtectionPackage.price.listPrice && (
              <div className="original-price">
                List Price: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: bestProtectionPackage.price.listPrice.currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(bestProtectionPackage.price.listPrice.amount)}{bestProtectionPackage.price.listPrice.suffix}
              </div>
            )}
            <div className="total-price">
              Total: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: bestProtectionPackage.price.totalPrice.currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(bestProtectionPackage.price.totalPrice.amount)}{bestProtectionPackage.price.totalPrice.suffix}
            </div>
          </div>

          {bestProtectionPackage.includes.length > 0 && (
            <div className="protection-includes">
              <h4>Includes:</h4>
              <ul className="includes-list">
                {bestProtectionPackage.includes.map((include, idx) => (
                  <li key={idx} className="include-item">
                    <span className="include-title">{include.title}</span>
                    <p className="include-description">{include.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bestProtectionPackage.excludes.length > 0 && (
            <div className="protection-excludes">
              <h4>Excludes:</h4>
              <ul className="excludes-list">
                {bestProtectionPackage.excludes.map((exclude, idx) => (
                  <li key={idx} className="exclude-item">
                    <span className="exclude-title">{exclude.title}</span>
                    <p className="exclude-description">{exclude.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="protection-deductible">
            <p>Deductible: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: bestProtectionPackage.deductibleAmount.currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(bestProtectionPackage.deductibleAmount.value)}</p>
          </div>

          <div className="protection-actions">
            {!bestProtectionPackage.isSelected && (
              <button
                className="add-protection-button"
                onClick={handleAddProtection}
                disabled={addingProtection}
              >
                {addingProtection ? (
                  <>
                    <span className="button-spinner"></span>
                    Adding Protection...
                  </>
                ) : (
                  <>
                    ✓ Add This Protection
                  </>
                )}
              </button>
            )}

            {bestProtectionPackage.isSelected && (
              <button
                className="unlock-car-button"
                onClick={handleUnlockCar}
                // disabled={unlocking}
              >
                {unlocking ? (
                  <>
                    <span className="button-spinner"></span>
                    Unlocking Car...
                  </>
                ) : (
                  <>
                    🔓 Finally Unlock the Car
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

