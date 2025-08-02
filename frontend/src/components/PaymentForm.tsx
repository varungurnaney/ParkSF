'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, ArrowLeft, CheckCircle, DollarSign } from 'lucide-react'

interface PaymentFormProps {
  licensePlate: string
  duration: number
  costs: {
    baseCost: string
    totalCost: string
    savings: string
    totalSavings: string
  }
  onSuccess: (session: any) => void
  onBack: () => void
}

export default function PaymentForm({ 
  licensePlate, 
  duration, 
  costs, 
  onSuccess, 
  onBack 
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
      
      // Simulate successful payment
      setTimeout(() => {
        const session = {
          id: `session_${Date.now()}`,
          licensePlate,
          duration,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + duration * 60000).toISOString(),
          totalCost: parseFloat(costs.totalCost),
          feePaid: 0.05,
          feeSaved: parseFloat(costs.savings)
        }
        onSuccess(session)
      }, 1500)
    }, 2000)
  }

  if (paymentSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Processing Payment...
        </h3>
        <p className="text-gray-600">
          Please wait while we complete your transaction
        </p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Complete Payment
        </h3>
        <p className="text-gray-600">
          Secure payment with ultra-low fees
        </p>
      </div>

      {/* Session Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Session Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">License Plate:</span>
            <span className="font-mono font-medium">{licensePlate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{formatDuration(duration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Start Time:</span>
            <span className="font-medium">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
          Cost Breakdown
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Base parking cost:</span>
            <span className="font-medium">${costs.baseCost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ParkSF fee:</span>
            <span className="font-medium text-green-600">$0.05</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span className="text-lg">${costs.totalCost}</span>
            </div>
          </div>
        </div>
        
        {/* Savings Highlight */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-800">You save vs SFMTA:</div>
              <div className="text-xs text-green-600">$0.35-0.39 vs $0.05</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">${costs.savings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              id="expiry"
              type="text"
              placeholder="MM/YY"
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <input
              id="cvc"
              type="text"
              placeholder="123"
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            className="input-field"
            required
          />
        </div>

        {/* Navigation */}
        <div className="flex space-x-3 pt-4">
          <motion.button
            type="button"
            onClick={onBack}
            className="btn-secondary flex-1 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isProcessing}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>
          
          <motion.button
            type="submit"
            className="btn-primary flex-1 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Pay ${costs.totalCost}</span>
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">🔒</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Secure Payment
            </h4>
            <p className="text-sm text-blue-700">
              Your payment information is encrypted and secure. 
              We use industry-standard SSL encryption.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 