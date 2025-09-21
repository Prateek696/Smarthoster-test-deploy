const { getInvoicesService } = require('./dist/services/invoice.service');

async function testInvoices() {
  try {
    console.log('Testing invoice service for property 392776...');
    const invoices = await getInvoicesService(392776, '2025-07-01', '2025-07-31');
    console.log('Invoices found:', invoices.length);
    console.log('Invoice data:', JSON.stringify(invoices, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testInvoices();




