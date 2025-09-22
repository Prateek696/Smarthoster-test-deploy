"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectCreditNoteRequest = exports.issueCreditNoteRequest = exports.approveCreditNoteRequest = exports.getCreditNotesList = exports.createCreditNote = void 0;
const creditNote_service_1 = require("../services/creditNote.service");
const createCreditNote = async (req, res) => {
    try {
        const { originalInvoiceId, propertyId, invoicingNif } = req.body;
        if (!originalInvoiceId || !propertyId) {
            return res.status(400).json({ message: 'Missing required fields: originalInvoiceId and propertyId' });
        }
        const options = {
            invoicingNif
        };
        const creditNote = await (0, creditNote_service_1.createCreditNoteRequest)(originalInvoiceId, propertyId, options);
        res.status(201).json(creditNote);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createCreditNote = createCreditNote;
const getCreditNotesList = async (req, res) => {
    try {
        const { propertyId, status, startDate, endDate } = req.query;
        const creditNotes = await (0, creditNote_service_1.getCreditNotes)(propertyId ? Number(propertyId) : undefined, status, startDate, endDate);
        // Transform Hostkit credit notes to match frontend interface
        const transformedCreditNotes = creditNotes.map((cn) => ({
            id: cn.id,
            propertyId: propertyId ? Number(propertyId) : 0,
            propertyName: 'Piece of Heaven', // You might want to fetch this from properties
            bookingId: cn.refid || cn.id,
            guestName: cn.name || 'Unknown Guest',
            amount: parseFloat(cn.value) || 0,
            reason: cn.reason || 'Credit note',
            status: 'approved', // Hostkit credit notes are already processed
            requestedBy: 'System',
            requestedDate: new Date(parseInt(cn.date) * 1000).toISOString(),
            invoiceId: cn.refid,
            creditNoteUrl: cn.credit_note_url
        }));
        res.json({ creditNotes: transformedCreditNotes });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCreditNotesList = getCreditNotesList;
const approveCreditNoteRequest = async (req, res) => {
    try {
        const { creditNoteId } = req.params;
        const approvedBy = req.user?.id;
        const creditNote = await (0, creditNote_service_1.approveCreditNote)(creditNoteId, approvedBy);
        res.json(creditNote);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.approveCreditNoteRequest = approveCreditNoteRequest;
const issueCreditNoteRequest = async (req, res) => {
    try {
        const { creditNoteId } = req.params;
        const creditNote = await (0, creditNote_service_1.issueCreditNote)(creditNoteId);
        res.json(creditNote);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.issueCreditNoteRequest = issueCreditNoteRequest;
const rejectCreditNoteRequest = async (req, res) => {
    try {
        const { creditNoteId } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }
        const creditNote = await (0, creditNote_service_1.rejectCreditNote)(creditNoteId, reason);
        res.json(creditNote);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.rejectCreditNoteRequest = rejectCreditNoteRequest;
