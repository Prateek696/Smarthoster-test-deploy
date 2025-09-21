const axios = require('axios');

// Hostkit API configuration
const HOSTKIT_API_BASE = 'https://app.hostkit.pt/api';

// API keys from your system
const API_KEYS = {
  '12602': 'J3aemDcfeKfgRGF5ZY3XaZhZxb4FQNwiNgu_AN9QtsI9_4CCL7', // Property 414661
  // Add more API keys as needed
};

async function fetchPropertyDetails(hostkitId, apiKey) {
  try {
    console.log(`🔍 Fetching property details for Hostkit ID: ${hostkitId}`);
    
    // Fetch property details
    const propertyResponse = await axios.get(`${HOSTKIT_API_BASE}/getProperty`, {
      params: {
        APIKEY: apiKey,
        property_id: hostkitId
      }
    });
    
    console.log(`✅ Property Details for Hostkit ID ${hostkitId}:`);
    console.log('=====================================');
    console.log('Property Name:', propertyResponse.data.name || 'N/A');
    console.log('Property ID:', propertyResponse.data.id || 'N/A');
    console.log('Address:', propertyResponse.data.address || 'N/A');
    console.log('Type:', propertyResponse.data.type || 'N/A');
    console.log('Status:', propertyResponse.data.status || 'N/A');
    console.log('Full Response:', JSON.stringify(propertyResponse.data, null, 2));
    console.log('=====================================\n');
    
    return propertyResponse.data;
  } catch (error) {
    console.error(`❌ Error fetching property ${hostkitId}:`, error.response?.data || error.message);
    return null;
  }
}

async function fetchInvoicesForProperty(hostkitId, apiKey) {
  try {
    console.log(`🔍 Fetching invoices for Hostkit ID: ${hostkitId}`);
    
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const startTimestamp = Math.floor(startOfMonth.getTime() / 1000);
    const endTimestamp = Math.floor(endOfMonth.getTime() / 1000);
    
    const invoiceResponse = await axios.get(`${HOSTKIT_API_BASE}/getInvoices`, {
      params: {
        APIKEY: apiKey,
        property_id: hostkitId,
        date_start: startTimestamp,
        date_end: endTimestamp,
        account_id: '123645'
      }
    });
    
    console.log(`✅ Invoices for Hostkit ID ${hostkitId}:`);
    console.log('=====================================');
    console.log('Total Invoices:', invoiceResponse.data.length);
    
    if (invoiceResponse.data.length > 0) {
      console.log('Sample Invoice:');
      const sampleInvoice = invoiceResponse.data[0];
      console.log('  Series:', sampleInvoice.series);
      console.log('  Guest Name:', sampleInvoice.name);
      console.log('  Amount:', sampleInvoice.value);
      console.log('  Date:', new Date(sampleInvoice.date * 1000).toLocaleDateString());
      
      // Get unique series
      const uniqueSeries = [...new Set(invoiceResponse.data.map(inv => inv.series))];
      console.log('  Unique Series:', uniqueSeries);
    }
    console.log('=====================================\n');
    
    return invoiceResponse.data;
  } catch (error) {
    console.error(`❌ Error fetching invoices for ${hostkitId}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Hostkit Property Investigation');
  console.log('================================\n');
  
  for (const [hostkitId, apiKey] of Object.entries(API_KEYS)) {
    console.log(`\n📋 Investigating Hostkit ID: ${hostkitId}`);
    console.log('==========================================');
    
    // Fetch property details
    const propertyDetails = await fetchPropertyDetails(hostkitId, apiKey);
    
    // Fetch invoices to see series
    const invoices = await fetchInvoicesForProperty(hostkitId, apiKey);
    
    // Analysis
    if (propertyDetails && invoices) {
      console.log('🔍 ANALYSIS:');
      console.log('============');
      console.log(`Property Name: "${propertyDetails.name}"`);
      console.log(`Is this "Water Pool Penthouse View"? ${propertyDetails.name?.toLowerCase().includes('water') ? '✅ YES' : '❌ NO'}`);
      console.log(`Invoice Series Found: ${invoices.length > 0 ? [...new Set(invoices.map(inv => inv.series))].join(', ') : 'None'}`);
      console.log(`Does it have LOTE144D2025 series? ${invoices.some(inv => inv.series === 'LOTE144D2025') ? '✅ YES' : '❌ NO'}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

main().catch(console.error);
