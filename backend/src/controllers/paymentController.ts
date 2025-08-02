import { Request, Response } from 'express'
import Stripe from 'stripe'
import { Payment } from '../models/Payment'
import { ParkingSession } from '../models/ParkingSession'
import { logger } from '../utils/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
})

// Process payment
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { licensePlate, parkingSpotId, duration, amount, paymentMethodId } = req.body

    // Validate required fields
    if (!licensePlate || !parkingSpotId || !duration || !amount || !paymentMethodId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
      return
    }

    // Check if there's already an active session for this license plate
    const existingSession = await ParkingSession.findActiveByLicensePlate(licensePlate)
    if (existingSession) {
      res.status(400).json({
        success: false,
        error: 'License plate already has an active parking session'
      })
      return
    }

    // Calculate fees
    const parksfFee = parseFloat(process.env.PARKSF_FEE || '0.05')
    const sfmtaFee = parseFloat(process.env.SFMTA_FEE || '0.37')
    const feeSaved = sfmtaFee - parksfFee
    const totalAmount = amount + parksfFee

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.CORS_ORIGIN}/payment/success`,
      metadata: {
        licensePlate: licensePlate.toUpperCase(),
        parkingSpotId,
        duration: duration.toString(),
        amount: amount.toString(),
        fee: parksfFee.toString(),
        feeSaved: feeSaved.toString()
      }
    })

    if (paymentIntent.status === 'succeeded') {
      // Create parking session
      const session = new ParkingSession({
        licensePlate: licensePlate.toUpperCase(),
        parkingSpotId,
        duration,
        totalCost: amount,
        feePaid: parksfFee,
        feeSaved
      })

      await session.save()

      // Create payment record
      const payment = new Payment({
        sessionId: session._id,
        licensePlate: licensePlate.toUpperCase(),
        amount,
        fee: parksfFee,
        status: 'succeeded',
        stripePaymentIntentId: paymentIntent.id,
        paymentMethod: paymentMethodId,
        receiptUrl: paymentIntent.charges.data[0]?.receipt_url
      })

      await payment.save()

      res.json({
        success: true,
        data: {
          payment,
          session
        },
        message: 'Payment processed successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment failed',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret
        }
      })
    }
  } catch (error) {
    logger.error('Error processing payment:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'Payment processing failed'
      })
    }
  }
}

// Create payment intent (for client-side confirmation)
export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, licensePlate, parkingSpotId, duration } = req.body

    if (!amount || !licensePlate || !parkingSpotId || !duration) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
      return
    }

    const parksfFee = parseFloat(process.env.PARKSF_FEE || '0.05')
    const totalAmount = amount + parksfFee

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      metadata: {
        licensePlate: licensePlate.toUpperCase(),
        parkingSpotId,
        duration: duration.toString(),
        amount: amount.toString(),
        fee: parksfFee.toString()
      }
    })

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    })
  } catch (error) {
    logger.error('Error creating payment intent:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    })
  }
}

// Confirm payment
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId } = req.body

    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      })
      return
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      // Find existing payment record
      const payment = await Payment.findByStripePaymentIntent(paymentIntentId)
      
      if (payment) {
        await payment.markSucceeded(paymentIntent.charges.data[0]?.receipt_url)
        
        res.json({
          success: true,
          data: payment,
          message: 'Payment confirmed successfully'
        })
      } else {
        res.status(404).json({
          success: false,
          error: 'Payment record not found'
        })
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment not succeeded',
        status: paymentIntent.status
      })
    }
  } catch (error) {
    logger.error('Error confirming payment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment'
    })
  }
}

// Get payment by ID
export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const payment = await Payment.findById(id).populate('sessionId')

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found'
      })
      return
    }

    res.json({
      success: true,
      data: payment
    })
  } catch (error) {
    logger.error('Error fetching payment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment'
    })
  }
}

// Refund payment
export const refundPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const payment = await Payment.findById(id)
    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found'
      })
      return
    }

    if (payment.status !== 'succeeded') {
      res.status(400).json({
        success: false,
        error: 'Payment cannot be refunded'
      })
      return
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId
    })

    // Update payment status
    await payment.refund()

    // Cancel associated parking session
    const session = await ParkingSession.findById(payment.sessionId)
    if (session) {
      await session.cancel()
    }

    res.json({
      success: true,
      data: payment,
      refund: refund,
      message: 'Payment refunded successfully'
    })
  } catch (error) {
    logger.error('Error refunding payment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to refund payment'
    })
  }
}

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !endpointSecret) {
    res.status(400).json({ error: 'Missing signature or webhook secret' })
    return
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    logger.error('Webhook signature verification failed:', err)
    res.status(400).json({ error: 'Invalid signature' })
    return
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        logger.info('Payment succeeded:', paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        logger.error('Payment failed:', failedPayment.id)
        break

      default:
        logger.info(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    logger.error('Error handling webhook:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
} 