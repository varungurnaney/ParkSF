import { Request, Response } from 'express'
import { ParkingSession } from '../models/ParkingSession'
import { ParkingSpot } from '../models/ParkingSpot'
import { logger } from '../utils/logger'

// Get active session by license plate
export const getActiveSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { licensePlate } = req.params

    if (!licensePlate) {
      res.status(400).json({
        success: false,
        error: 'License plate is required'
      })
      return
    }

    const session = await ParkingSession.findActiveByLicensePlate(licensePlate)

    if (!session) {
      res.json({
        success: true,
        data: null,
        message: 'No active session found for this license plate'
      })
      return
    }

    // Calculate time remaining
    const now = new Date()
    const endTime = new Date(session.endTime)
    const timeRemaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))

    res.json({
      success: true,
      data: {
        ...session.toObject(),
        timeRemaining,
        isExpired: timeRemaining <= 0
      },
      message: 'Active session found'
    })
  } catch (error) {
    logger.error('Error fetching active session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to lookup session'
    })
  }
}

// Get session by ID
export const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const session = await ParkingSession.findById(id).populate('parkingSpotId')

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      })
      return
    }

    res.json({
      success: true,
      data: session
    })
  } catch (error) {
    logger.error('Error fetching session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session'
    })
  }
}

// Extend session
export const extendSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { additionalMinutes, additionalCost } = req.body

    if (!additionalMinutes || !additionalCost) {
      res.status(400).json({
        success: false,
        error: 'Additional minutes and cost are required'
      })
      return
    }

    const session = await ParkingSession.findById(id)
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      })
      return
    }

    if (session.status !== 'active') {
      res.status(400).json({
        success: false,
        error: 'Session is not active'
      })
      return
    }

    // Extend the session
    await session.extend(additionalMinutes, additionalCost)

    res.json({
      success: true,
      data: session,
      message: 'Session extended successfully'
    })
  } catch (error) {
    logger.error('Error extending session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to extend session'
    })
  }
}

// Cancel session
export const cancelSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const session = await ParkingSession.findById(id)
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      })
      return
    }

    if (session.status !== 'active') {
      res.status(400).json({
        success: false,
        error: 'Session is not active'
      })
      return
    }

    // Cancel the session
    await session.cancel()

    // Update parking spot availability
    const parkingSpot = await ParkingSpot.findById(session.parkingSpotId)
    if (parkingSpot) {
      parkingSpot.availableSpots = Math.min(parkingSpot.totalSpots, parkingSpot.availableSpots + 1)
      await parkingSpot.save()
    }

    res.json({
      success: true,
      data: session,
      message: 'Session cancelled successfully'
    })
  } catch (error) {
    logger.error('Error cancelling session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to cancel session'
    })
  }
}

// Get sessions by license plate
export const getSessionsByLicensePlate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { licensePlate } = req.params
    const { status, limit = 10, page = 1 } = req.query

    if (!licensePlate) {
      res.status(400).json({
        success: false,
        error: 'License plate is required'
      })
      return
    }

    let query: any = { licensePlate: licensePlate.toUpperCase() }

    if (status) {
      query.status = status
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const sessions = await ParkingSession.find(query)
      .populate('parkingSpotId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(skip)

    const total = await ParkingSession.countDocuments(query)

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    logger.error('Error fetching sessions by license plate:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions'
    })
  }
}

// Get session statistics
export const getSessionStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { licensePlate } = req.params

    if (!licensePlate) {
      res.status(400).json({
        success: false,
        error: 'License plate is required'
      })
      return
    }

    const totalSessions = await ParkingSession.countDocuments({
      licensePlate: licensePlate.toUpperCase()
    })

    const activeSessions = await ParkingSession.countDocuments({
      licensePlate: licensePlate.toUpperCase(),
      status: 'active'
    })

    const totalSpent = await ParkingSession.aggregate([
      {
        $match: {
          licensePlate: licensePlate.toUpperCase(),
          status: { $in: ['active', 'expired'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCost' },
          totalFees: { $sum: '$feePaid' },
          totalSaved: { $sum: '$feeSaved' }
        }
      }
    ])

    const result = totalSpent[0] || { total: 0, totalFees: 0, totalSaved: 0 }

    res.json({
      success: true,
      data: {
        totalSessions,
        activeSessions,
        totalSpent: result.total,
        totalFees: result.totalFees,
        totalSaved: result.totalSaved
      }
    })
  } catch (error) {
    logger.error('Error fetching session statistics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session statistics'
    })
  }
}

// Clean up expired sessions (cron job)
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    const expiredSessions = await ParkingSession.findExpired()

    for (const session of expiredSessions) {
      session.status = 'expired'
      await session.save()

      // Update parking spot availability
      const parkingSpot = await ParkingSpot.findById(session.parkingSpotId)
      if (parkingSpot) {
        parkingSpot.availableSpots = Math.min(parkingSpot.totalSpots, parkingSpot.availableSpots + 1)
        await parkingSpot.save()
      }
    }

    logger.info(`Cleaned up ${expiredSessions.length} expired sessions`)
  } catch (error) {
    logger.error('Error cleaning up expired sessions:', error)
  }
} 