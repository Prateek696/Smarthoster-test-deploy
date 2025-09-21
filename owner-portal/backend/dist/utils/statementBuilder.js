"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatementPDF = createStatementPDF;
exports.createStatementCSV = createStatementCSV;
// @ts-ignore
const pdfkit_1 = __importDefault(require("pdfkit"));
const sync_1 = require("csv-stringify/sync");
// Format date as YYYY-M-D
function formatDate(raw) {
    if (!raw)
        return '';
    const d = new Date(raw);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
// Generic table renderer with auto pagination
function renderTable(doc, title, headers, rows, colWidths) {
    doc.fontSize(14).font('Helvetica-Bold').text(title, { underline: true });
    doc.moveDown(0.5);
    if (rows.length === 0) {
        doc.fontSize(12).font('Helvetica').text(`- No ${title.toLowerCase()} in this period`);
        doc.moveDown();
        return;
    }
    const startX = doc.x;
    let y = doc.y;
    const rowHeight = 18;
    const drawRow = (values, isHeader = false) => {
        const fontType = isHeader ? 'Helvetica-Bold' : 'Helvetica';
        const fontSize = isHeader ? 11 : 10;
        doc.font(fontType).fontSize(fontSize);
        let x = startX;
        values.forEach((val, i) => {
            doc.text(String(val), x, y, {
                width: colWidths[i],
                align: i === values.length - 1 ? 'right' : 'left',
            });
            x += colWidths[i];
        });
        y += rowHeight;
        // Check for page break
        if (y > doc.page.height - 50) {
            doc.addPage();
            y = 50;
            drawRow(headers, true); // redraw header
        }
    };
    // Header row
    drawRow(headers, true);
    // Data rows
    rows.forEach((row) => drawRow(row));
    doc.moveDown();
    doc.y = y;
}
/**
 * Create a PDF Buffer of the statement. Heading must be "Statement".
 */
function createStatementPDF(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('Statement', { align: 'center' });
            doc.moveDown();
            if (data.propertyName)
                doc.fontSize(12).font('Helvetica').text(`Property: ${data.propertyName}`);
            if (data.period)
                doc.fontSize(12).font('Helvetica').text(`Period: ${data.period}`);
            doc.moveDown();
            // Compute summary if not provided
            const gross = data.summary?.gross ?? data.invoices.reduce((s, i) => s + (i.grossRevenue || 0), 0);
            const vat = data.summary?.vat ?? data.invoices.reduce((s, i) => s + (i.vat || 0), 0);
            const invoicedTotal = data.summary?.invoicedTotal ?? data.invoices.reduce((s, i) => s + (i.total || (i.grossRevenue + (i.vat || 0))), 0);
            const expensesTotal = data.summary?.expensesTotal ?? data.expenses.reduce((s, e) => s + (e.amount || 0), 0);
            const commissionsTotal = data.summary?.commissionsTotal ?? data.commissions.reduce((s, c) => s + (c.amount || 0), 0);
            const netPayout = data.summary?.netPayout ?? (invoicedTotal - commissionsTotal - expensesTotal);
            // Summary section
            doc.fontSize(14).font('Helvetica-Bold').text('Summary:');
            doc.moveDown(0.5);
            const fmt = (n) => `${n.toFixed(2)} €`;
            doc.fontSize(12).font('Helvetica');
            doc.text(`Gross Revenue: ${fmt(gross)}`);
            doc.text(`VAT: ${fmt(vat)}`);
            doc.text(`Total Invoiced (guest-paid): ${fmt(invoicedTotal)}`);
            doc.text(`Total Commissions: ${fmt(commissionsTotal)}`);
            doc.text(`Total Expenses: ${fmt(expensesTotal)}`);
            doc.text(`Net Payout: ${fmt(netPayout)}`);
            doc.moveDown();
            // Invoices table
            renderTable(doc, 'Invoices', ['ID', 'Date', 'Guest', 'Total'], data.invoices.map((inv) => [
                inv.id,
                formatDate(inv.date),
                inv.guestName ?? '',
                `${inv.total.toFixed(2)} €`,
            ]), [60, 90, 200, 100]);
            // Expenses table
            renderTable(doc, 'Expenses', ['ID', 'Date', 'Vendor', 'Amount'], data.expenses.map((e) => [
                e.id,
                formatDate(e.date),
                e.vendor,
                `${e.amount.toFixed(2)} €`,
            ]), [60, 90, 200, 100]);
            // Commissions table
            renderTable(doc, 'Commissions', ['ID', 'Date', 'Amount'], data.commissions.map((c) => [
                c.id,
                formatDate(c.date),
                `${c.amount.toFixed(2)} €`,
            ]), [60, 120, 100]);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
/**
 * Create a CSV string containing sections:
 * - Invoices
 * - Expenses
 * - Commissions
 * - Summary
 */
function createStatementCSV(data) {
    const invoiceHeader = ['Invoice ID', 'Date', 'Guest Name', 'Gross', 'VAT', 'Total', 'Invoice URL'];
    const invoiceRecords = data.invoices.map((inv) => [
        inv.id,
        formatDate(inv.date),
        inv.guestName ?? '',
        inv.grossRevenue.toFixed(2),
        inv.vat.toFixed(2),
        inv.total.toFixed(2),
        inv.invoiceUrl ?? '',
    ]);
    const invoicesCsv = (0, sync_1.stringify)([invoiceHeader, ...invoiceRecords]);
    const expenseHeader = ['Expense ID', 'Date', 'Vendor', 'Amount'];
    const expenseRecords = data.expenses.map((e) => [e.id, formatDate(e.date), e.vendor, e.amount.toFixed(2)]);
    const expensesCsv = (0, sync_1.stringify)([expenseHeader, ...expenseRecords]);
    const commissionHeader = ['Commission ID', 'Date', 'Amount'];
    const commissionRecords = data.commissions.map((c) => [c.id, formatDate(c.date), c.amount.toFixed(2)]);
    const commissionsCsv = (0, sync_1.stringify)([commissionHeader, ...commissionRecords]);
    const gross = data.summary?.gross ?? data.invoices.reduce((s, i) => s + (i.grossRevenue || 0), 0);
    const vat = data.summary?.vat ?? data.invoices.reduce((s, i) => s + (i.vat || 0), 0);
    const invoicedTotal = data.summary?.invoicedTotal ?? data.invoices.reduce((s, i) => s + (i.total || (i.grossRevenue + (i.vat || 0))), 0);
    const expensesTotal = data.summary?.expensesTotal ?? data.expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const commissionsTotal = data.summary?.commissionsTotal ?? data.commissions.reduce((s, c) => s + (c.amount || 0), 0);
    const netPayout = data.summary?.netPayout ?? (invoicedTotal - commissionsTotal - expensesTotal);
    const summaryHeader = ['Key', 'Value'];
    const summaryRecords = [
        ['Gross Revenue', gross.toFixed(2)],
        ['VAT', vat.toFixed(2)],
        ['Total Invoiced', invoicedTotal.toFixed(2)],
        ['Total Commissions', commissionsTotal.toFixed(2)],
        ['Total Expenses', expensesTotal.toFixed(2)],
        ['Net Payout', netPayout.toFixed(2)],
    ];
    const summaryCsv = (0, sync_1.stringify)([summaryHeader, ...summaryRecords]);
    return [
        '# Invoices',
        invoicesCsv,
        '',
        '# Expenses',
        expensesCsv,
        '',
        '# Commissions',
        commissionsCsv,
        '',
        '# Summary',
        summaryCsv,
    ].join('\n');
}
