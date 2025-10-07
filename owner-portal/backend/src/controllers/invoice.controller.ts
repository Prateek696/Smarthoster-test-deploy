import { Request, Response } from "express";
import { getInvoicesService } from "../services/invoice.service";
import { getHostkitInvoices } from "../integrations/hostkit.api";
import axios from "axios";
import archiver from "archiver";
import { getHostkitApiKey } from "../utils/propertyApiKey";

export const getInvoices = async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.listingId);
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  try {
    const invoices = await getInvoicesService(listingId, startDate || '', endDate || '');
    res.json(invoices);
  } catch (error: any) {
    console.error("Invoice controller error:", error);
    res.status(500).json({ 
      message: "Error fetching invoices",
      error: error.message,
      details: error.stack
    });
  }
};

// Debug endpoint to test raw Hostkit API
export const debugInvoices = async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.listingId);
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  const debugStartDate = startDate || '2024-01-01';
  const debugEndDate = endDate || '2024-12-31';

  try {
    console.log(`[DEBUG] Testing invoice API for listing ${listingId}`);
    
    // Test environment variables (use property-specific API key lookup)
    const { getHostkitApiKey } = require('../utils/propertyApiKey');
    const propertyApiKey = await getHostkitApiKey(listingId);
    
    const envCheck = {
      HOSTKIT_API_URL: process.env.HOSTKIT_API_URL || 'NOT SET',
      HOSTKIT_API_KEY: propertyApiKey ? 'SET' : 'NOT SET',
      HOSTKIT_API_KEY_SPECIFIC: `HOSTKIT_API_KEY_${await require('../utils/propertyApiKey').getHostkitId(listingId)}`,
      HOSTAWAY_ACCOUNT_ID: process.env.HOSTAWAY_ACCOUNT_ID ? 'SET' : 'NOT SET'
    };

    console.log(`[DEBUG] Environment check:`, envCheck);

    // Test different possible Hostkit URLs
    const possibleUrls = [
      'https://app.hostkit.pt/api',
      'https://api.hostkit.pt',
      'https://hostkit.pt/api',
      'https://www.hostkit.pt/api',
      'https://api.hostkit.com',
      'https://hostkit.com/api'
    ];

    const urlTests: any = {};
    
    for (const testUrl of possibleUrls) {
      try {
        console.log(`[DEBUG] Testing URL: ${testUrl}`);
        const axios = require('axios');
        const response = await axios.get(`${testUrl}/health`, { timeout: 5000 });
        urlTests[testUrl] = { success: true, status: response.status };
      } catch (err: any) {
        urlTests[testUrl] = { 
          success: false, 
          error: err.code || err.message,
          status: err.response?.status 
        };
      }
    }

    // Test raw API call
    let rawApiResult;
    let apiError = null;
    
    try {
      rawApiResult = await getHostkitInvoices(listingId, debugStartDate, debugEndDate);
    } catch (err: any) {
      apiError = {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data
      };
    }

    // Test service call
    let serviceResult;
    let serviceError = null;
    
    try {
      serviceResult = await getInvoicesService(listingId, debugStartDate, debugEndDate);
    } catch (err: any) {
      serviceError = err.message;
    }

    res.json({
      listingId,
      dateRange: { startDate: debugStartDate, endDate: debugEndDate },
      environment: envCheck,
      urlTests,
      rawApiResult,
      apiError,
      serviceResult,
      serviceError,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({ 
      message: "Debug endpoint error",
      error: error.message
    });
  }
};

// Download invoice endpoint - Optimized version
export const downloadInvoice = async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.listingId);
  const invoiceId = req.params.invoiceId;
  const { invoiceUrl } = req.query; // Accept invoice URL as query parameter

  try {
    console.log(`[DOWNLOAD] Attempting to download invoice ${invoiceId} for property ${listingId}`);
    
    let pdfUrl: string;
    
    // If invoice URL is provided in query params, use it directly (faster)
    if (invoiceUrl && typeof invoiceUrl === 'string' && invoiceUrl !== '#') {
      console.log(`[DOWNLOAD] Using provided invoice URL: ${invoiceUrl}`);
      pdfUrl = invoiceUrl;
    } else {
      // Fallback: search for invoice in last 3 months (slower)
      console.log(`[DOWNLOAD] No URL provided, searching for invoice...`);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 3);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const invoices = await getInvoicesService(listingId, startDateStr, endDateStr);
      const invoice = invoices.find((inv: any) => inv.id === invoiceId);
      
      if (!invoice) {
        console.log(`[DOWNLOAD] Invoice ${invoiceId} not found in date range ${startDateStr} to ${endDateStr}`);
        return res.status(404).json({ message: "Invoice not found" });
      }

      if (!invoice.invoice_url || invoice.invoice_url === '#') {
        console.log(`[DOWNLOAD] No valid invoice URL: ${invoice.invoice_url}`);
        return res.status(404).json({ message: "Invoice URL not available" });
      }
      
      pdfUrl = invoice.invoice_url;
    }

    console.log(`[DOWNLOAD] Fetching PDF from URL: ${pdfUrl}`);

    // Fetch the PDF from the external URL as buffer
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 8000,
      headers: {
        'Accept': 'application/pdf,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`[DOWNLOAD] PDF response status: ${response.status}, size: ${response.data.byteLength} bytes`);

    if (response.data.byteLength === 0) {
      console.log(`[DOWNLOAD] PDF response is empty`);
      return res.status(404).json({ message: "PDF file is empty" });
    }

    // Set headers to force download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
    res.setHeader('Content-Length', response.data.byteLength.toString());
    res.setHeader('Cache-Control', 'no-cache');

    // Send the PDF buffer
    res.send(Buffer.from(response.data));

  } catch (error: any) {
    console.error("Download invoice error:", error.message);
    console.error("Error details:", error.response?.status, error.response?.statusText);
    res.status(500).json({ 
      message: "Error downloading invoice",
      error: error.message,
      details: error.response?.status ? `HTTP ${error.response.status}: ${error.response.statusText}` : undefined
    });
  }
};

