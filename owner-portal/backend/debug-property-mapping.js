require('dotenv').config();

console.log('=== Property Mapping Debug ===\n');

// Test the property mapping logic
const PROPERTY_TO_HOSTKIT_MAPPING = {
  392776: "10027", // Piece of Heaven
  392777: "10030", // Lote 16 Pt 1 3-B
  392778: "10029", // Lote 8 4-B
  392779: "10028", // Lote 12 4-A
  392780: "10032", // Lote 16 Pt1 4-B
  392781: "10031", // Lote 7 3-A
  414661: "12602"  // Waterfront Pool Penthouse View
};

// Test property 392776 (the one you're using)
const testPropertyId = 392776;
const hostkitId = PROPERTY_TO_HOSTKIT_MAPPING[testPropertyId];

console.log(`Testing Property ID: ${testPropertyId}`);
console.log(`Maps to Hostkit ID: ${hostkitId}`);

// Check if the API key exists
const apiKey = process.env[`HOSTKIT_API_KEY_${hostkitId}`];
console.log(`API Key for ${hostkitId}: ${apiKey ? 'Present' : 'Missing'}`);

// Check the base URL
const baseUrl = process.env.HOSTKIT_API_URL;
console.log(`Base URL: ${baseUrl || 'Not set'}`);

if (baseUrl) {
  if (baseUrl.startsWith('https://')) {
    console.log('✅ Base URL uses HTTPS protocol');
  } else if (baseUrl.startsWith('http://')) {
    console.log('❌ Base URL uses HTTP protocol (should be HTTPS)');
  } else {
    console.log('❌ Base URL protocol unclear');
  }
}

// Test the actual API call that would be made
if (baseUrl && apiKey) {
  console.log('\n=== API Call Test ===');
  console.log(`Would call: ${baseUrl}/updateCalendar`);
  console.log(`With params:`);
  console.log(`  APIKEY: ${apiKey ? 'Present' : 'Missing'}`);
  console.log(`  listing_id: ${hostkitId}`);
  console.log(`  date_start: [timestamp]`);
  console.log(`  date_end: [timestamp]`);
  console.log(`  status: blocked`);
} else {
  console.log('\n❌ Cannot test API call - missing base URL or API key');
}

// Check all environment variables
console.log('\n=== All Hostkit Environment Variables ===');
Object.keys(process.env).forEach(key => {
  if (key.startsWith('HOSTKIT_')) {
    const value = key.includes('KEY') ? 'Present' : process.env[key];
    console.log(`${key}: ${value}`);
  }
});


