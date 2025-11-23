import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserResponse, PreferenceResponse } from '../services/api'

interface AppContextType {
  user: UserResponse | null
  setUser: (user: UserResponse | null) => void
  preference: PreferenceResponse | null
  setPreference: (preference: PreferenceResponse | null) => void
  preferenceId: number | null
  setPreferenceId: (id: number | null) => void
  bookingDetails: any
  setBookingDetails: (details: any) => void
  vehiclesData: any
  setVehiclesData: (data: any) => void
  activeFilters: Set<string>
  setActiveFilters: (filters: Set<string> | ((prev: Set<string>) => Set<string>)) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available
  const getStoredUser = (): UserResponse | null => {
    const stored = localStorage.getItem('userData')
    return stored ? JSON.parse(stored) : null
  }

  const getStoredBookingDetails = (): any => {
    const stored = localStorage.getItem('bookingDetails')
    return stored ? JSON.parse(stored) : null
  }

  const [user, setUser] = useState<UserResponse | null>(getStoredUser())
  const [preference, setPreference] = useState<PreferenceResponse | null>(null)
  const [preferenceId, setPreferenceId] = useState<number | null>(null)
  const [bookingDetails, setBookingDetails] = useState<any>(getStoredBookingDetails())
  const [vehiclesData, setVehiclesData] = useState<any>(null)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user))
      localStorage.setItem('userId', user.id.toString())
    }
  }, [user])

  // Update localStorage when bookingDetails changes
  useEffect(() => {
    if (bookingDetails) {
      localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails))
      if (bookingDetails.id) {
        localStorage.setItem('bookingId', bookingDetails.id)
      }
    }
  }, [bookingDetails])

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        preference,
        setPreference,
        preferenceId,
        setPreferenceId,
        bookingDetails,
        setBookingDetails,
        vehiclesData,
        setVehiclesData,
        activeFilters,
        setActiveFilters,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

