// Use proxy in development, direct URL in production
const API_BASE_URL = (import.meta as any).env?.DEV ? '' : 'https://hackatum25.sixt.io'
const USER_API_BASE_URL = (import.meta as any).env?.DEV ? '' : 'http://localhost:8000'

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

export async function upgradeVehicle(bookingId: string, vehicleId: string): Promise<any> {
  const url = `${API_BASE_URL}/api/booking/${bookingId}/vehicles/${vehicleId}`
  console.log('Upgrading vehicle:', url)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('Vehicle upgrade response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vehicle upgrade error:', errorText)
      throw new Error(`Failed to upgrade vehicle: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Vehicle upgraded:', data)
    return data
  } catch (error: any) {
    console.error('Vehicle upgrade exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

// User and Preference APIs
export interface UserCreate {
  name: string
  age: number
  gender: string
  location: string
  driving_style?: string | null
  fuel_preference?: string | null
  budget_sensitivity?: string | null
  risk_tolerance?: string | null
}

export interface UserResponse {
  id: number
  name: string
  age: number
  gender: string
  location: string
  driving_style?: string | null
  fuel_preference?: string | null
  budget_sensitivity?: string | null
  risk_tolerance?: string | null
  preferences?: PreferenceResponse[]
}

export interface PreferenceCreate {
  user_id: number
}

export interface PreferenceCreateResponse {
  id: number
  user_id: number
  status: string
  created_at: string
  updated_at: string
  task_id: string
  message: string
}

export interface Question {
  id: number
  question_type: string
  category: string
  question: string
  options?: string[] | null
  answer?: string | null
  answer_score?: number | null
  importance: number
  frustrated: boolean
}

export interface PreferenceResponse {
  id: number
  user_id: number
  status: string
  created_at: string
  updated_at: string
  questions?: Question[]
}

export interface QuestionResponse {
  id: number
  question_type: string
  category: string
  question: string
  options?: string[] | null
  answer?: string | null
  answer_score?: number | null
  importance: number
  frustrated: boolean
}

export async function createUser(userData: UserCreate): Promise<UserResponse> {
  const url = `${USER_API_BASE_URL}/users`
  console.log('Creating user:', url, userData)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    console.log('User response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('User creation error:', errorText)
      throw new Error(`Failed to create user: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('User created:', data)
    return data
  } catch (error: any) {
    console.error('User creation exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('Unable to connect to the user API. Please check if the server is running on http://localhost:8000')
    }
    throw error
  }
}

export async function createUserPreference(userId: number): Promise<PreferenceCreateResponse> {
  const url = `${USER_API_BASE_URL}/preferences`
  console.log('Creating preference for user:', userId)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })

    console.log('Preference response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Preference creation error:', errorText)
      throw new Error(`Failed to create preference: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Preference created:', data)
    return data
  } catch (error: any) {
    console.error('Preference creation exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('Unable to connect to the user API. Please check if the server is running on http://localhost:8000')
    }
    throw error
  }
}

export async function getPreferenceById(preferenceId: number): Promise<PreferenceResponse> {
  const url = `${USER_API_BASE_URL}/preferences/${preferenceId}`
  console.log('Fetching preference:', url)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('Preference response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Preference fetch error:', errorText)
      throw new Error(`Failed to get preference: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Preference fetched:', data)
    return data
  } catch (error: any) {
    console.error('Preference fetch exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('Unable to connect to the user API. Please check if the server is running on http://localhost:8000')
    }
    throw error
  }
}

