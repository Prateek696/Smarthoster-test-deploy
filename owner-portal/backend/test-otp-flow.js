const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testOTPFlow() {
  try {
    console.log('🧪 Testing Complete OTP Flow...\n');

    const email = 'krprateek758@gmail.com';

    // Step 1: Send forgot password OTP
    console.log('1️⃣ Sending forgot password OTP...');
    const forgotResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: email
    });
    console.log('✅ Response:', forgotResponse.data.message);

    // Step 2: Wait a moment and then try to get the OTP from the email
    console.log('\n2️⃣ Please check your email and enter the OTP below:');
    console.log('   (The OTP should be in your email inbox)');
    
    // For testing, let's try with a common test OTP first
    const testOTPs = ['123456', '000000', '111111'];
    
    for (const testOTP of testOTPs) {
      console.log(`\n3️⃣ Testing with OTP: ${testOTP}`);
      try {
        const resetResponse = await axios.post(`${BASE_URL}/auth/reset-password`, {
          email: email,
          otp: testOTP,
          newPassword: 'newpassword123'
        });
        console.log('✅ Password reset successful:', resetResponse.data.message);
        break;
      } catch (error) {
        console.log('❌ Error:', error.response.data.message);
      }
    }

    console.log('\n📧 If none of the test OTPs worked, please:');
    console.log('   1. Check your email for the actual OTP');
    console.log('   2. Try the password reset with the real OTP from your email');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testOTPFlow();
