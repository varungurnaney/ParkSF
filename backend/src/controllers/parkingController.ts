import { Request, Response } from 'express'
import { ParkingSpot } from '../models/ParkingSpot'
import { ParkingSession } from '../models/ParkingSession'
import { logger } from '../utils/logger'
import { io } from '../index'

// Get all parking spots
export const getParkingSpots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius, zone } = req.query

    let query: any = { isActive: true }

    // Filter by zone if provided
    if (zone) {
      query.zone = zone
    }

    // Filter by location if coordinates provided
    if (lat && lng) {
      const latNum = parseFloat(lat as string)
      const lngNum = parseFloat(lng as string)
      const radiusNum = radius ? parseFloat(radius as string) : 0.05

      query.lat = { $gte: latNum - radiusNum, $lte: latNum + radiusNum }
      query.lng = { $gte: lngNum - radiusNum, $lte: lngNum + radiusNum }
    }

    const parkingSpots = await ParkingSpot.find(query).sort({ name: 1 })

    res.json({
      success: true,
      data: parkingSpots,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error fetching parking spots:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parking spots'
    })
  }
}

// Get parking spot by ID
export const getParkingSpotById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const parkingSpot = await ParkingSpot.findById(id)

    if (!parkingSpot) {
      res.status(404).json({
        success: false,
        error: 'Parking spot not found'
      })
      return
    }

    res.json({
      success: true,
      data: parkingSpot
    })
  } catch (error) {
    logger.error('Error fetching parking spot:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parking spot'
    })
  }
}

// Create parking session
export const createParkingSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { licensePlate, parkingSpotId, duration, totalCost } = req.body

    // Validate required fields
    if (!licensePlate || !parkingSpotId || !duration || !totalCost) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
      return
    }

    // Check if parking spot exists and is available
    const parkingSpot = await ParkingSpot.findById(parkingSpotId)
    if (!parkingSpot) {
      res.status(404).json({
        success: false,
        error: 'Parking spot not found'
      })
      return
    }

    if (!parkingSpot.available || parkingSpot.availableSpots <= 0) {
      res.status(400).json({
        success: false,
        error: 'Parking spot is not available'
      })
      return
    }

    // Check if there's already an active session for this license plate
    const existingSession = await ParkingSession.findActiveByLicensePlate(licensePlate)
    if (existingSession) {
      res.status(400).json({
        success: false,
        error: 'License plate already has an active parking session'
      })
      return
    }

    // Calculate fees
    const parksfFee = parseFloat(process.env.PARKSF_FEE || '0.05')
    const sfmtaFee = parseFloat(process.env.SFMTA_FEE || '0.37')
    const feeSaved = sfmtaFee - parksfFee

    // Create parking session
    const session = new ParkingSession({
      licensePlate: licensePlate.toUpperCase(),
      parkingSpotId,
      duration,
      totalCost,
      feePaid: parksfFee,
      feeSaved
    })

    await session.save()

    // Update parking spot availability
    parkingSpot.availableSpots = Math.max(0, parkingSpot.availableSpots - 1)
    await parkingSpot.save()

    // Emit real-time update
    io.to('parking-updates').emit('parking-spot-updated', {
      spotId: parkingSpotId,
      availableSpots: parkingSpot.availableSpots
    })

    res.json({
      success: true,
      data: session,
      message: 'Parking session created successfully'
    })
  } catch (error) {
    logger.error('Error creating parking session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create parking session'
    })
  }
}

// Update parking spot availability
export const updateParkingSpotAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { availableSpots } = req.body

    const parkingSpot = await ParkingSpot.findById(id)
    if (!parkingSpot) {
      res.status(404).json({
        success: false,
        error: 'Parking spot not found'
      })
      return
    }

    parkingSpot.availableSpots = Math.max(0, Math.min(availableSpots, parkingSpot.totalSpots))
    parkingSpot.lastUpdated = new Date()
    await parkingSpot.save()

    // Emit real-time update
    io.to('parking-updates').emit('parking-spot-updated', {
      spotId: id,
      availableSpots: parkingSpot.availableSpots
    })

    res.json({
      success: true,
      data: parkingSpot,
      message: 'Parking spot availability updated'
    })
  } catch (error) {
    logger.error('Error updating parking spot availability:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update parking spot availability'
    })
  }
}

// Get parking statistics
export const getParkingStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalSpots = await ParkingSpot.countDocuments({ isActive: true })
    const availableSpots = await ParkingSpot.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$availableSpots' } } }
    ])

    const activeSessions = await ParkingSession.countDocuments({ status: 'active' })

    const totalRevenue = await ParkingSession.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ])

    const totalFeesSaved = await ParkingSession.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$feeSaved' } } }
    ])

    res.json({
      success: true,
      data: {
        totalSpots,
        availableSpots: availableSpots[0]?.total || 0,
        activeSessions,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalFeesSaved: totalFeesSaved[0]?.total || 0,
        occupancyRate: totalSpots > 0 ? ((totalSpots - (availableSpots[0]?.total || 0)) / totalSpots) * 100 : 0
      }
    })
  } catch (error) {
    logger.error('Error fetching parking statistics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parking statistics'
    })
  }
} 