export async function updateQuestionAnswer(
  questionId: number,
  answer: string,
  answerScore?: number,
  importance?: number,
  frustrated?: boolean
): Promise<QuestionResponse> {
  const url = `${USER_API_BASE_URL}/questions/${questionId}/answer`
  const params = new URLSearchParams()
  if (answer) params.append('answer', answer)
  if (answerScore !== undefined) params.append('answer_score', answerScore.toString())
  if (importance !== undefined) params.append('importance', importance.toString())
  if (frustrated !== undefined) params.append('frustrated', frustrated.toString())
  
  const fullUrl = `${url}?${params.toString()}`
  console.log('Updating question answer:', fullUrl)
  
  try {
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('Question answer response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Question answer update error:', errorText)
      throw new Error(`Failed to update question answer: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Question answer updated:', data)
    return data
  } catch (error: any) {
    console.error('Question answer update exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('Unable to connect to the user API. Please check if the server is running on http://localhost:8000')
    }
    throw error
  }
}

// Protection Packages API
export interface ProtectionInclude {
  id: string
  title: string
  description: string
  tags: any[]
}

export interface ProtectionPackage {
  id: string
  name: string
  description?: string
  deductibleAmount: {
    currency: string
    value: number
  }
  ratingStars: number
  isPreviouslySelected: boolean
  isSelected: boolean
  isDeductibleAvailable: boolean
  includes: ProtectionInclude[]
  excludes: ProtectionInclude[]
  price: {
    discountPercentage: number
    displayPrice: {
      currency: string
      amount: number
      suffix: string
    }
    listPrice?: {
      currency: string
      amount: number
      suffix: string
    }
    totalPrice: {
      currency: string
      amount: number
      suffix: string
    }
  }
  isNudge: boolean
}

export interface ProtectionPackagesResponse {
  protectionPackages: ProtectionPackage[]
}

export interface ProtectionBehavior {
  protectionPackageId: string
  clickedIncludes: number
  clickedUnIncludes: number
  clickedPriceDistribution: number
  clickedDescription: number
  timeSpendSelected: number
  Unselected: number
  Selected: number
}

export async function getProtectionPackages(bookingId: string): Promise<ProtectionPackagesResponse> {
  const url = `${API_BASE_URL}/api/booking/${bookingId}/protections`
  console.log('Fetching protection packages:', url)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('Protection packages response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Protection packages fetch error:', errorText)
      throw new Error(`Failed to get protection packages: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Protection packages fetched:', data)
    return data
  } catch (error: any) {
    console.error('Protection packages fetch exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

export interface ProtectionPlanTracking {
  BookingId: string
  UserId: number
  protectionPackageId: string
  Selected: number
  Unselected: number
  clickedDescription: number
  clickedIncludes: number
  clickedUnIncludes: number
  clickedPriceDistribution: number
  timeSpendSelected: number
}

export async function trackProtectionPlan(trackingData: ProtectionPlanTracking): Promise<any> {
  const url = `${USER_API_BASE_URL}/track-protection-plan`
  console.log('Tracking protection plan:', url, trackingData)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(trackingData),
    })

    console.log('Protection plan tracking response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Protection plan tracking error:', errorText)
      throw new Error(`Failed to track protection plan: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Protection plan tracked:', data)
    return data
  } catch (error: any) {
    console.error('Protection plan tracking exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('Unable to connect to the user API. Please check if the server is running on http://localhost:8000')
    }
    throw error
  }
}

export async function assignProtectionPackage(bookingId: string, packageId: string): Promise<any> {
  const url = `${API_BASE_URL}/api/booking/${bookingId}/protections/${packageId}`
  console.log('Assigning protection package:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('Protection package assignment response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Protection package assignment error:', errorText)
      throw new Error(`Failed to assign protection package: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Protection package assigned:', data)
    return data
  } catch (error: any) {
    console.error('Protection package assignment exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

export interface AgenticSelectorRequest {
  UserId: number
  deals: Deal[]
}

export interface AgenticSelectorResponse {
  message: string
  user_id: number
  task_id: string
  status: string
}

export interface AgenticSelectorRecord {
  id?: number
  vehicle_id?: string
  FEATURES_BASED_ON_PREFERENCES?: string[]
  REASON?: string
  PERSUASIVE_MESSAGES_POINTS?: string[]
  user_id: number
  created_at?: string
  updated_at?: string
  reservation_id?: string
  deals?: Deal[]
  status?: string
}

export async function callAgenticSelector(requestData: AgenticSelectorRequest): Promise<AgenticSelectorResponse> {
  const url = `${USER_API_BASE_URL}/agentic-selector`
  console.log('Calling agentic selector:', url, requestData)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    console.log('Agentic selector response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Agentic selector error:', errorText)
      throw new Error(`Failed to call agentic selector: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Agentic selector response:', data)
    return data
  } catch (error: any) {
    console.error('Agentic selector exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('Unable to connect to the user API. Please check if the server is running on http://localhost:8000')
    }
    throw error
  }
}

export interface TaskStatusResponse {
  task_id: string
  state: string
  status: string
  result?: {
    status: string
    user_id: number
    agentic_selector_id: number
    vehicle_id: string
    features: string[]
    reason: string
    persuasive_messages: string[]
  }
  error?: string
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const url = `${USER_API_BASE_URL}/tasks/${taskId}/status`
  console.log('Fetching task status:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('Task status response status:', response.status)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Task not found')
      }
      const errorText = await response.text()
      console.error('Task status error:', errorText)
      throw new Error(`Failed to get task status: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Task status:', data)
    return data
  } catch (error: any) {
    console.error('Task status exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('Unable to connect to the user API. Please check if the server is running on http://localhost:8000')
    }
    throw error
  }
}

export async function getAgenticSelectorRecords(userId?: number, skip: number = 0, limit: number = 100): Promise<AgenticSelectorRecord[]> {
  let url = `${USER_API_BASE_URL}/agentic-selector?skip=${skip}&limit=${limit}`
  if (userId) {
    url += `&user_id=${userId}`
  }
  console.log('Fetching agentic selector records:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('Agentic selector records response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Agentic selector records error:', errorText)
      throw new Error(`Failed to get agentic selector records: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Agentic selector records:', data)
    // Handle both array and object responses
    return Array.isArray(data) ? data : (data.records || [])
  } catch (error: any) {
    console.error('Agentic selector records exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('Unable to connect to the user API. Please check if the server is running on http://localhost:8000')
    }
    throw error
  }
}

export interface BestProtectionPackageResponse {
  protectionPackageId: string
  score: number
  engagement: number
  conversion_rate: number
  consistency: number
  package_data: {
    protectionPackageId: string
    clickedIncludes: number
    clickedUnIncludes: number
    clickedPriceDistribution: number
    clickedDescription: number
    timeSpendSelected: number
    Selected: number
    Unselected: number
  }
}

export async function getBestProtectionPackage(userId: number): Promise<BestProtectionPackageResponse> {
  const url = `${USER_API_BASE_URL}/protection-package/best/${userId}`
  console.log('Fetching best protection package:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('Best protection package response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Best protection package error:', errorText)
      throw new Error(`Failed to get best protection package: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Best protection package:', data)
    return data
  } catch (error: any) {
    console.error('Best protection package exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS') || error.name === 'TypeError') {
      throw new Error('Unable to connect to the user API. Please check if the server is running on http://localhost:8000')
    }
    throw error
  }
}

export async function completeBooking(bookingId: string): Promise<any> {
  const url = `${API_BASE_URL}/api/booking/${bookingId}/complete`
  console.log('Completing booking:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('Complete booking response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Complete booking error:', errorText)
      throw new Error(`Failed to complete booking: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Booking completed:', data)
    return data
  } catch (error: any) {
    console.error('Complete booking exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

export interface CarControlResponse {
  status: string
}

export async function unlockCar(): Promise<CarControlResponse> {
  const url = `${API_BASE_URL}/api/car/unlock`
  console.log('Unlocking car:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('Unlock car response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Unlock car error:', errorText)
      throw new Error(`Failed to unlock car: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Car unlocked:', data)
    return data
  } catch (error: any) {
    console.error('Unlock car exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

export async function lockCar(): Promise<CarControlResponse> {
  const url = `${API_BASE_URL}/api/car/lock`
  console.log('Locking car:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('Lock car response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Lock car error:', errorText)
      throw new Error(`Failed to lock car: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Car locked:', data)
    return data
  } catch (error: any) {
    console.error('Lock car exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

export async function blinkCar(): Promise<CarControlResponse> {
  const url = `${API_BASE_URL}/api/car/blink`
  console.log('Blinking car:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('Blink car response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Blink car error:', errorText)
      throw new Error(`Failed to blink car: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Car blinked:', data)
    return data
  } catch (error: any) {
    console.error('Blink car exception:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Unable to connect to the API. Please check your network connection or CORS settings.')
    }
    throw error
  }
}

