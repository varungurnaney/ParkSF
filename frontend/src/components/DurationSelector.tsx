'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react'

interface DurationSelectorProps {
  onSubmit: (duration: number) => void
  onBack: () => void
}

const presetDurations = [
  { label: '15 minutes', value: 15, price: 0.63 },
  { label: '30 minutes', value: 30, price: 1.25 },
  { label: '1 hour', value: 60, price: 2.50 },
  { label: '2 hours', value: 120, price: 5.00 },
  { label: '4 hours', value: 240, price: 10.00 },
  { label: 'All day', value: 480, price: 20.00 }
]

export default function DurationSelector({ onSubmit, onBack }: DurationSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [customDuration, setCustomDuration] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handlePresetSelect = (duration: number) => {
    setSelectedDuration(duration)
    setShowCustom(false)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const minutes = parseInt(customDuration)
    if (minutes >= 15 && minutes <= 1440) { // 15 min to 24 hours
      onSubmit(minutes)
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else if (minutes === 60) {
      return '1 hour'
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      if (remainingMinutes === 0) {
        return `${hours} hours`
      }
      return `${hours}h ${remainingMinutes}m`
    } else {
      return '24+ hours'
    }
  }

  const calculateCost = (minutes: number) => {
    const hourlyRate = 2.50
    const hours = minutes / 60
    return (hourlyRate * hours).toFixed(2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          How long will you park?
        </h3>
        <p className="text-gray-600">
          Choose your parking duration
        </p>
      </div>

      <div className="space-y-4">
        {/* Preset Options */}
        <div className="grid grid-cols-2 gap-3">
          {presetDurations.map((preset) => (
            <motion.button
              key={preset.value}
              onClick={() => handlePresetSelect(preset.value)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedDuration === preset.value && !showCustom
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  {preset.label}
                </div>
                <div className="text-sm text-gray-600">
                  ${preset.price} + $0.05 fee
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Custom Duration */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="w-full p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            {showCustom ? 'Hide' : 'Custom duration'}
          </button>

          {showCustom && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCustomSubmit}
              className="mt-3 space-y-3"
            >
              <div>
                <label htmlFor="customDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  id="customDuration"
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Enter minutes (15-1440)"
                  min="15"
                  max="1440"
                  className="input-field"
                />
              </div>
              {customDuration && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Duration: {formatDuration(parseInt(customDuration) || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cost: ${calculateCost(parseInt(customDuration) || 0)} + $0.05 fee
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={!customDuration || parseInt(customDuration) < 15 || parseInt(customDuration) > 1440}
              >
                Use Custom Duration
              </button>
            </motion.form>
          )}
        </div>

        {/* Navigation */}
        <div className="flex space-x-3 pt-4">
          <motion.button
            onClick={onBack}
            className="btn-secondary flex-1 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>
          
          <motion.button
            onClick={() => onSubmit(selectedDuration)}
            className="btn-primary flex-1 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Selected Duration Summary */}
      {!showCustom && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-900">
                Selected: {formatDuration(selectedDuration)}
              </div>
              <div className="text-sm text-blue-700">
                ${calculateCost(selectedDuration)} + $0.05 fee
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700">You save</div>
              <div className="font-bold text-green-600">$0.32</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 