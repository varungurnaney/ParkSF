import mongoose, { Document, Schema } from 'mongoose'

export interface IParkingSpot extends Document {
  name: string
  address: string
  lat: number
  lng: number
  rate: number
  available: boolean
  totalSpots: number
  availableSpots: number
  restrictions: string[]
  zone: string
  lastUpdated: Date
  isActive: boolean
}

const parkingSpotSchema = new Schema<IParkingSpot>({
  name: {
    type: String,
    required: [true, 'Parking spot name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  lat: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  lng: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [0, 'Rate cannot be negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  totalSpots: {
    type: Number,
    required: [true, 'Total spots is required'],
    min: [1, 'Total spots must be at least 1']
  },
  availableSpots: {
    type: Number,
    required: [true, 'Available spots is required'],
    min: [0, 'Available spots cannot be negative'],
    validate: {
      validator: function(this: IParkingSpot, value: number) {
        return value <= this.totalSpots
      },
      message: 'Available spots cannot exceed total spots'
    }
  },
  restrictions: [{
    type: String,
    trim: true
  }],
  zone: {
    type: String,
    required: [true, 'Zone is required'],
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for geospatial queries
parkingSpotSchema.index({ lat: 1, lng: 1 })
parkingSpotSchema.index({ available: 1, isActive: 1 })
parkingSpotSchema.index({ zone: 1 })

// Virtual for occupancy percentage
parkingSpotSchema.virtual('occupancyPercentage').get(function(this: IParkingSpot) {
  return ((this.totalSpots - this.availableSpots) / this.totalSpots) * 100
})

// Method to update availability
parkingSpotSchema.methods.updateAvailability = function(spotsTaken: number) {
  this.availableSpots = Math.max(0, this.availableSpots - spotsTaken)
  this.lastUpdated = new Date()
  return this.save()
}

// Static method to find nearby spots
parkingSpotSchema.statics.findNearby = function(lat: number, lng: number, maxDistance: number = 5000) {
  return this.find({
    lat: { $gte: lat - 0.05, $lte: lat + 0.05 },
    lng: { $gte: lng - 0.05, $lte: lng + 0.05 },
    available: true,
    isActive: true
  })
}

export const ParkingSpot = mongoose.model<IParkingSpot>('ParkingSpot', parkingSpotSchema) 