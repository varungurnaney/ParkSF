import { NextResponse } from 'next/server'

// Mock active sessions (in real app, this would come from database)
const mockActiveSessions = [
  {
    id: 'session_1703123456789',
    licensePlate: 'ABC123',
    duration: 60,
    startTime: '2024-01-15T10:30:00.000Z',
    endTime: '2024-01-15T11:30:00.000Z',
    totalCost: 2.55,
    feePaid: 0.05,
    feeSaved: 0.32,
    status: 'active'
  },
  {
    id: 'session_1703123456790',
    licensePlate: 'XYZ789',
    duration: 120,
    startTime: '2024-01-15T09:00:00.000Z',
    endTime: '2024-01-15T11:00:00.000Z',
    totalCost: 5.05,
    feePaid: 0.05,
    feeSaved: 0.32,
    status: 'active'
  }
]

export async function GET(
  request: Request,
  { params }: { params: { licensePlate: string } }
) {
  try {
    const { licensePlate } = params
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Find active session for this license plate
    const activeSession = mockActiveSessions.find(
      session => session.licensePlate === licensePlate.toUpperCase() && session.status === 'active'
    )
    
    if (!activeSession) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active session found for this license plate'
      })
    }
    
    // Calculate time remaining
    const now = new Date()
    const endTime = new Date(activeSession.endTime)
    const timeRemaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
    
    return NextResponse.json({
      success: true,
      data: {
        ...activeSession,
        timeRemaining,
        isExpired: timeRemaining <= 0
      },
      message: 'Active session found'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to lookup session' },
      { status: 500 }
    )
  }
} 