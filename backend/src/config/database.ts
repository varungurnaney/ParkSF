import mongoose from 'mongoose'
import { logger } from '../utils/logger'

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env['NODE_ENV'] === 'production' 
      ? process.env['MONGODB_URI_PROD'] 
      : process.env['MONGODB_URI'] || 'mongodb://localhost:27017/parksf'

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables')
    }

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    logger.info('✅ MongoDB connected successfully')
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected')
    })

  } catch (error) {
    logger.warn('⚠️  MongoDB not available, running in mock mode')
    logger.warn('   Install MongoDB for full functionality: brew install mongodb-community')
    logger.warn('   Or use a cloud MongoDB instance')
  }
}

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect()
    logger.info('MongoDB disconnected')
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error)
  }
} 