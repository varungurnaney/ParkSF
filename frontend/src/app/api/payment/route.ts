import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.licensePlate || !body.duration || !body.amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate payment success (in real app, this would integrate with Stripe)
    const payment = {
      id: `pay_${Date.now()}`,
      licensePlate: body.licensePlate,
      amount: body.amount,
      fee: 0.05,
      status: 'succeeded',
      createdAt: new Date().toISOString(),
      sessionId: `session_${Date.now()}`
    }
    
    // Create parking session
    const session = {
      id: payment.sessionId,
      licensePlate: body.licensePlate,
      duration: body.duration,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + body.duration * 60000).toISOString(),
      totalCost: body.amount,
      feePaid: 0.05,
      feeSaved: 0.32,
      paymentId: payment.id
    }
    
    return NextResponse.json({
      success: true,
      data: {
        payment,
        session
      },
      message: 'Payment processed successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    )
  }
} 