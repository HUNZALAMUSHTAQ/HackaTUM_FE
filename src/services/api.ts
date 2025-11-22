// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV ? '' : 'https://hackatum25.sixt.io'

export interface BookingResponse {
  id: string
}

export interface BookingDetails {
  bookedCategory: string
  selectedVehicle: string | null
  protectionPackages: any | null
  status: string
  createdAt: string
  id: string
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  acrissCode: string
  images: string[]
  bagsCount: number
  passengersCount: number
  groupType: string
  tyreType: string
  transmissionType: string
  fuelType: string
  isNewCar: boolean
  isRecommended: boolean
  isMoreLuxury: boolean
  isExcitingDiscount: boolean
  attributes: Array<{
    key: string
    title: string
    value: string
    attributeType: string
    iconUrl?: string
  }>
  vehicleStatus: string
  vehicleCost: {
    currency: string
    value: number
  }
  upsellReasons: any[]
}

export interface Pricing {
  discountPercentage: number
  displayPrice: {
    currency: string
    amount: number
    prefix: string
    suffix: string
  }
  listPrice?: {
    currency: string
    amount: number
    prefix: string
    suffix: string
  }
  totalPrice: {
    currency: string
    amount: number
    prefix: string
    suffix: string
  }
}

export interface Deal {
  vehicle: Vehicle
  pricing: Pricing
  dealInfo: string
  tags: any[]
  priceTag?: string
}

export interface VehiclesResponse {
  reservationId: string
  deals: Deal[]
  totalVehicles: number
  reservationBlockDateTime: {
    date: string
    timeZone: string
  }
  filter: {
    brands: string[]
    transmissionTypes: string[]
    fuelTypes: string[]
  }
  quickFilters: Array<{
    key: string
    title: string
    selectType: string
  }>
  terminalList: any[]
  isBundleSelected: boolean
}

export async function createBooking(): Promise<BookingResponse> {
  const url = `${API_BASE_URL}/api/booking`
  console.log('Creating booking:', url)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('Booking response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Booking error:', errorText)
      throw new Error(`Failed to create booking: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Booking created:', data)
    return data
  } catch (error: any) {
    console.error('Booking exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

export async function getBookingDetails(bookingId: string): Promise<BookingDetails> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/booking/${bookingId}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get booking details: ${response.status} ${response.statusText}. ${errorText}`)
    }

    return response.json()
  } catch (error: any) {
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

export async function getAvailableVehicles(bookingId: string): Promise<VehiclesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/booking/${bookingId}/vehicles`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get available vehicles: ${response.status} ${response.statusText}. ${errorText}`)
    }

    return response.json()
  } catch (error: any) {
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

