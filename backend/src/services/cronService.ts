import cron from 'node-cron'
import { cleanupExpiredSessions } from '../controllers/sessionController'
import { logger } from '../utils/logger'

export const startCronJobs = (): void => {
  // Clean up expired sessions every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await cleanupExpiredSessions()
    } catch (error) {
      logger.error('Error in cleanup expired sessions cron job:', error)
    }
  })

  // Log system status every hour
  cron.schedule('0 * * * *', () => {
    const memUsage = process.memoryUsage()
    logger.info('System status:', {
      uptime: process.uptime(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
      }
    })
  })

  logger.info('✅ Cron jobs started')
}

export const stopCronJobs = (): void => {
  cron.getTasks().forEach(task => task.stop())
  logger.info('✅ Cron jobs stopped')
} 