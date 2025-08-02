import express from 'express'
import {
  getActiveSession,
  getSessionById,
  extendSession,
  cancelSession,
  getSessionsByLicensePlate,
  getSessionStatistics
} from '../controllers/sessionController'

const router = express.Router()

// GET /api/sessions/:licensePlate - Get active session by license plate
router.get('/:licensePlate', getActiveSession)

// GET /api/sessions/:licensePlate/history - Get session history by license plate
router.get('/:licensePlate/history', getSessionsByLicensePlate)

// GET /api/sessions/:licensePlate/stats - Get session statistics by license plate
router.get('/:licensePlate/stats', getSessionStatistics)

// GET /api/sessions/id/:id - Get session by ID
router.get('/id/:id', getSessionById)

// PUT /api/sessions/:id/extend - Extend session
router.put('/:id/extend', extendSession)

// DELETE /api/sessions/:id - Cancel session
router.delete('/:id', cancelSession)

export default router 