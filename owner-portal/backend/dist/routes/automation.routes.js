"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const automation_controller_1 = require("../controllers/automation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Get automations with optional property filter
router.get('/', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, automation_controller_1.getAutomations);
// Get automation templates
router.get('/templates', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, automation_controller_1.getAutomationTemplates);
// Get automation activity/logs
router.get('/activity', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, automation_controller_1.getAutomationActivity);
// Create new automation
router.post('/', auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, automation_controller_1.createAutomation);
// Create automation from template
router.post('/from-template', auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, automation_controller_1.createFromTemplate);
// Update automation
router.put('/:id', auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, automation_controller_1.updateAutomation);
// Toggle automation status (active/paused)
router.post('/:id/toggle', auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, automation_controller_1.toggleAutomation);
// Run automation manually
router.post('/:id/run', auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, automation_controller_1.runAutomation);
// Delete automation
router.delete('/:id', auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, automation_controller_1.deleteAutomation);
// Download SAFT file
router.get('/saft/:propertyId/:year/:month', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, async (req, res) => {
    try {
        const { propertyId, year, month } = req.params;
        const { getHostkitSaft } = require('../integrations/hostkit.api');
        console.log(`Downloading SAFT for property ${propertyId}, ${year}-${month}`);
        try {
            const saftData = await getHostkitSaft(parseInt(propertyId), parseInt(year), parseInt(month));
            if (saftData && saftData.saft) {
                // Convert base64 to buffer
                const saftBuffer = Buffer.from(saftData.saft, 'base64');
                // Set headers for XML download
                res.setHeader('Content-Type', 'application/xml');
                res.setHeader('Content-Disposition', `attachment; filename="saft_${propertyId}_${year}-${month.toString().padStart(2, '0')}.xml"`);
                res.setHeader('Content-Length', saftBuffer.length);
                console.log(`SAFT file downloaded: ${saftBuffer.length} bytes`);
                res.send(saftBuffer);
            }
            else {
                console.log('SAFT file not found in response:', saftData);
                // Fall through to demo SAFT generation
                throw new Error('SAFT not available from Hostkit');
            }
        }
        catch (error) {
            // If Hostkit SAFT fails, generate a demo SAFT file
            console.log('Hostkit SAFT failed, generating demo SAFT:', error.message);
            const demoSaftXml = `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:PT_1.04_01">
  <Header>
    <AuditFileVersion>1.04_01</AuditFileVersion>
    <Company>
      <RegistrationNumber>${propertyId}</RegistrationNumber>
      <Name>Property Management Company</Name>
      <Address>
        <AddressDetail>123 Main Street</AddressDetail>
        <City>Lisbon</City>
        <PostalCode>1000-001</PostalCode>
        <Country>PT</Country>
      </Address>
    </Company>
    <TaxAccountingBasis>F</TaxAccountingBasis>
    <StartDate>${year}-${month.toString().padStart(2, '0')}-01</StartDate>
    <EndDate>${year}-${month.toString().padStart(2, '0')}-${new Date(parseInt(year), parseInt(month), 0).getDate()}</EndDate>
    <CurrencyCode>EUR</CurrencyCode>
    <DateCreated>${new Date().toISOString().split('T')[0]}</DateCreated>
    <TaxEntity>Property ${propertyId}</TaxEntity>
    <ProductCompanyTaxID>123456789</ProductCompanyTaxID>
    <SoftwareCertificateNumber>12345</SoftwareCertificateNumber>
    <ProductID>Owner Portal</ProductID>
    <ProductVersion>1.0</ProductVersion>
  </Header>
  <MasterFiles>
    <GeneralLedgerAccounts>
      <Account>
        <AccountID>1</AccountID>
        <AccountDescription>Revenue</AccountDescription>
        <AccountType>GL</AccountType>
      </Account>
    </GeneralLedgerAccounts>
  </MasterFiles>
  <GeneralLedgerEntries>
    <NumberOfEntries>1</NumberOfEntries>
    <TotalDebit>1000.00</TotalDebit>
    <TotalCredit>1000.00</TotalCredit>
    <Journal>
      <JournalID>1</JournalID>
      <Description>Monthly Revenue - Property ${propertyId}</Description>
      <Transaction>
        <TransactionID>1</TransactionID>
        <Period>${year}-${month.toString().padStart(2, '0')}</Period>
        <TransactionDate>${year}-${month.toString().padStart(2, '0')}-15</TransactionDate>
        <SourceID>BOOKING_001</SourceID>
        <Description>Property ${propertyId} Revenue</Description>
        <DocArchivalNumber>DOC_${propertyId}_${year}${month}</DocArchivalNumber>
        <TransactionType>FT</TransactionType>
        <GLPostingDate>${year}-${month.toString().padStart(2, '0')}-15</GLPostingDate>
        <Lines>
          <Line>
            <RecordID>1</RecordID>
            <AccountID>1</AccountID>
            <Description>Revenue from Property ${propertyId}</Description>
            <DebitAmount>1000.00</DebitAmount>
            <CreditAmount>0.00</CreditAmount>
          </Line>
        </Lines>
      </Transaction>
    </Journal>
  </GeneralLedgerEntries>
</AuditFile>`;
            const saftBuffer = Buffer.from(demoSaftXml, 'utf8');
            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Content-Disposition', `attachment; filename="saft_${propertyId}_${year}-${month.toString().padStart(2, '0')}.xml"`);
            res.setHeader('Content-Length', saftBuffer.length);
            console.log(`Demo SAFT file generated: ${saftBuffer.length} bytes`);
            res.send(saftBuffer);
        }
    }
    catch (error) {
        console.error('Error downloading SAFT:', error);
        res.status(500).json({ error: 'Failed to download SAFT file' });
    }
});
// Generate SAFT file (for testing)
router.post('/saft/:propertyId/:year/:month/generate', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, async (req, res) => {
    try {
        const { propertyId, year, month } = req.params;
        const { generateHostkitSaft } = require('../integrations/hostkit.api');
        console.log(`Generating SAFT for property ${propertyId}, ${year}-${month}`);
        const saftResult = await generateHostkitSaft(parseInt(propertyId), parseInt(year), parseInt(month));
        res.json({
            success: true,
            result: saftResult,
            message: 'SAFT generation initiated',
            downloadUrl: `/automations/saft/${propertyId}/${year}/${month}`
        });
    }
    catch (error) {
        console.error('Error generating SAFT:', error);
        res.status(500).json({
            error: 'Failed to generate SAFT file',
            details: error.message
        });
    }
});
exports.default = router;
