import express from 'express'
import {
  processPayment,
  createPaymentIntent,
  confirmPayment,
  getPaymentById,
  refundPayment,
  handleStripeWebhook
} from '../controllers/paymentController'

const router = express.Router()

// POST /api/payment/process - Process payment
router.post('/process', processPayment)

// POST /api/payment/intent - Create payment intent
router.post('/intent', createPaymentIntent)

// POST /api/payment/confirm - Confirm payment
router.post('/confirm', confirmPayment)

// GET /api/payment/:id - Get payment by ID
router.get('/:id', getPaymentById)

// POST /api/payment/:id/refund - Refund payment
router.post('/:id/refund', refundPayment)

// POST /api/payment/webhook - Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

export default router 