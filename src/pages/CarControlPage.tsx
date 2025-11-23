import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { lockCar, unlockCar, blinkCar } from '../services/api'
import './CarControlPage.css'

export default function CarControlPage() {
  const navigate = useNavigate()
  const [locking, setLocking] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [blinking, setBlinking] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLock = async () => {
    try {
      setLocking(true)
      setError(null)
      setStatus(null)
      const response = await lockCar()
      setStatus('Car locked successfully!')
      console.log('Car locked:', response)
    } catch (err: any) {
      console.error('Error locking car:', err)
      setError(err.message || 'Failed to lock car')
    } finally {
      setLocking(false)
    }
  }

  const handleUnlock = async () => {
    try {
      setUnlocking(true)
      setError(null)
      setStatus(null)
      const response = await unlockCar()
      setStatus('Car unlocked successfully!')
      console.log('Car unlocked:', response)
    } catch (err: any) {
      console.error('Error unlocking car:', err)
      setError(err.message || 'Failed to unlock car')
    } finally {
      setUnlocking(false)
    }
  }

  const handleBlink = async () => {
    try {
      setBlinking(true)
      setError(null)
      setStatus(null)
      const response = await blinkCar()
      setStatus('Car lights blinked!')
      console.log('Car blinked:', response)
    } catch (err: any) {
      console.error('Error blinking car:', err)
      setError(err.message || 'Failed to blink car')
    } finally {
      setBlinking(false)
    }
  }

  return (
    <div className="car-control-page">
      <header className="control-header">
        <div className="header-content">
          <h1>🚗 Car Control</h1>
          <p className="subtitle">Control your rental car remotely</p>
        </div>
      </header>

      <main className="control-main">
        {status && (
          <div className="status-message success">
            <span className="status-icon">✓</span>
            <span>{status}</span>
          </div>
        )}

        {error && (
          <div className="status-message error">
            <span className="status-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="control-buttons">
          <button
            className="control-button lock-button"
            onClick={handleLock}
            disabled={locking || unlocking || blinking}
          >
            {locking ? (
              <>
                <span className="button-spinner"></span>
                Locking...
              </>
            ) : (
              <>
                <span className="button-icon">🔒</span>
                <span className="button-text">Lock Car</span>
              </>
            )}
          </button>

          <button
            className="control-button unlock-button"
            onClick={handleUnlock}
            disabled={locking || unlocking || blinking}
          >
            {unlocking ? (
              <>
                <span className="button-spinner"></span>
                Unlocking...
              </>
            ) : (
              <>
                <span className="button-icon">🔓</span>
                <span className="button-text">Unlock Car</span>
              </>
            )}
          </button>

          <button
            className="control-button blink-button"
            onClick={handleBlink}
            disabled={locking || unlocking || blinking}
          >
            {blinking ? (
              <>
                <span className="button-spinner"></span>
                Blinking...
              </>
            ) : (
              <>
                <span className="button-icon">💡</span>
                <span className="button-text">Blink Lights</span>
              </>
            )}
          </button>
        </div>

        <div className="back-section">
          <button
            className="back-button"
            onClick={() => navigate('/personalized-deals')}
          >
            ← Back to Deals
          </button>
        </div>
      </main>
    </div>
  )
}

