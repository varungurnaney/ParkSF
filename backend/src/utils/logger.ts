import winston from 'winston'
import path from 'path'

const logLevel = process.env['LOG_LEVEL'] || 'info'
const logFile = process.env['LOG_FILE'] || 'logs/app.log'

// Create logs directory if it doesn't exist
const fs = require('fs')
const logDir = path.dirname(logFile)
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level}]: ${message}\n${stack}`
    }
    return `${timestamp} [${level}]: ${message}`
  })
)

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'parksf-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    // File transport
    new winston.transports.File({
      filename: logFile,
      format: logFormat
    }),
    // Error file transport
    new winston.transports.File({
      filename: logFile.replace('.log', '-error.log'),
      level: 'error',
      format: logFormat
    })
  ]
})

// If we're not in production, log to console as well
if (process.env['NODE_ENV'] !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }))
} 