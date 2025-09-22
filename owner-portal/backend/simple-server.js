// Simple server that works without database for testing
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://smarthoster.io',
    'https://test.smarthoster.io',
    'https://dashboard.smarthoster.io',
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.vercel\.dev$/
  ],
  credentials: true
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Hoster Owner Portal API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    status: 'working without database'
  });
});

// Health check
app.get('/test/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Test endpoint
app.get('/test/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Mock admin endpoint (no database required)
app.get('/admin/check-admin-exists', (req, res) => {
  res.json({
    exists: false,
    message: 'Mock response - no database connection'
  });
});

module.exports = app;
