const axios = require('axios');
require('dotenv').config();

async function testCreditNotesDebug() {
  try {
    console.log('🔍 Debugging Credit Notes vs Invoices...');
    
    const baseUrl = process.env.HOSTKIT_API_URL;
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    const propertyId = '10027';
    const apiKey = process.env.HOSTKIT_API_KEY_10027;
    
    // Test invoices first (we know this works)
    console.log('\n--- Testing Invoices (should work) ---');
    try {
      const invoiceParams = {
        APIKEY: apiKey,
        property_id: propertyId,
        account_id: accountId,
        date_start: Math.floor(new Date('2025-08-01').getTime() / 1000),
        date_end: Math.floor(new Date('2025-09-04').getTime() / 1000)
      };
      
      const invoiceResponse = await axios.get(`${baseUrl}/getInvoices`, {
        params: invoiceParams,
        timeout: 10000
      });
      
      console.log('✅ Invoices response:', {
        status: invoiceResponse.status,
        dataType: Array.isArray(invoiceResponse.data) ? 'array' : typeof invoiceResponse.data,
        dataLength: Array.isArray(invoiceResponse.data) ? invoiceResponse.data.length : 'not-array',
        hasData: Array.isArray(invoiceResponse.data) ? invoiceResponse.data.length > 0 : !!invoiceResponse.data
      });
      
      if (Array.isArray(invoiceResponse.data) && invoiceResponse.data.length > 0) {
        console.log('📄 Sample invoice:', JSON.stringify(invoiceResponse.data[0], null, 2));
      }
      
    } catch (error) {
      console.log('❌ Invoices error:', error.message);
    }
    
    // Test credit notes with same parameters
    console.log('\n--- Testing Credit Notes (same params as invoices) ---');
    try {
      const creditNoteParams = {
        APIKEY: apiKey,
        property_id: propertyId,
        account_id: accountId,
        date_start: Math.floor(new Date('2025-08-01').getTime() / 1000),
        date_end: Math.floor(new Date('2025-09-04').getTime() / 1000)
      };
      
      const creditNoteResponse = await axios.get(`${baseUrl}/getCreditNotes`, {
        params: creditNoteParams,
        timeout: 10000
      });
      
      console.log('✅ Credit Notes response:', {
        status: creditNoteResponse.status,
        dataType: Array.isArray(creditNoteResponse.data) ? 'array' : typeof creditNoteResponse.data,
        dataLength: Array.isArray(creditNoteResponse.data) ? creditNoteResponse.data.length : 'not-array',
        hasData: Array.isArray(creditNoteResponse.data) ? creditNoteResponse.data.length > 0 : !!response.data
      });
      
      if (Array.isArray(creditNoteResponse.data) && creditNoteResponse.data.length > 0) {
        console.log('📄 Sample credit note:', JSON.stringify(creditNoteResponse.data[0], null, 2));
      } else {
        console.log('📄 No credit notes found - this suggests Hostkit may not support credit notes or they need to be created manually');
      }
      
    } catch (error) {
      console.log('❌ Credit Notes error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
    
    // Test if credit notes endpoint exists at all
    console.log('\n--- Testing if getCreditNotes endpoint exists ---');
    try {
      const testResponse = await axios.get(`${baseUrl}/getCreditNotes`, {
        params: { APIKEY: apiKey },
        timeout: 5000
      });
      
      console.log('✅ getCreditNotes endpoint exists:', {
        status: testResponse.status,
        dataType: typeof testResponse.data,
        data: testResponse.data
      });
      
    } catch (error) {
      console.log('❌ getCreditNotes endpoint error:', {
        status: error.response?.status || 'No response',
        message: error.message,
        data: error.response?.data
      });
    }
    
    // Test alternative credit note endpoints
    console.log('\n--- Testing alternative credit note endpoints ---');
    const alternativeEndpoints = [
      '/getCreditNote',
      '/creditNotes',
      '/credit-notes',
      '/getCreditNoteList',
      '/listCreditNotes'
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        const response = await axios.get(`${baseUrl}${endpoint}`, {
          params: { APIKEY: apiKey },
          timeout: 3000
        });
        
        console.log(`✅ ${endpoint}:`, {
          status: response.status,
          dataType: typeof response.data,
          hasData: !!response.data
        });
        
      } catch (error) {
        console.log(`❌ ${endpoint}:`, error.response?.status || 'No response');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCreditNotesDebug();



