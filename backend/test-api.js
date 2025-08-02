#!/usr/bin/env node

const http = require('http');

const API_BASE = 'http://localhost:3001/api';

// Test health endpoint
function testHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get(`${API_BASE}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'ok') {
            console.log('✅ Health check passed');
            resolve();
          } else {
            console.log('❌ Health check failed:', response);
            reject(new Error('Health check failed'));
          }
        } catch (error) {
          console.log('❌ Invalid JSON response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Health check error:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
  });
}

// Test parking spots endpoint
function testParkingSpots() {
  return new Promise((resolve, reject) => {
    const req = http.get(`${API_BASE}/parking`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && Array.isArray(response.data)) {
            console.log(`✅ Parking spots endpoint working (${response.data.length} spots)`);
            resolve();
          } else {
            console.log('❌ Parking spots endpoint failed:', response);
            reject(new Error('Parking spots endpoint failed'));
          }
        } catch (error) {
          console.log('❌ Invalid JSON response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Parking spots error:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Parking spots timeout'));
    });
  });
}

// Main test function
async function runTests() {
  console.log('🧪 Testing ParkSF Backend API...\n');

  try {
    await testHealth();
    await testParkingSpots();
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    console.log('\n📱 You can now start the frontend with: cd frontend && npm run dev');
    console.log('🔗 Frontend will be available at: http://localhost:3000');
    
  } catch (error) {
    console.log('\n❌ Tests failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Backend is running: cd backend && npm run dev');
    console.log('   2. MongoDB is running: mongod');
    console.log('   3. Environment variables are set correctly');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 