import { getHostkitInvoices } from "../integrations/hostkit.api";


interface Invoice {
  id: string;
  name: string;
  value: string;
  date: string;
  closed: boolean;
  partial: boolean;
  invoice_url: string;
  series: string;
}

// Property ID to Series mapping (based on Hostkit API response analysis)
const PROPERTY_TO_SERIES_MAPPING: { [key: number]: string[] } = {
  392776: ['HEAVEN2025'], // Piece of Heaven
  392777: ['LOTE1632025'], // Lote 16 Pt 1 3-B
  392778: ['LOTE82025'], // Lote 8 4-B
  392779: ['LOTE122025'], // Lote 12 4-A
  392780: ['LOTE1642025'], // Lote 16 Pt1 4-B
  392781: ['LOTE72025'], // Lote 7 3-A
  414661: ['LOTE144D2025'] // Waterfront Pool Penthouse View
};

export const getInvoicesService = async (
  listingId: number,
  startDate: string,
  endDate: string
) => {
  try {
    const invoices = await getHostkitInvoices(listingId, startDate, endDate);
    
    // console.log(`[INVOICE DEBUG] Raw Hostkit response for property ${listingId}:`, JSON.stringify(invoices, null, 2));
    
    if (!invoices || !Array.isArray(invoices)) {
      return [];
    }

    if (invoices.length === 0) {
      return [];
    }

    // Filter invoices by series (since Hostkit API doesn't filter by property_id)
    const expectedSeries = PROPERTY_TO_SERIES_MAPPING[listingId] || [];
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceSeries = invoice.series;
      const matchesSeries = expectedSeries.includes(invoiceSeries);
      
      if (!matchesSeries) {
        console.log(`[INVOICE SERIES FILTER] Filtering out invoice ${invoice.id} - series '${invoiceSeries}' not in expected series for property ${listingId}: [${expectedSeries.join(', ')}]`);
      }
      
      return matchesSeries;
    });
    
    console.log(`[INVOICE SERIES FILTER] Filtered ${invoices.length} invoices down to ${filteredInvoices.length} for property ${listingId} (series: ${expectedSeries.join(', ')})`);
    
    if (filteredInvoices.length === 0) {
      return [];
    }

    // Map invoices with better error handling
    const mappedInvoices = filteredInvoices.map((inv: any, index: number) => {
      try {
        console.log(`[INVOICE DEBUG] Processing invoice ${index} for property ${listingId}:`, {
          id: inv.id,
          name: inv.name,
          property_id: inv.property_id,
          value: inv.value,
          requestedPropertyId: listingId
        });
        
        const invoiceValue = parseFloat(inv.value || inv.amount || inv.total || "0.00");
        
        // Improved status logic for vacation rental invoices
        const invoiceDate = inv.date ? new Date(Number(inv.date) * 1000) : new Date();
        const daysSinceInvoice = Math.floor((Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        const currentDate = new Date();
        
        // Check multiple possible status fields from Hostkit
        let isClosedOrPaid = false;
        let isPartial = false;
        
        // Primary status checks
        if (inv.closed === 1 || inv.closed === true || inv.status === 'closed' || inv.status === 'paid' || inv.paid === true) {
          isClosedOrPaid = true;
        } else if (inv.partial === 1 || inv.partial === true || inv.status === 'partial') {
          isPartial = true;
        } else {
          // Smart logic for vacation rentals:
          // If invoice date is in the past (checkout already happened), likely paid
          if (invoiceDate < currentDate) {
            isClosedOrPaid = true;
          }
          // If it's a future date or very recent (within 7 days), keep as pending
          else if (daysSinceInvoice >= -7) {
            isClosedOrPaid = false; // Keep as pending for recent/future bookings
          }
        }
        
        // console.log(`[INVOICE DEBUG] Invoice ${index} status logic:`, {
        //   originalClosed: inv.closed,
        //   originalStatus: inv.status,
        //   daysSinceInvoice,
        //   isClosedOrPaid,
        //   isPartial
        // });
        
        return {
          id: inv.id || inv.invoice_id || `inv_${index}`,
          propertyId: listingId, // Include the property ID
          name: inv.name || inv.invoice_name || inv.description || `Invoice ${index + 1}`,
          value: inv.value || inv.amount || inv.total || "0.00",
          date: invoiceDate.toISOString(),
          closed: isClosedOrPaid,
          partial: isPartial,
          invoice_url: inv.invoice_url || inv.url || inv.download_url || '#',
          series: inv.series || ''
        };
      } catch (mapError) {
        console.error(`[INVOICE DEBUG] Error mapping invoice ${index}:`, mapError);
        return {
          id: `error_${index}`,
          name: `Error mapping invoice ${index}`,
          value: "0.00",
          date: new Date().toISOString(),
          closed: false,
          partial: false,
          invoice_url: '#',
          series: ''
        };
      }
    });


    return mappedInvoices;

  } catch (error: any) {
    console.error(`[INVOICE DEBUG] Service error:`, error);
    console.error(`[INVOICE DEBUG] Error details:`, error.message);
    console.error(`[INVOICE DEBUG] Error stack:`, error.stack);
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }
};
