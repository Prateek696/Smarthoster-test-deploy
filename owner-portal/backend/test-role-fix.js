const axios = require('axios');
require('dotenv').config();

async function testRoleFix() {
  try {
    console.log('Testing role case fix...');
    
    // Test login with lowercase role from backend
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'krprateek758@gmail.com',
      password: 'password123'
    });
    
    console.log('Login response:', {
      success: !!loginResponse.data.accessToken,
      userRole: loginResponse.data.user?.role,
      token: loginResponse.data.accessToken ? 'Present' : 'Missing'
    });
    
    if (loginResponse.data.accessToken) {
      const token = loginResponse.data.accessToken;
      
      // Test accessing invoices endpoint (should work now)
      const invoicesResponse = await axios.get('http://localhost:5000/api/invoices/392777', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Invoices response:', {
        status: invoicesResponse.status,
        success: invoicesResponse.status === 200,
        dataLength: Array.isArray(invoicesResponse.data) ? invoicesResponse.data.length : 'not-array'
      });
      
      // Test accessing credit notes endpoint
      const creditNotesResponse = await axios.get('http://localhost:5000/api/credit-notes/properties/392777/credit-notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Credit notes response:', {
        status: creditNotesResponse.status,
        success: creditNotesResponse.status === 200,
        dataLength: Array.isArray(creditNotesResponse.data) ? creditNotesResponse.data.length : 'not-array'
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testRoleFix();




