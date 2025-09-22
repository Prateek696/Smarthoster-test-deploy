const axios = require('axios');

async function testDashboard() {
  try {
    console.log('Testing dashboard metrics endpoint...');
    
    // Test the dashboard metrics endpoint
    const response = await axios.get('http://localhost:5000/api/property-management/dashboard/metrics', {
      headers: {
        'Authorization': 'Bearer test-token' // You'll need to replace this with a real token
      }
    });
    
    console.log('Dashboard metrics response:', response.data);
  } catch (error) {
    console.error('Error testing dashboard:', error.response?.data || error.message);
  }
}

testDashboard();

