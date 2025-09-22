"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSaftXml = void 0;
const xmlbuilder2_1 = require("xmlbuilder2");
const buildSaftXml = ({ propertyId, companyName, startDate, endDate, invoices, }) => {
    // Root element "AuditFile" is required by SAFT-PT schema
    const root = (0, xmlbuilder2_1.create)({ version: '1.0', encoding: 'UTF-8' })
        .ele('AuditFile')
        .ele('Header')
        .ele('CompanyID').txt(propertyId).up()
        .ele('CompanyName').txt(companyName || "Not specified").up()
        .ele('StartDate').txt(startDate).up()
        .ele('EndDate').txt(endDate).up()
        .up() // Close Header
        .ele('Invoices');
    invoices.forEach(inv => {
        const invNode = root.ele('Invoice');
        invNode.ele('InvoiceNo').txt(inv.invoiceId).up();
        invNode.ele('InvoiceDate').txt(inv.date).up();
        invNode.ele('CustomerName').txt(inv.customerName || "Unknown").up();
        invNode.ele('InvoiceTotal').txt(inv.total.toFixed(2)).up();
        invNode.ele('Currency').txt(inv.currency || 'EUR').up();
        if (typeof inv.tax === 'number') {
            invNode.ele('Tax').txt(inv.tax.toFixed(2)).up();
        }
        // Add more fields as needed based on your structure & SAFT
        invNode.up();
    });
    root.up(); // End Invoices
    return root.end({ prettyPrint: true });
};
exports.buildSaftXml = buildSaftXml;
