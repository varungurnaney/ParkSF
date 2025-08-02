import express from 'express'
import {
  getParkingSpots,
  getParkingSpotById,
  createParkingSession,
  updateParkingSpotAvailability,
  getParkingStatistics
} from '../controllers/parkingController'

const router = express.Router()

// GET /api/parking - Get all parking spots
router.get('/', getParkingSpots)

// GET /api/parking/stats - Get parking statistics
router.get('/stats', getParkingStatistics)

// GET /api/parking/:id - Get parking spot by ID
router.get('/:id', getParkingSpotById)

// POST /api/parking/session - Create parking session
router.post('/session', createParkingSession)

// PUT /api/parking/:id/availability - Update parking spot availability
router.put('/:id/availability', updateParkingSpotAvailability)

export default router 