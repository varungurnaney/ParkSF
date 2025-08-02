#!/bin/bash

echo "🚗 Starting ParkSF - Fair Parking in San Francisco"
echo "=================================================="

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found. Please run this from the ParkSF root directory."
    exit 1
fi

# Kill any existing Next.js processes
echo "🔄 Cleaning up any existing processes..."
pkill -f "next dev" 2>/dev/null || true

# Clean build cache
echo "🧹 Cleaning build cache..."
cd frontend
rm -rf .next 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🚀 Starting development server..."
echo "📍 ParkSF will be available at: http://localhost:3000"
echo "🔄 Press Ctrl+C to stop the server"
echo ""

npm run dev 