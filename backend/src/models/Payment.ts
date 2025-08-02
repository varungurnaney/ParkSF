import mongoose, { Document, Schema } from 'mongoose'

export interface IPayment extends Document {
  sessionId: mongoose.Types.ObjectId
  licensePlate: string
  amount: number
  fee: number
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  stripePaymentIntentId?: string
  stripeCustomerId?: string
  paymentMethod?: string
  receiptUrl?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const paymentSchema = new Schema<IPayment>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'ParkingSession',
    required: [true, 'Session ID is required']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    trim: true,
    uppercase: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  fee: {
    type: Number,
    required: [true, 'Fee is required'],
    min: [0, 'Fee cannot be negative'],
    default: 0.05
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    trim: true
  },
  stripeCustomerId: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  receiptUrl: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
paymentSchema.index({ sessionId: 1 })
paymentSchema.index({ licensePlate: 1 })
paymentSchema.index({ status: 1 })
paymentSchema.index({ stripePaymentIntentId: 1 })
paymentSchema.index({ createdAt: 1 })

// Virtual for total amount (including fee)
paymentSchema.virtual('totalAmount').get(function(this: IPayment) {
  return this.amount + this.fee
})

// Method to mark as succeeded
paymentSchema.methods.markSucceeded = function(receiptUrl?: string) {
  this.status = 'succeeded'
  if (receiptUrl) {
    this.receiptUrl = receiptUrl
  }
  return this.save()
}

// Method to mark as failed
paymentSchema.methods.markFailed = function() {
  this.status = 'failed'
  return this.save()
}

// Method to refund
paymentSchema.methods.refund = function() {
  this.status = 'refunded'
  return this.save()
}

// Static method to find by Stripe payment intent
paymentSchema.statics.findByStripePaymentIntent = function(stripePaymentIntentId: string) {
  return this.findOne({ stripePaymentIntentId })
}

// Static method to find successful payments by license plate
paymentSchema.statics.findSuccessfulByLicensePlate = function(licensePlate: string) {
  return this.find({
    licensePlate: licensePlate.toUpperCase(),
    status: 'succeeded'
  }).populate('sessionId')
}

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema) 