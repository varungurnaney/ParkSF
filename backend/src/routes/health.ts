import express from 'express'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

const router = express.Router()

// GET /api/health - Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// GET /api/health/detailed - Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        connectionState: mongoose.connection.readyState
      },
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Health check failed'
    })
  }
})

export default router 