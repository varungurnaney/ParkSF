import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

import mongoose from 'mongoose'
import { connectDB } from './config/database'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import { seedParkingSpots } from './services/seedService'
import { startCronJobs, stopCronJobs } from './services/cronService'

// Import routes
import parkingRoutes from './routes/parking'
import paymentRoutes from './routes/payment'
import sessionRoutes from './routes/sessions'
import healthRoutes from './routes/health'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env['PORT'] || 3001

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true
}))
app.use(compression())
app.use(limiter)
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'ParkSF API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/parking', parkingRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/health', healthRoutes)

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)
  
  socket.on('join-parking-updates', (_data) => {
    socket.join('parking-updates')
    logger.info(`Client ${socket.id} joined parking updates`)
  })
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB()
    
    // Seed initial data (only if MongoDB is connected)
    if (mongoose.connection.readyState === 1) {
      await seedParkingSpots()
      // Start cron jobs only if database is available
      startCronJobs()
    }
    
    server.listen(PORT, () => {
      logger.info(`🚀 ParkSF Backend server running on port ${PORT}`)
      logger.info(`📊 Environment: ${process.env['NODE_ENV']}`)
      logger.info(`🔗 API URL: http://localhost:${PORT}`)
      if (mongoose.connection.readyState !== 1) {
        logger.warn('⚠️  Running in mock mode - MongoDB not available')
        logger.warn('   Some features may be limited')
      }
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err)
  server.close(() => process.exit(1))
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  server.close(() => process.exit(1))
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  stopCronJobs()
  server.close(() => {
    logger.info('Process terminated')
  })
})

startServer()

export { io } 