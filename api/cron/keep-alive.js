/**
 * Vercel Cron Job - MongoDB Keep-Alive
 * 
 * This endpoint is called by Vercel every 15 minutes to keep MongoDB Atlas awake
 * and prevent sleep-related 500 errors.
 * 
 * Schedule: Every 15 minutes (*/15 * * * *)
 * URL: https://smarthoster-test-deploy.vercel.app/api/cron/keep-alive
 */

export default async function handler(req, res) {
  // Only allow POST requests (Vercel cron sends POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      message: 'Method not allowed. This endpoint is for Vercel cron only.',
      allowedMethods: ['POST'],
      timestamp: new Date().toISOString()
    });
  }

  const startTime = Date.now();
  console.log('🔄 Vercel cron job started:', new Date().toISOString());

  try {
    // Get the base URL for the ping endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://smarthoster-test-deploy.vercel.app';
    
    const pingUrl = `${baseUrl}/test/ping`;
    
    console.log('📡 Calling ping endpoint:', pingUrl);

    // Call the ping endpoint to keep MongoDB awake
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Cron-KeepAlive/1.0',
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ MongoDB keep-alive successful:', {
      status: data.status,
      timestamp: data.timestamp,
      responseTime: `${responseTime}ms`,
      mongoStatus: data.mongoStatus?.status
    });

    // Return success response
    res.status(200).json({ 
      success: true,
      message: 'MongoDB keep-alive completed successfully',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      pingResponse: {
        status: data.status,
        mongoStatus: data.mongoStatus,
        environment: data.environment
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('❌ MongoDB keep-alive failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    });

    // Return error response (but don't fail the cron job)
    res.status(500).json({ 
      success: false,
      message: 'MongoDB keep-alive failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    });
  }
}
