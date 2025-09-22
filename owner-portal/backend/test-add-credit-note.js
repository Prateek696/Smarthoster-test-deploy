const axios = require('axios');
require('dotenv').config();

async function testAddCreditNote() {
  try {
    console.log('Testing Hostkit addCreditNote API...');
    
    const apiKey = process.env.HOSTKIT_API_KEY_10027;
    const baseUrl = process.env.HOSTKIT_API_URL;
    
    // First, let's get some invoices to create a credit note from
    console.log('\n--- Getting invoices first ---');
    const invoicesResponse = await axios.get(`${baseUrl}/getInvoices`, {
      params: { 
        APIKEY: apiKey,
        property_id: '10027',
        account_id: process.env.HOSTAWAY_ACCOUNT_ID,
        date_start: Math.floor(new Date('2024-01-01').getTime() / 1000),
        date_end: Math.floor(new Date('2024-12-31').getTime() / 1000)
      },
      timeout: 10000
    });
    
    console.log('Invoices found:', invoicesResponse.data.length);
    if (invoicesResponse.data.length > 0) {
      console.log('First invoice:', JSON.stringify(invoicesResponse.data[0], null, 2));
      
      // Try to create a credit note from the first invoice
      const firstInvoice = invoicesResponse.data[0];
      console.log('\n--- Creating credit note ---');
      
      const creditNoteData = {
        APIKEY: apiKey,
        property_id: '10027',
        account_id: process.env.HOSTAWAY_ACCOUNT_ID,
        refseries: firstInvoice.series || '2024',
        refid: firstInvoice.id,
        value: '10.00', // Small amount for testing
        reason: 'Test credit note from API',
        nif: firstInvoice.nif || '123456789',
        name: firstInvoice.name || 'Test Guest'
      };
      
      console.log('Credit note data:', JSON.stringify(creditNoteData, null, 2));
      
      const addResponse = await axios.post(`${baseUrl}/addCreditNote`, creditNoteData, {
        timeout: 10000
      });
      
      console.log('Add credit note response:', JSON.stringify(addResponse.data, null, 2));
      
      // Now check if the credit note was created
      console.log('\n--- Checking credit notes after creation ---');
      const creditNotesResponse = await axios.get(`${baseUrl}/getCreditNotes`, {
        params: { 
          APIKEY: apiKey,
          property_id: '10027',
          account_id: process.env.HOSTAWAY_ACCOUNT_ID
        },
        timeout: 10000
      });
      
      console.log('Credit notes after creation:', JSON.stringify(creditNotesResponse.data, null, 2));
      
    } else {
      console.log('No invoices found to create credit note from');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAddCreditNote();




