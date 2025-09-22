import { Request, Response } from 'express';
import {
  createCreditNoteRequest,
  getCreditNotes,
  approveCreditNote,
  issueCreditNote,
  rejectCreditNote
} from '../services/creditNote.service';

export const createCreditNote = async (req: Request, res: Response) => {
  try {
    const { originalInvoiceId, propertyId, invoicingNif } = req.body;

    if (!originalInvoiceId || !propertyId) {
      return res.status(400).json({ message: 'Missing required fields: originalInvoiceId and propertyId' });
    }

    const options = {
      invoicingNif
    };

    const creditNote = await createCreditNoteRequest(
      originalInvoiceId,
      propertyId,
      options
    );

    res.status(201).json(creditNote);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCreditNotesList = async (req: Request, res: Response) => {
  try {
    const { propertyId, status, startDate, endDate } = req.query;
    
    const creditNotes = await getCreditNotes(
      propertyId ? Number(propertyId) : undefined,
      status as string,
      startDate as string,
      endDate as string
    );

    // Transform Hostkit credit notes to match frontend interface
    const transformedCreditNotes = creditNotes.map((cn: any) => ({
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveCreditNoteRequest = async (req: Request, res: Response) => {
  try {
    const { creditNoteId } = req.params;
    const approvedBy = req.user?.id;

    const creditNote = await approveCreditNote(creditNoteId, approvedBy);
    res.json(creditNote);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const issueCreditNoteRequest = async (req: Request, res: Response) => {
  try {
    const { creditNoteId } = req.params;

    const creditNote = await issueCreditNote(creditNoteId);
    res.json(creditNote);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectCreditNoteRequest = async (req: Request, res: Response) => {
  try {
    const { creditNoteId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const creditNote = await rejectCreditNote(creditNoteId, reason);
    res.json(creditNote);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};




