'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Car, DollarSign, Plus, Download } from 'lucide-react'

interface SessionConfirmationProps {
  session: any
  licensePlate: string
  duration: number
  costs: {
    baseCost: string
    totalCost: string
    savings: string
    totalSavings: string
  }
  onNewSession: () => void
}

export default function SessionConfirmation({ 
  session, 
  licensePlate, 
  duration, 
  costs, 
  onNewSession 
}: SessionConfirmationProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60) // in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    } else if (minutes === 60) {
      return '1 hour'
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      if (remainingMinutes === 0) {
        return `${hours} hours`
      }
      return `${hours} hours ${remainingMinutes} minutes`
    }
  }

  const downloadReceipt = () => {
    const receipt = `
ParkSF - Parking Receipt
========================

Session ID: ${session.id}
License Plate: ${licensePlate}
Start Time: ${new Date(session.startTime).toLocaleString()}
End Time: ${new Date(session.endTime).toLocaleString()}
Duration: ${formatDuration(duration)}

Cost Breakdown:
- Base parking: $${costs.baseCost}
- ParkSF fee: $0.05
- Total paid: $${costs.totalCost}

You saved: $${costs.savings} vs SFMTA fees!

Thank you for choosing ParkSF!
    `
    
    const blob = new Blob([receipt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parksf-receipt-${session.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600">
          Your parking session is now active
        </p>
      </div>

      {/* Session Details */}
      <div className="card mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Car className="w-5 h-5 mr-2 text-blue-600" />
          Session Details
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">License Plate:</span>
            <span className="font-mono font-semibold text-lg">{licensePlate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{formatDuration(duration)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Start Time:</span>
            <span className="font-medium">{new Date(session.startTime).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">End Time:</span>
            <span className="font-medium">{new Date(session.endTime).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="card mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-orange-600" />
          Time Remaining
        </h4>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {formatTimeRemaining(timeRemaining)}
          </div>
          <div className="text-sm text-gray-600">
            Session expires at {new Date(session.endTime).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="card mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Payment Summary
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base parking cost:</span>
            <span className="font-medium">${costs.baseCost}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">ParkSF fee:</span>
            <span className="font-medium text-green-600">$0.05</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total paid:</span>
              <span className="font-bold text-lg">${costs.totalCost}</span>
            </div>
          </div>
        </div>
        
        {/* Savings Highlight */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-800">You saved vs SFMTA:</div>
              <div className="text-xs text-green-600">$0.35-0.39 vs $0.05</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">${costs.savings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <motion.button
          onClick={downloadReceipt}
          className="w-full btn-secondary flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-4 h-4" />
          <span>Download Receipt</span>
        </motion.button>
        
        <motion.button
          onClick={onNewSession}
          className="w-full btn-primary flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Start New Session</span>
        </motion.button>
      </div>

      {/* Session ID */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Session ID: {session.id}
        </p>
      </div>
    </motion.div>
  )
} 