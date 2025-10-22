const axios = require('axios');

async function pingServices() {
  console.log(`🔄 Running keep-alive at ${new Date().toISOString()}`);
  
  try {
    // Ping MongoDB keep-alive endpoint
    console.log('📡 Pinging MongoDB keep-alive...');
    const mongoResponse = await axios.post('https://smarthoster-test-deploy.vercel.app/api/cron/keep-alive', {}, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    console.log(`✅ MongoDB Status: ${mongoResponse.status}`);
    
  } catch (error) {
    console.log(`❌ MongoDB Error: ${error.message}`);
  }
  
  try {
    // Ping Auth OTP endpoint (with invalid email to just wake it up)
    console.log('📡 Pinging Auth OTP service...');
    const authResponse = await axios.post('https://smarthoster-test-deploy.vercel.app/auth/send-login-otp', {
      email: 'keepalive@test.com'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    console.log(`✅ Auth OTP Status: ${authResponse.status}`);
    
  } catch (error) {
    console.log(`❌ Auth OTP Error: ${error.message}`);
  }
  
  console.log(`✅ Keep-alive completed at ${new Date().toISOString()}`);
}

// Run the keep-alive function
pingServices()
  .then(() => {
    console.log('🎉 Keep-alive job completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Keep-alive job failed:', error);
    process.exit(1);
  });
