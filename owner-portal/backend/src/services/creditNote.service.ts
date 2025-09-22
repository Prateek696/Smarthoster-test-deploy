import { getInvoicesService } from './invoice.service';
import { getHostkitCreditNotes, createHostkitCreditNote } from '../integrations/hostkit.api';
import { getHostawayCreditNotes, createHostawayCreditNote } from '../integrations/hostaway.api';

export const createCreditNoteRequest = async (
  originalInvoiceId: string,
  propertyId: number,
  options?: {
    invoicingNif?: string;
  }
) => {
  try {
    // Verify the original invoice exists and is closed
    const invoices = await getInvoicesService(propertyId, '2020-01-01', '2030-12-31');
    const originalInvoice = invoices.find(inv => inv.id === originalInvoiceId);
    
    if (!originalInvoice) {
      throw new Error('Original invoice not found');
    }
    
    if (!originalInvoice.closed) {
      throw new Error('Credit notes can only be issued against closed invoices');
    }
    
    // Get the invoice series (required for credit note creation)
    const invoiceSeries = (originalInvoice as any).series || 'HEAVEN2025'; // Default fallback
    
    // Create credit note using Hostkit API
    console.log(`[CREDIT NOTES] Creating credit note for property ${propertyId} from invoice ${originalInvoiceId} (series: ${invoiceSeries})`);
    
    const creditNote = await createHostkitCreditNote(propertyId, originalInvoiceId, invoiceSeries, options);
    
    console.log(`[CREDIT NOTES] Created credit note:`, creditNote);
    return creditNote;
  } catch (error: any) {
    console.error('Error creating credit note:', error);
    throw new Error(`Failed to create credit note: ${error.message}`);
  }
};

export const getCreditNotes = async (propertyId?: number, status?: string, startDate?: string, endDate?: string) => {
  try {
    if (!propertyId) {
      return [];
    }
    
    console.log(`[CREDIT NOTES] Fetching credit notes for property ${propertyId}`);
    
    // Use provided date range or default to last 12 months
    let startDateStr: string;
    let endDateStr: string;
    
    if (startDate && endDate) {
      startDateStr = startDate;
      endDateStr = endDate;
      console.log(`[CREDIT NOTES] Using custom date range: ${startDateStr} to ${endDateStr}`);
    } else {
      // Default to last 12 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      
      startDateStr = startDate.toISOString().split('T')[0];
      endDateStr = endDate.toISOString().split('T')[0];
      console.log(`[CREDIT NOTES] Using default date range: ${startDateStr} to ${endDateStr}`);
    }
    
    // Fetch real credit notes from Hostkit API
    const creditNotes = await getHostkitCreditNotes(propertyId, startDateStr, endDateStr);
    
    console.log(`[CREDIT NOTES] Fetched ${Array.isArray(creditNotes) ? creditNotes.length : 0} credit notes from Hostkit`);
    
    // Filter by status if provided
    if (status && status !== 'all' && Array.isArray(creditNotes)) {
      return creditNotes.filter(cn => cn.status === status);
    }
    
    return Array.isArray(creditNotes) ? creditNotes : [];
  } catch (error: any) {
    console.error('Error fetching credit notes:', error);
    // Return empty array if API fails
    return [];
  }
};

export const approveCreditNote = async (creditNoteId: string, approvedBy: string) => {
  try {
    // Use Hostaway API to approve credit notes
    const result = await createHostawayCreditNote(0, {
      creditNoteId,
      action: 'approve',
      approvedBy
    });
    
    return result;
  } catch (error: any) {
    console.error('Error approving credit note:', error);
    throw new Error(`Failed to approve credit note: ${error.message}`);
  }
};

export const issueCreditNote = async (creditNoteId: string) => {
  try {
    // Use Hostaway API to issue credit notes
    const result = await createHostawayCreditNote(0, {
      creditNoteId,
      action: 'issue'
    });
    
    return result;
  } catch (error: any) {
    console.error('Error issuing credit note:', error);
    throw new Error(`Failed to issue credit note: ${error.message}`);
  }
};

export const rejectCreditNote = async (creditNoteId: string, reason: string) => {
  try {
    // Use Hostaway API to reject credit notes
    const result = await createHostawayCreditNote(0, {
      creditNoteId,
      action: 'reject',
      reason
    });
    
    return result;
  } catch (error: any) {
    console.error('Error rejecting credit note:', error);
    throw new Error(`Failed to reject credit note: ${error.message}`);
  }
};


