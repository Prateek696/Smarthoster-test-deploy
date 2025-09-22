"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportInvoices = exports.downloadInvoice = exports.debugInvoices = exports.getInvoices = void 0;
const invoice_service_1 = require("../services/invoice.service");
const hostkit_api_1 = require("../integrations/hostkit.api");
const axios_1 = __importDefault(require("axios"));
const archiver_1 = __importDefault(require("archiver"));
const propertyApiKey_1 = require("../utils/propertyApiKey");
const getInvoices = async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const { startDate, endDate } = req.query;
    try {
        const invoices = await (0, invoice_service_1.getInvoicesService)(listingId, startDate || '', endDate || '');
        res.json(invoices);
    }
    catch (error) {
        console.error("Invoice controller error:", error);
        res.status(500).json({
            message: "Error fetching invoices",
            error: error.message,
            details: error.stack
        });
    }
};
exports.getInvoices = getInvoices;
// Debug endpoint to test raw Hostkit API
const debugInvoices = async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const { startDate, endDate } = req.query;
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
        const urlTests = {};
        for (const testUrl of possibleUrls) {
            try {
                console.log(`[DEBUG] Testing URL: ${testUrl}`);
                const axios = require('axios');
                const response = await axios.get(`${testUrl}/health`, { timeout: 5000 });
                urlTests[testUrl] = { success: true, status: response.status };
            }
            catch (err) {
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
            rawApiResult = await (0, hostkit_api_1.getHostkitInvoices)(listingId, debugStartDate, debugEndDate);
        }
        catch (err) {
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
            serviceResult = await (0, invoice_service_1.getInvoicesService)(listingId, debugStartDate, debugEndDate);
        }
        catch (err) {
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
    }
    catch (error) {
        res.status(500).json({
            message: "Debug endpoint error",
            error: error.message
        });
    }
};
exports.debugInvoices = debugInvoices;
// Download invoice endpoint
const downloadInvoice = async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const invoiceId = req.params.invoiceId;
    try {
        console.log(`[DOWNLOAD] Attempting to download invoice ${invoiceId} for property ${listingId}`);
        // First, get the invoice to find its URL
        const invoices = await (0, invoice_service_1.getInvoicesService)(listingId, '', '');
        const invoice = invoices.find((inv) => inv.id === invoiceId);
        if (!invoice) {
            console.log(`[DOWNLOAD] Invoice ${invoiceId} not found`);
            return res.status(404).json({ message: "Invoice not found" });
        }
        console.log(`[DOWNLOAD] Found invoice: ${JSON.stringify(invoice)}`);
        if (!invoice.invoice_url || invoice.invoice_url === '#') {
            console.log(`[DOWNLOAD] No valid invoice URL: ${invoice.invoice_url}`);
            return res.status(404).json({ message: "Invoice URL not available" });
        }
        console.log(`[DOWNLOAD] Fetching PDF from: ${invoice.invoice_url}`);
        // Fetch the PDF from the external URL as buffer
        const response = await axios_1.default.get(invoice.invoice_url, {
            responseType: 'arraybuffer', // Use arraybuffer instead of stream
            timeout: 30000, // 30 second timeout
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
    }
    catch (error) {
        console.error("Download invoice error:", error.message);
        console.error("Error details:", error.response?.status, error.response?.statusText);
        res.status(500).json({
            message: "Error downloading invoice",
            error: error.message,
            details: error.response?.status ? `HTTP ${error.response.status}: ${error.response.statusText}` : undefined
        });
    }
};
exports.downloadInvoice = downloadInvoice;
// Export all invoices as ZIP (just PDFs, no CSV)
const exportInvoices = async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const { startDate, endDate } = req.query;
    try {
        console.log(`[EXPORT] Starting export for listing ${listingId}, dates: ${startDate} to ${endDate}`);
        // Get all invoices
        const invoices = await (0, invoice_service_1.getInvoicesService)(listingId, startDate || '', endDate || '');
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
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        // Handle archive errors
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            res.status(500).json({ message: 'Error creating ZIP file' });
        });
        // Pipe archive to response
        archive.pipe(res);
        // Get API key for this property
        const propertyApiKey = await (0, propertyApiKey_1.getHostkitApiKey)(listingId);
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
                const pdfResponse = await axios_1.default.get(downloadUrl, {
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
                }
                else {
                    console.log(`[EXPORT] Skipping empty PDF for invoice ${invoice.id}`);
                }
            }
            catch (pdfError) {
                console.error(`[EXPORT] Error downloading PDF for invoice ${invoice.id}:`, pdfError.message);
                console.error(`[EXPORT] Error details:`, pdfError.response?.status, pdfError.response?.statusText);
                // Continue with other invoices even if one fails
            }
        }
        // Finalize the archive
        await archive.finalize();
        console.log(`[EXPORT] Export completed successfully`);
    }
    catch (error) {
        console.error("Export invoices error:", error.message);
        res.status(500).json({
            message: "Error exporting invoices",
            error: error.message
        });
    }
};
exports.exportInvoices = exportInvoices;
