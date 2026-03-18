#!/usr/bin/env node
/**
 * Test script for billing API
 * Run with: node test-billing.js
 */

const http = require('http');

// Test sample bill creation request
const testData = {
  medicines: [
    {
      medicineId: "507f1f77bcf86cd799439011",
      quantity: 2
    }
  ],
  patientName: "John Doe",
  patientPhone: "9876543210",
  paymentMethod: "cash",
  discount: 0,
  notes: "Test billing"
};

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/pharmacy/sales',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token' // You'll need a valid token
  }
};

console.log(' Testing billing API...\n');
console.log('Request Details:');
console.log('- Endpoint:', options.path);
console.log('- Method:', options.method);
console.log('- Payload:', JSON.stringify(testData, null, 2));
console.log('\n⏳ Sending request...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('[PASS] Response Status:', res.statusCode);
    console.log(' Response Headers:', res.headers);
    console.log('\n Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (!parsed.success) {
        console.log('\n[FAIL] Error Message:', parsed.message);
        if (parsed.error && typeof parsed.error === 'object') {
          console.log('Error Details:', JSON.stringify(parsed.error, null, 2));
        }
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('[FAIL] Request Error:', error.message);
  console.error('Stack:', error.stack);
});

req.write(JSON.stringify(testData));
req.end();
