// API service functions for ParkSF

export interface ParkingSpot {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rate: number
  available: boolean
  totalSpots: number
  availableSpots: number
  restrictions: string[]
}

export interface ParkingSession {
  id: string
  licensePlate: string
  duration: number
  startTime: string
  endTime: string
  totalCost: number
  feePaid: number
  feeSaved: number
  status: string
  timeRemaining?: number
  isExpired?: boolean
}

export interface Payment {
  id: string
  licensePlate: string
  amount: number
  fee: number
  status: string
  createdAt: string
  sessionId: string
}

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// Generic API call function
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

// Parking API functions
export const parkingAPI = {
  // Get all parking spots
  getSpots: async (): Promise<ParkingSpot[]> => {
    const response = await apiCall<{ success: boolean; data: ParkingSpot[] }>('/api/parking')
    return response.data
  },

  // Create a new parking session
  createSession: async (data: {
    licensePlate: string
    duration: number
    totalCost: number
  }): Promise<ParkingSession> => {
    const response = await apiCall<{ success: boolean; data: ParkingSession }>('/api/parking', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  },
}

// Payment API functions
export const paymentAPI = {
  // Process payment
  processPayment: async (data: {
    licensePlate: string
    duration: number
    amount: number
  }): Promise<{ payment: Payment; session: ParkingSession }> => {
    const response = await apiCall<{
      success: boolean
      data: { payment: Payment; session: ParkingSession }
    }>('/api/payment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  },
}

// Session API functions
export const sessionAPI = {
  // Look up active session by license plate
  getActiveSession: async (licensePlate: string): Promise<ParkingSession | null> => {
    const response = await apiCall<{
      success: boolean
      data: ParkingSession | null
    }>(`/api/sessions/${encodeURIComponent(licensePlate)}`)
    return response.data
  },
}

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`
  } else if (minutes === 60) {
    return '1 hour'
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} hours`
    }
    return `${hours} hours ${remainingMinutes} minutes`
  }
}

export const formatTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
} 