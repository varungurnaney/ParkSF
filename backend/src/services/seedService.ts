import { ParkingSpot } from '../models/ParkingSpot'
import { logger } from '../utils/logger'

const initialParkingSpots = [
  {
    name: 'Mission & 16th St',
    address: 'Mission St & 16th St, San Francisco, CA',
    lat: 37.7651,
    lng: -122.4194,
    rate: 2.50,
    available: true,
    totalSpots: 12,
    availableSpots: 8,
    restrictions: ['2 hour limit', 'No overnight'],
    zone: 'Mission'
  },
  {
    name: 'Castro & Market',
    address: 'Castro St & Market St, San Francisco, CA',
    lat: 37.7614,
    lng: -122.4350,
    rate: 2.75,
    available: true,
    totalSpots: 8,
    availableSpots: 3,
    restrictions: ['1 hour limit'],
    zone: 'Castro'
  },
  {
    name: 'Hayes Valley',
    address: 'Hayes St & Octavia Blvd, San Francisco, CA',
    lat: 37.7769,
    lng: -122.4264,
    rate: 2.25,
    available: true,
    totalSpots: 15,
    availableSpots: 12,
    restrictions: ['4 hour limit'],
    zone: 'Hayes Valley'
  },
  {
    name: 'North Beach',
    address: 'Columbus Ave & Broadway, San Francisco, CA',
    lat: 37.7999,
    lng: -122.4084,
    rate: 3.00,
    available: true,
    totalSpots: 6,
    availableSpots: 2,
    restrictions: ['2 hour limit', 'No overnight'],
    zone: 'North Beach'
  },
  {
    name: 'Marina District',
    address: 'Chestnut St & Fillmore St, San Francisco, CA',
    lat: 37.8005,
    lng: -122.4368,
    rate: 2.50,
    available: true,
    totalSpots: 10,
    availableSpots: 7,
    restrictions: ['3 hour limit'],
    zone: 'Marina'
  },
  {
    name: 'Fisherman\'s Wharf',
    address: 'Jefferson St & Taylor St, San Francisco, CA',
    lat: 37.8080,
    lng: -122.4150,
    rate: 4.00,
    available: true,
    totalSpots: 20,
    availableSpots: 15,
    restrictions: ['2 hour limit'],
    zone: 'Fisherman\'s Wharf'
  },
  {
    name: 'Chinatown',
    address: 'Grant Ave & Washington St, San Francisco, CA',
    lat: 37.7941,
    lng: -122.4070,
    rate: 2.75,
    available: true,
    totalSpots: 8,
    availableSpots: 5,
    restrictions: ['1 hour limit', 'No overnight'],
    zone: 'Chinatown'
  },
  {
    name: 'Haight-Ashbury',
    address: 'Haight St & Ashbury St, San Francisco, CA',
    lat: 37.7694,
    lng: -122.4467,
    rate: 2.25,
    available: true,
    totalSpots: 12,
    availableSpots: 9,
    restrictions: ['2 hour limit'],
    zone: 'Haight-Ashbury'
  },
  {
    name: 'Pacific Heights',
    address: 'Fillmore St & California St, San Francisco, CA',
    lat: 37.7895,
    lng: -122.4340,
    rate: 3.50,
    available: true,
    totalSpots: 6,
    availableSpots: 4,
    restrictions: ['2 hour limit'],
    zone: 'Pacific Heights'
  },
  {
    name: 'SoMa',
    address: 'Howard St & 2nd St, San Francisco, CA',
    lat: 37.7869,
    lng: -122.3980,
    rate: 3.25,
    available: true,
    totalSpots: 18,
    availableSpots: 14,
    restrictions: ['4 hour limit'],
    zone: 'SoMa'
  }
]

export const seedParkingSpots = async (): Promise<void> => {
  try {
    // Check if data already exists
    const existingSpots = await ParkingSpot.countDocuments()
    
    if (existingSpots > 0) {
      logger.info('Parking spots already seeded, skipping...')
      return
    }

    // Create parking spots
    const createdSpots = await ParkingSpot.insertMany(initialParkingSpots)
    
    logger.info(`✅ Seeded ${createdSpots.length} parking spots`)
  } catch (error) {
    logger.error('Error seeding parking spots:', error)
    throw error
  }
}

export const clearParkingSpots = async (): Promise<void> => {
  try {
    await ParkingSpot.deleteMany({})
    logger.info('✅ Cleared all parking spots')
  } catch (error) {
    logger.error('Error clearing parking spots:', error)
    throw error
  }
} 