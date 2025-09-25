import cron from 'node-cron';
import { pingMongoDB, ensureTempCollection } from '../utils/keepAlive';

/**
 * MongoDB Keep-Alive Cron Job
 * Runs every 15 minutes to prevent MongoDB Atlas free tier from sleeping
 * 
 * Note: This only works in environments that support persistent processes
 * For Vercel serverless, use the /api/ping endpoint with external monitoring
 */

// Schedule keep-alive every 15 minutes
const KEEP_ALIVE_SCHEDULE = '*/15 * * * *'; // Every 15 minutes

// Initialize keep-alive cron job
const initializeKeepAlive = () => {
  console.log('🔄 Initializing MongoDB keep-alive cron job...');
  
  // Schedule the keep-alive job
  cron.schedule(KEEP_ALIVE_SCHEDULE, async () => {
    console.log('⏰ Running MongoDB keep-alive cron job...');
    
    try {
      // Ensure temp collection exists
      await ensureTempCollection();
      
      // Execute keep-alive ping
      const success = await pingMongoDB();
      
      if (success) {
        console.log('✅ MongoDB keep-alive cron job completed successfully');
      } else {
        console.log('⚠️ MongoDB keep-alive cron job completed with warnings');
      }
    } catch (error: any) {
      console.error('❌ MongoDB keep-alive cron job failed:', error.message);
    }
  }, {
    timezone: "UTC"
  });
  
  console.log(`✅ MongoDB keep-alive cron job scheduled: ${KEEP_ALIVE_SCHEDULE}`);
  console.log('📝 Note: For Vercel deployment, use /api/ping endpoint with external monitoring');
};

// Export for use in server startup
export { initializeKeepAlive };

// Auto-initialize if this file is imported
if (process.env.NODE_ENV !== 'test') {
  initializeKeepAlive();
}
