'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, ArrowRight } from 'lucide-react'

interface LicensePlateInputProps {
  onSubmit: (licensePlate: string) => void
}

export default function LicensePlateInput({ onSubmit }: LicensePlateInputProps) {
  const [licensePlate, setLicensePlate] = useState('')
  const [error, setError] = useState('')

  const validateLicensePlate = (plate: string) => {
    // Remove spaces and convert to uppercase
    const cleaned = plate.replace(/\s/g, '').toUpperCase()
    
    // Basic validation for California license plates
    if (cleaned.length < 2 || cleaned.length > 8) {
      return 'License plate must be 2-8 characters'
    }
    
    // Check for valid characters (letters, numbers, and some special characters)
    const validPattern = /^[A-Z0-9]+$/
    if (!validPattern.test(cleaned)) {
      return 'License plate can only contain letters and numbers'
    }
    
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateLicensePlate(licensePlate)
    
    if (validationError) {
      setError(validationError)
      return
    }
    
    setError('')
    onSubmit(licensePlate.replace(/\s/g, '').toUpperCase())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLicensePlate(value)
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Enter Your License Plate
        </h3>
        <p className="text-gray-600">
          We'll use this to manage your parking session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
            License Plate Number
          </label>
          <div className="relative">
            <input
              id="licensePlate"
              type="text"
              value={licensePlate}
              onChange={handleInputChange}
              placeholder="ABC123"
              className={`input-field text-center text-lg font-mono tracking-wider ${
                error ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              maxLength={10}
              autoFocus
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Car className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}
        </div>

        <motion.button
          type="submit"
          className="btn-primary w-full flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!licensePlate.trim()}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Privacy First
            </h4>
            <p className="text-sm text-blue-700">
              We only store your license plate for active parking sessions. 
              No personal information required.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 