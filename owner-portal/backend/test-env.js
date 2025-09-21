require('dotenv').config();

console.log('=== Environment Variables Test ===\n');

// Check Hostaway variables
console.log('Hostaway Configuration:');
console.log('HOSTAWAY_TOKEN:', process.env.HOSTAWAY_TOKEN ? 'Present' : 'Missing');
console.log('HOSTAWAY_BASE_URL:', process.env.HOSTAWAY_BASE_URL || 'Not set');
console.log('HOSTAWAY_ACCOUNT_ID:', process.env.HOSTAWAY_ACCOUNT_ID || 'Not set');

console.log('\nHostkit Configuration:');
console.log('HOSTKIT_API_URL:', process.env.HOSTKIT_API_URL || 'Not set');
console.log('HOSTKIT_API_KEY:', process.env.HOSTKIT_API_KEY ? 'Present' : 'Missing');

console.log('\n=== Protocol Check ===');
if (process.env.HOSTKIT_API_URL) {
  if (process.env.HOSTKIT_API_URL.startsWith('https://')) {
    console.log('✅ HOSTKIT_API_URL uses HTTPS protocol');
  } else if (process.env.HOSTKIT_API_URL.startsWith('http://')) {
    console.log('❌ HOSTKIT_API_URL uses HTTP protocol (should be HTTPS)');
  } else {
    console.log('❌ HOSTKIT_API_URL protocol unclear:', process.env.HOSTKIT_API_URL);
  }
} else {
  console.log('❌ HOSTKIT_API_URL not set');
}

console.log('\n=== Test API Calls ===');
if (process.env.HOSTKIT_API_URL) {
  console.log('Would make API call to:', process.env.HOSTKIT_API_URL);
} else {
  console.log('Cannot test API calls - HOSTKIT_API_URL not set');
}


