'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Clock, MapPin, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import LicensePlateInput from '@/components/LicensePlateInput'
import DurationSelector from '@/components/DurationSelector'
import ParkingMap from '@/components/ParkingMap'
import PaymentForm from '@/components/PaymentForm'
import SessionConfirmation from '@/components/SessionConfirmation'

type SessionStep = 'license' | 'duration' | 'payment' | 'confirmation'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<SessionStep>('license')
  const [licensePlate, setLicensePlate] = useState('')
  const [duration, setDuration] = useState(60) // minutes
  const [selectedSpot, setSelectedSpot] = useState<any>(null)
  const [sessionData, setSessionData] = useState<any>(null)

  const handleLicensePlateSubmit = (plate: string) => {
    setLicensePlate(plate)
    setCurrentStep('duration')
  }

  const handleDurationSubmit = (selectedDuration: number) => {
    setDuration(selectedDuration)
    setCurrentStep('payment')
  }

  const handlePaymentSuccess = (session: any) => {
    setSessionData(session)
    setCurrentStep('confirmation')
  }

  const resetSession = () => {
    setCurrentStep('license')
    setLicensePlate('')
    setDuration(60)
    setSelectedSpot(null)
    setSessionData(null)
  }

  const calculateCost = () => {
    const hourlyRate = 2.50 // SFMTA average rate
    const hours = duration / 60
    const baseCost = hourlyRate * hours
    const parkSFFee = 0.05
    const sfmtaFee = 0.37 // average of 0.35-0.39
    const savings = sfmtaFee - parkSFFee
    
    return {
      baseCost: baseCost.toFixed(2),
      totalCost: (baseCost + parkSFFee).toFixed(2),
      savings: savings.toFixed(2),
      totalSavings: (baseCost + sfmtaFee - (baseCost + parkSFFee)).toFixed(2)
    }
  }

  const costs = calculateCost()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ParkSF</h1>
                <p className="text-sm text-gray-600">Fair parking in San Francisco</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="savings-badge">
                Save $0.30+ per transaction
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Start Parking Session</h2>
                <span className="text-sm text-gray-500">Step {currentStep === 'license' ? 1 : currentStep === 'duration' ? 2 : currentStep === 'payment' ? 3 : 4} of 4</span>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                {['license', 'duration', 'payment', 'confirmation'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step 
                        ? 'bg-blue-600 text-white' 
                        : ['license', 'duration', 'payment', 'confirmation'].indexOf(currentStep) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {['license', 'duration', 'payment', 'confirmation'].indexOf(currentStep) > index ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < 3 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        ['license', 'duration', 'payment', 'confirmation'].indexOf(currentStep) > index
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 'license' && (
                  <LicensePlateInput onSubmit={handleLicensePlateSubmit} />
                )}
                
                {currentStep === 'duration' && (
                  <DurationSelector 
                    onSubmit={handleDurationSubmit}
                    onBack={() => setCurrentStep('license')}
                  />
                )}
                
                {currentStep === 'payment' && (
                  <PaymentForm
                    licensePlate={licensePlate}
                    duration={duration}
                    costs={costs}
                    onSuccess={handlePaymentSuccess}
                    onBack={() => setCurrentStep('duration')}
                  />
                )}
                
                {currentStep === 'confirmation' && (
                  <SessionConfirmation
                    session={sessionData}
                    licensePlate={licensePlate}
                    duration={duration}
                    costs={costs}
                    onNewSession={resetSession}
                  />
                )}
              </motion.div>
            </div>

            {/* Cost Comparison */}
            {currentStep !== 'confirmation' && (
              <motion.div 
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Cost Comparison
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base parking cost:</span>
                    <span className="font-medium">${costs.baseCost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ParkSF fee:</span>
                    <span className="font-medium text-green-600">$0.05</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">SFMTA fee:</span>
                    <span className="font-medium text-red-600">$0.35-0.39</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">You save:</span>
                      <span className="font-bold text-green-600 text-lg">${costs.savings}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            <div className="card h-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Find Parking
              </h3>
              <ParkingMap 
                selectedSpot={selectedSpot}
                onSpotSelect={setSelectedSpot}
              />
            </div>

            {/* Active Sessions Check */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Active Session</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter license plate"
                  className="input-field"
                />
                <button className="btn-primary w-full">
                  Check Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 ParkSF. Community-first parking with ultra-low fees.</p>
            <p className="mt-1">Pay just $0.05 instead of $0.35-0.39 per transaction.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
