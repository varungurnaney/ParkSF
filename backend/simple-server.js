const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Mock parking spots data
const parkingSpots = [
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
    restrictions: ['2 hour limit', 'No overnight'],
    zone: 'Mission'
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
    restrictions: ['1 hour limit'],
    zone: 'Castro'
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
    restrictions: ['4 hour limit'],
    zone: 'Hayes Valley'
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
    restrictions: ['2 hour limit', 'No overnight'],
    zone: 'North Beach'
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
    restrictions: ['3 hour limit'],
    zone: 'Marina'
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get all parking spots
app.get('/api/parking', (req, res) => {
  res.json({
    success: true,
    data: parkingSpots,
    timestamp: new Date().toISOString()
  });
});

// Create parking session
app.post('/api/parking', (req, res) => {
  try {
    const { licensePlate, duration, totalCost } = req.body;
    
    const session = {
      id: 'session_' + Date.now(),
      licensePlate: licensePlate,
      duration: duration,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + duration * 60000).toISOString(),
      totalCost: totalCost,
      feePaid: 0.05,
      feeSaved: 0.32
    };
    
    res.json({
      success: true,
      data: session,
      message: 'Parking session created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid request data'
    });
  }
});

// Process payment
app.post('/api/payment', (req, res) => {
  try {
    const { licensePlate, duration, amount } = req.body;
    
    if (!licensePlate || !duration || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Simulate payment processing delay
    setTimeout(() => {
      const payment = {
        id: 'pay_' + Date.now(),
        licensePlate: licensePlate,
        amount: amount,
        fee: 0.05,
        status: 'succeeded',
        createdAt: new Date().toISOString(),
        sessionId: 'session_' + Date.now()
      };
      
      const session = {
        id: payment.sessionId,
        licensePlate: licensePlate,
        duration: duration,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + duration * 60000).toISOString(),
        totalCost: amount,
        feePaid: 0.05,
        feeSaved: 0.32,
        paymentId: payment.id
      };
      
      res.json({
        success: true,
        data: {
          payment: payment,
          session: session
        },
        message: 'Payment processed successfully'
      });
    }, 2000);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Payment processing failed'
    });
  }
});

// Get active session by license plate
app.get('/api/sessions/:licensePlate', (req, res) => {
  try {
    const { licensePlate } = req.params;
    
    // Mock active sessions
    const mockActiveSessions = [
      {
        id: 'session_1703123456789',
        licensePlate: 'ABC123',
        duration: 60,
        startTime: '2024-01-15T10:30:00.000Z',
        endTime: '2024-01-15T11:30:00.000Z',
        totalCost: 2.55,
        feePaid: 0.05,
        feeSaved: 0.32,
        status: 'active'
      }
    ];
    
    const activeSession = mockActiveSessions.find(
      session => session.licensePlate === licensePlate.toUpperCase() && session.status === 'active'
    );
    
    if (!activeSession) {
      return res.json({
        success: true,
        data: null,
        message: 'No active session found for this license plate'
      });
    }
    
    // Calculate time remaining
    const now = new Date();
    const endTime = new Date(activeSession.endTime);
    const timeRemaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    
    res.json({
      success: true,
      data: {
        ...activeSession,
        timeRemaining: timeRemaining,
        isExpired: timeRemaining <= 0
      },
      message: 'Active session found'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to lookup session'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ParkSF API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ParkSF Simple Backend server running on port', PORT);
  console.log('📊 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 API URL: http://localhost:' + PORT);
  console.log('⚠️  Running in mock mode - no database required');
});

module.exports = app; 