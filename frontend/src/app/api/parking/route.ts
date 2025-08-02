import { NextResponse } from 'next/server'

// Mock parking spots data
const parkingSpots = [
  {
    id: '1',
    name: 'Mission & 16th St',
    address: 'Mission St & 16th St, San Francisco, CA',
    lat: 37.7651,
    lng: -122.4194,
    rate: 2.50,
    available: true,
    totalSpots: 12,
    availableSpots: 8,
    restrictions: ['2 hour limit', 'No overnight']
  },
  {
    id: '2',
    name: 'Castro & Market',
    address: 'Castro St & Market St, San Francisco, CA',
    lat: 37.7614,
    lng: -122.4350,
    rate: 2.75,
    available: true,
    totalSpots: 8,
    availableSpots: 3,
    restrictions: ['1 hour limit']
  },
  {
    id: '3',
    name: 'Hayes Valley',
    address: 'Hayes St & Octavia Blvd, San Francisco, CA',
    lat: 37.7769,
    lng: -122.4264,
    rate: 2.25,
    available: true,
    totalSpots: 15,
    availableSpots: 12,
    restrictions: ['4 hour limit']
  },
  {
    id: '4',
    name: 'North Beach',
    address: 'Columbus Ave & Broadway, San Francisco, CA',
    lat: 37.7999,
    lng: -122.4084,
    rate: 3.00,
    available: true,
    totalSpots: 6,
    availableSpots: 2,
    restrictions: ['2 hour limit', 'No overnight']
  },
  {
    id: '5',
    name: 'Marina District',
    address: 'Chestnut St & Fillmore St, San Francisco, CA',
    lat: 37.8005,
    lng: -122.4368,
    rate: 2.50,
    available: true,
    totalSpots: 10,
    availableSpots: 7,
    restrictions: ['3 hour limit']
  }
]

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return NextResponse.json({
    success: true,
    data: parkingSpots,
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Simulate creating a parking session
    const session = {
      id: `session_${Date.now()}`,
      licensePlate: body.licensePlate,
      duration: body.duration,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + body.duration * 60000).toISOString(),
      totalCost: body.totalCost,
      feePaid: 0.05,
      feeSaved: 0.32
    }
    
    return NextResponse.json({
      success: true,
      data: session,
      message: 'Parking session created successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request data' },
      { status: 400 }
    )
  }
} 