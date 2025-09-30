/**
 * API Configuration
 * Supports dual-backend architecture for optimal performance
 */

export const API_URLS = {
  // Main backend (Render) - handles all primary API requests
  main: (import.meta.env.VITE_API_URL || 'https://smarthoster-test-deploy.onrender.com').replace(/\/$/, ''),
  
  // Auth backend (Vercel) - handles OTP/email sending only
  // Falls back to main URL if not configured
  auth: (import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_URL || 'https://smarthoster-test-deploy.onrender.com').replace(/\/$/, '')
}

// Helper to get the appropriate base URL
export const getApiUrl = (service: 'main' | 'auth' = 'main'): string => {
  return API_URLS[service]
}