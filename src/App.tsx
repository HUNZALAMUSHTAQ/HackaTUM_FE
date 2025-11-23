import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import LandingPage from './pages/LandingPage'
import UserCreationPage from './pages/UserCreationPage'
import QuestionsPage from './pages/QuestionsPage'
import BookingPage from './pages/BookingPage'
import VehiclesPage from './pages/VehiclesPage'
import ProtectionPage from './pages/ProtectionPage'
import PersonalizedDealPage from './pages/PersonalizedDealPage'
import BestProtectionPage from './pages/BestProtectionPage'
import CarControlPage from './pages/CarControlPage'
import './App.css'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/user-creation" element={<UserCreationPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/protection" element={<ProtectionPage />} />
          <Route path="/personalized-deals" element={<PersonalizedDealPage />} />
          <Route path="/best-protection" element={<BestProtectionPage />} />
          <Route path="/car-control" element={<CarControlPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
