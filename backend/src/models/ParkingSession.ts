import mongoose, { Document, Schema } from 'mongoose'

export interface IParkingSession extends Document {
  licensePlate: string
  parkingSpotId: mongoose.Types.ObjectId
  duration: number // in minutes
  startTime: Date
  endTime: Date
  totalCost: number
  feePaid: number
  feeSaved: number
  status: 'active' | 'expired' | 'cancelled'
  paymentId?: string
  stripePaymentIntentId?: string
  createdAt: Date
  updatedAt: Date
}

const parkingSessionSchema = new Schema<IParkingSession>({
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]+$/, 'License plate must contain only letters and numbers']
  },
  parkingSpotId: {
    type: Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: [true, 'Parking spot is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [1440, 'Duration cannot exceed 24 hours (1440 minutes)']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: [0, 'Total cost cannot be negative']
  },
  feePaid: {
    type: Number,
    required: [true, 'Fee paid is required'],
    min: [0, 'Fee paid cannot be negative'],
    default: 0.05
  },
  feeSaved: {
    type: Number,
    required: [true, 'Fee saved is required'],
    min: [0, 'Fee saved cannot be negative'],
    default: 0.32
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  paymentId: {
    type: String,
    trim: true
  },
  stripePaymentIntentId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
parkingSessionSchema.index({ licensePlate: 1, status: 1 })
parkingSessionSchema.index({ startTime: 1, endTime: 1 })
parkingSessionSchema.index({ status: 1 })
parkingSessionSchema.index({ parkingSpotId: 1 })

// Virtual for time remaining
parkingSessionSchema.virtual('timeRemaining').get(function(this: IParkingSession) {
  const now = new Date()
  const endTime = new Date(this.endTime)
  return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
})

// Virtual for is expired
parkingSessionSchema.virtual('isExpired').get(function(this: IParkingSession) {
  return new Date() > new Date(this.endTime)
})

// Method to check if session is active
parkingSessionSchema.methods.isActive = function(): boolean {
  const now = new Date()
  return this.status === 'active' && now >= this.startTime && now <= this.endTime
}

// Method to extend session
parkingSessionSchema.methods.extend = function(additionalMinutes: number, additionalCost: number) {
  this.duration += additionalMinutes
  this.endTime = new Date(this.endTime.getTime() + additionalMinutes * 60000)
  this.totalCost += additionalCost
  return this.save()
}

// Method to cancel session
parkingSessionSchema.methods.cancel = function() {
  this.status = 'cancelled'
  return this.save()
}

// Static method to find active sessions by license plate
parkingSessionSchema.statics.findActiveByLicensePlate = function(licensePlate: string) {
  return this.findOne({
    licensePlate: licensePlate.toUpperCase(),
    status: 'active',
    startTime: { $lte: new Date() },
    endTime: { $gte: new Date() }
  }).populate('parkingSpotId')
}

// Static method to find expired sessions
parkingSessionSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    endTime: { $lt: new Date() }
  })
}

// Pre-save middleware to calculate end time
parkingSessionSchema.pre('save', function(next) {
  if (this.isModified('startTime') || this.isModified('duration')) {
    this.endTime = new Date(this.startTime.getTime() + this.duration * 60000)
  }
  next()
})

export const ParkingSession = mongoose.model<IParkingSession>('ParkingSession', parkingSessionSchema) 