// Export all invoices as ZIP (just PDFs, no CSV)
export const exportInvoices = async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.listingId);
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  try {
    console.log(`[EXPORT] Starting export for listing ${listingId}, dates: ${startDate} to ${endDate}`);
    
    // Get all invoices
    const invoices = await getInvoicesService(listingId, startDate || '', endDate || '');
    
    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found to export" });
    }

    console.log(`[EXPORT] Found ${invoices.length} invoices to export`);

    // Set headers for ZIP download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `invoices_export_${timestamp}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({ message: 'Error creating ZIP file' });
    });

    // Pipe archive to response
    archive.pipe(res);

    // Get API key for this property
    const propertyApiKey = await getHostkitApiKey(listingId);
    if (!propertyApiKey) {
      return res.status(500).json({ message: `No API key found for property ${listingId}` });
    }

    // Add each invoice PDF to the archive using the existing download endpoint
    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      
      // Skip if no PDF URL
      if (!invoice.invoice_url || invoice.invoice_url === '#') {
        console.log(`[EXPORT] Skipping invoice ${invoice.id} - no PDF URL`);
        continue;
      }
      
      try {
        console.log(`[EXPORT] Downloading PDF for invoice ${invoice.id} (${i + 1}/${invoices.length})`);
        
        // Use the existing download endpoint instead of direct URL access
        const downloadUrl = `http://localhost:5000/api/invoices/${listingId}/${invoice.id}/download`;
        const pdfResponse = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'application/pdf,*/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (pdfResponse.data.byteLength > 0) {
          // Add PDF to archive with simple filename
          const pdfFilename = `invoice_${invoice.id}.pdf`;
          archive.append(Buffer.from(pdfResponse.data), { name: pdfFilename });
          console.log(`[EXPORT] Added ${pdfFilename} to archive`);
        } else {
          console.log(`[EXPORT] Skipping empty PDF for invoice ${invoice.id}`);
        }
      } catch (pdfError: any) {
        console.error(`[EXPORT] Error downloading PDF for invoice ${invoice.id}:`, pdfError.message);
        console.error(`[EXPORT] Error details:`, pdfError.response?.status, pdfError.response?.statusText);
        // Continue with other invoices even if one fails
      }
    }

    // Finalize the archive
    await archive.finalize();
    
    console.log(`[EXPORT] Export completed successfully`);

  } catch (error: any) {
    console.error("Export invoices error:", error.message);
    res.status(500).json({ 
      message: "Error exporting invoices",
      error: error.message
    });
  }
};

