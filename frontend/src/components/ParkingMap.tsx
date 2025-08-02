'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Car, Clock, DollarSign } from 'lucide-react'

interface ParkingSpot {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rate: number
  available: boolean
  totalSpots: number
  availableSpots: number
  restrictions: string[]
}

interface ParkingMapProps {
  selectedSpot: ParkingSpot | null
  onSpotSelect: (spot: ParkingSpot | null) => void
}

// Mock parking spots in San Francisco
const mockParkingSpots: ParkingSpot[] = [
  {
    id: '1',
    name: 'Mission & 16th St',
    address: 'Mission St & 16th St, San Francisco, CA',
    lat: 37.7651,
    lng: -122.4194,
    rate: 2.50,
    available: true,
    totalSpots: 12,
    availableSpots: 8,
    restrictions: ['2 hour limit', 'No overnight']
  },
  {
    id: '2',
    name: 'Castro & Market',
    address: 'Castro St & Market St, San Francisco, CA',
    lat: 37.7614,
    lng: -122.4350,
    rate: 2.75,
    available: true,
    totalSpots: 8,
    availableSpots: 3,
    restrictions: ['1 hour limit']
  },
  {
    id: '3',
    name: 'Hayes Valley',
    address: 'Hayes St & Octavia Blvd, San Francisco, CA',
    lat: 37.7769,
    lng: -122.4264,
    rate: 2.25,
    available: true,
    totalSpots: 15,
    availableSpots: 12,
    restrictions: ['4 hour limit']
  },
  {
    id: '4',
    name: 'North Beach',
    address: 'Columbus Ave & Broadway, San Francisco, CA',
    lat: 37.7999,
    lng: -122.4084,
    rate: 3.00,
    available: true,
    totalSpots: 6,
    availableSpots: 2,
    restrictions: ['2 hour limit', 'No overnight']
  },
  {
    id: '5',
    name: 'Marina District',
    address: 'Chestnut St & Fillmore St, San Francisco, CA',
    lat: 37.8005,
    lng: -122.4368,
    rate: 2.50,
    available: true,
    totalSpots: 10,
    availableSpots: 7,
    restrictions: ['3 hour limit']
  }
]

export default function ParkingMap({ selectedSpot, onSpotSelect }: ParkingMapProps) {
  const [spots, setSpots] = useState<ParkingSpot[]>(mockParkingSpots)
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null)

  // Simulate real-time availability updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSpots(prevSpots => 
        prevSpots.map(spot => ({
          ...spot,
          availableSpots: Math.max(0, Math.min(spot.totalSpots, 
            spot.availableSpots + (Math.random() > 0.5 ? 1 : -1)
          ))
        }))
      )
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSpotClick = (spot: ParkingSpot) => {
    if (selectedSpot?.id === spot.id) {
      onSpotSelect(null)
    } else {
      onSpotSelect(spot)
    }
  }

  return (
    <div className="relative h-full">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        
        {/* Parking Spots */}
        <div className="relative h-full p-4">
          {spots.map((spot, index) => (
            <motion.div
              key={spot.id}
              className={`absolute cursor-pointer transition-all duration-200 ${
                selectedSpot?.id === spot.id 
                  ? 'scale-110 z-20' 
                  : hoveredSpot === spot.id 
                  ? 'scale-105 z-10' 
                  : 'z-0'
              }`}
              style={{
                left: `${20 + (index * 15)}%`,
                top: `${30 + (index * 10)}%`
              }}
              onMouseEnter={() => setHoveredSpot(spot.id)}
              onMouseLeave={() => setHoveredSpot(null)}
              onClick={() => handleSpotClick(spot)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`
                w-12 h-12 rounded-full border-4 flex items-center justify-center
                ${selectedSpot?.id === spot.id
                  ? 'bg-blue-500 border-blue-600 text-white'
                  : spot.availableSpots > 0
                  ? 'bg-green-500 border-green-600 text-white'
                  : 'bg-red-500 border-red-600 text-white'
                }
                ${hoveredSpot === spot.id ? 'shadow-lg' : 'shadow-md'}
              `}>
                <Car className="w-6 h-6" />
              </div>
              
              {/* Spot Info Popup */}
              {(selectedSpot?.id === spot.id || hoveredSpot === spot.id) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px] z-30"
                >
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900 mb-1">{spot.name}</div>
                    <div className="text-gray-600 text-xs mb-2">{spot.address}</div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium">${spot.rate}/hr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className={`font-medium ${spot.availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {spot.availableSpots}/{spot.totalSpots}
                        </span>
                      </div>
                    </div>
                    
                    {spot.restrictions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Restrictions:</div>
                        {spot.restrictions.map((restriction, idx) => (
                          <div key={idx} className="text-xs text-gray-600">• {restriction}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-xs">
        <div className="font-medium text-gray-900 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Full</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Selected Spot Info */}
      {selectedSpot && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-4 max-w-xs"
        >
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900">Selected Spot</span>
          </div>
          <div className="text-sm space-y-1">
            <div className="font-medium">{selectedSpot.name}</div>
            <div className="text-gray-600 text-xs">{selectedSpot.address}</div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-gray-600">Rate:</span>
              <span className="font-medium">${selectedSpot.rate}/hr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Available:</span>
              <span className="font-medium text-green-600">
                {selectedSpot.availableSpots} spots
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* No Spots Selected Message */}
      {!selectedSpot && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click on a parking spot to select it</p>
          </div>
        </div>
      )}
    </div>
  )
} 