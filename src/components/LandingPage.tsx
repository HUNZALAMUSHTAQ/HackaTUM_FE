import './LandingPage.css'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="landing-title">Welcome to Sixt</h1>
          <p className="landing-subtitle">Your premium car rental experience starts here</p>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">🚗</div>
            <h3>Premium Vehicles</h3>
            <p>Choose from our wide selection of luxury and premium cars</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Best Deals</h3>
            <p>Exclusive discounts and offers tailored just for you</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Personalized Experience</h3>
            <p>Get recommendations based on your preferences</p>
          </div>
        </div>

        <button className="get-started-button" onClick={onGetStarted}>
          Get Started
          <span className="button-arrow">→</span>
        </button>
      </div>
    </div>
  )
}

