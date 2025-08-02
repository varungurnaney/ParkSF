# ParkSF Backend API

A robust Node.js/Express backend for the ParkSF parking application with MongoDB database, Stripe payment processing, and real-time updates via Socket.IO.

## 🚀 Features

- **RESTful API** - Complete CRUD operations for parking spots, sessions, and payments
- **Real-time Updates** - Socket.IO integration for live parking spot availability
- **Payment Processing** - Stripe integration for secure payment processing
- **Database** - MongoDB with Mongoose ODM for data persistence
- **Authentication** - JWT-based authentication (ready for implementation)
- **Rate Limiting** - Built-in rate limiting for API protection
- **Logging** - Winston logger with file and console output
- **Cron Jobs** - Automated cleanup of expired sessions
- **Health Checks** - Comprehensive health monitoring endpoints
- **TypeScript** - Full TypeScript support with strict type checking

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Stripe account (for payment processing)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/parksf
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
All endpoints return JSON responses with the following structure:
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

### Parking Spots

#### GET /api/parking
Get all parking spots with optional filtering.

**Query Parameters:**
- `lat` (number) - Latitude for location filtering
- `lng` (number) - Longitude for location filtering
- `radius` (number) - Search radius in degrees (default: 0.05)
- `zone` (string) - Filter by zone

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Mission & 16th St",
      "address": "Mission St & 16th St, San Francisco, CA",
      "lat": 37.7651,
      "lng": -122.4194,
      "rate": 2.50,
      "available": true,
      "totalSpots": 12,
      "availableSpots": 8,
      "restrictions": ["2 hour limit", "No overnight"],
      "zone": "Mission"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api/parking/:id
Get a specific parking spot by ID.

#### POST /api/parking/session
Create a new parking session.

**Request Body:**
```json
{
  "licensePlate": "ABC123",
  "parkingSpotId": "parking_spot_id",
  "duration": 60,
  "totalCost": 2.50
}
```

#### PUT /api/parking/:id/availability
Update parking spot availability.

**Request Body:**
```json
{
  "availableSpots": 5
}
```

### Payments

#### POST /api/payment/process
Process a payment with Stripe.

**Request Body:**
```json
{
  "licensePlate": "ABC123",
  "parkingSpotId": "parking_spot_id",
  "duration": 60,
  "amount": 2.50,
  "paymentMethodId": "pm_card_visa"
}
```

#### POST /api/payment/intent
Create a payment intent for client-side confirmation.

**Request Body:**
```json
{
  "amount": 2.50,
  "licensePlate": "ABC123",
  "parkingSpotId": "parking_spot_id",
  "duration": 60
}
```

#### GET /api/payment/:id
Get payment details by ID.

#### POST /api/payment/:id/refund
Refund a payment.

### Sessions

#### GET /api/sessions/:licensePlate
Get active session for a license plate.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "licensePlate": "ABC123",
    "duration": 60,
    "startTime": "2024-01-15T10:30:00.000Z",
    "endTime": "2024-01-15T11:30:00.000Z",
    "totalCost": 2.55,
    "feePaid": 0.05,
    "feeSaved": 0.32,
    "status": "active",
    "timeRemaining": 1800,
    "isExpired": false
  }
}
```

#### GET /api/sessions/:licensePlate/history
Get session history for a license plate.

**Query Parameters:**
- `status` (string) - Filter by status
- `limit` (number) - Number of results (default: 10)
- `page` (number) - Page number (default: 1)

#### PUT /api/sessions/:id/extend
Extend an active session.

**Request Body:**
```json
{
  "additionalMinutes": 30,
  "additionalCost": 1.25
}
```

#### DELETE /api/sessions/:id
Cancel an active session.

### Health Checks

#### GET /api/health
Basic health check.

#### GET /api/health/detailed
Detailed health check with database and memory information.

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Database Models

#### ParkingSpot
- `name` (string) - Parking spot name
- `address` (string) - Full address
- `lat` (number) - Latitude
- `lng` (number) - Longitude
- `rate` (number) - Hourly rate
- `available` (boolean) - Overall availability
- `totalSpots` (number) - Total parking spots
- `availableSpots` (number) - Available spots
- `restrictions` (array) - Parking restrictions
- `zone` (string) - Neighborhood zone

#### ParkingSession
- `licensePlate` (string) - Vehicle license plate
- `parkingSpotId` (ObjectId) - Reference to parking spot
- `duration` (number) - Duration in minutes
- `startTime` (Date) - Session start time
- `endTime` (Date) - Session end time
- `totalCost` (number) - Total cost
- `feePaid` (number) - ParkSF fee paid
- `feeSaved` (number) - Fee saved vs SFMTA
- `status` (string) - active/expired/cancelled

#### Payment
- `sessionId` (ObjectId) - Reference to parking session
- `licensePlate` (string) - Vehicle license plate
- `amount` (number) - Payment amount
- `fee` (number) - Processing fee
- `status` (string) - pending/succeeded/failed/refunded
- `stripePaymentIntentId` (string) - Stripe payment intent ID

### Real-time Updates

The backend uses Socket.IO for real-time updates:

```javascript
// Client connection
const socket = io('http://localhost:3001')

// Join parking updates room
socket.emit('join-parking-updates')

// Listen for parking spot updates
socket.on('parking-spot-updated', (data) => {
  console.log('Parking spot updated:', data)
  // Update UI with new availability
})
```

### Cron Jobs

Automated tasks run in the background:

- **Session Cleanup** - Every 5 minutes, expires old sessions
- **System Monitoring** - Every hour, logs system status

## 🔒 Security

- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS** - Configured for frontend domain
- **Helmet** - Security headers
- **Input Validation** - Joi validation for all inputs
- **Error Handling** - Comprehensive error handling

## 🚀 Deployment

### Environment Variables

Required for production:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI_PROD=your_production_mongodb_uri
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build and Deploy

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Monitoring

### Health Endpoints

- `/api/health` - Basic health check
- `/api/health/detailed` - Detailed system status

### Logging

Logs are written to:
- Console (development)
- `logs/app.log` (all logs)
- `logs/app-error.log` (error logs only)

### Metrics

The API provides statistics endpoints:
- `/api/parking/stats` - Parking statistics
- `/api/sessions/:licensePlate/stats` - User statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for San Francisco** 