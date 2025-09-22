"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectCreditNote = exports.issueCreditNote = exports.approveCreditNote = exports.getCreditNotes = exports.createCreditNoteRequest = void 0;
const invoice_service_1 = require("./invoice.service");
const hostkit_api_1 = require("../integrations/hostkit.api");
const hostaway_api_1 = require("../integrations/hostaway.api");
const createCreditNoteRequest = async (originalInvoiceId, propertyId, options) => {
    try {
        // Verify the original invoice exists and is closed
        const invoices = await (0, invoice_service_1.getInvoicesService)(propertyId, '2020-01-01', '2030-12-31');
        const originalInvoice = invoices.find(inv => inv.id === originalInvoiceId);
        if (!originalInvoice) {
            throw new Error('Original invoice not found');
        }
        if (!originalInvoice.closed) {
            throw new Error('Credit notes can only be issued against closed invoices');
        }
        // Get the invoice series (required for credit note creation)
        const invoiceSeries = originalInvoice.series || 'HEAVEN2025'; // Default fallback
        // Create credit note using Hostkit API
        console.log(`[CREDIT NOTES] Creating credit note for property ${propertyId} from invoice ${originalInvoiceId} (series: ${invoiceSeries})`);
        const creditNote = await (0, hostkit_api_1.createHostkitCreditNote)(propertyId, originalInvoiceId, invoiceSeries, options);
        console.log(`[CREDIT NOTES] Created credit note:`, creditNote);
        return creditNote;
    }
    catch (error) {
        console.error('Error creating credit note:', error);
        throw new Error(`Failed to create credit note: ${error.message}`);
    }
};
exports.createCreditNoteRequest = createCreditNoteRequest;
const getCreditNotes = async (propertyId, status, startDate, endDate) => {
    try {
        if (!propertyId) {
            return [];
        }
        console.log(`[CREDIT NOTES] Fetching credit notes for property ${propertyId}`);
        // Use provided date range or default to last 12 months
        let startDateStr;
        let endDateStr;
        if (startDate && endDate) {
            startDateStr = startDate;
            endDateStr = endDate;
            console.log(`[CREDIT NOTES] Using custom date range: ${startDateStr} to ${endDateStr}`);
        }
        else {
            // Default to last 12 months
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            startDateStr = startDate.toISOString().split('T')[0];
            endDateStr = endDate.toISOString().split('T')[0];
            console.log(`[CREDIT NOTES] Using default date range: ${startDateStr} to ${endDateStr}`);
        }
        // Fetch real credit notes from Hostkit API
        const creditNotes = await (0, hostkit_api_1.getHostkitCreditNotes)(propertyId, startDateStr, endDateStr);
        console.log(`[CREDIT NOTES] Fetched ${Array.isArray(creditNotes) ? creditNotes.length : 0} credit notes from Hostkit`);
        // Filter by status if provided
        if (status && status !== 'all' && Array.isArray(creditNotes)) {
            return creditNotes.filter(cn => cn.status === status);
        }
        return Array.isArray(creditNotes) ? creditNotes : [];
    }
    catch (error) {
        console.error('Error fetching credit notes:', error);
        // Return empty array if API fails
        return [];
    }
};
exports.getCreditNotes = getCreditNotes;
const approveCreditNote = async (creditNoteId, approvedBy) => {
    try {
        // Use Hostaway API to approve credit notes
        const result = await (0, hostaway_api_1.createHostawayCreditNote)(0, {
            creditNoteId,
            action: 'approve',
            approvedBy
        });
        return result;
    }
    catch (error) {
        console.error('Error approving credit note:', error);
        throw new Error(`Failed to approve credit note: ${error.message}`);
    }
};
exports.approveCreditNote = approveCreditNote;
const issueCreditNote = async (creditNoteId) => {
    try {
        // Use Hostaway API to issue credit notes
        const result = await (0, hostaway_api_1.createHostawayCreditNote)(0, {
            creditNoteId,
            action: 'issue'
        });
        return result;
    }
    catch (error) {
        console.error('Error issuing credit note:', error);
        throw new Error(`Failed to issue credit note: ${error.message}`);
    }
};
exports.issueCreditNote = issueCreditNote;
const rejectCreditNote = async (creditNoteId, reason) => {
    try {
        // Use Hostaway API to reject credit notes
        const result = await (0, hostaway_api_1.createHostawayCreditNote)(0, {
            creditNoteId,
            action: 'reject',
            reason
        });
        return result;
    }
    catch (error) {
        console.error('Error rejecting credit note:', error);
        throw new Error(`Failed to reject credit note: ${error.message}`);
    }
};
exports.rejectCreditNote = rejectCreditNote;
