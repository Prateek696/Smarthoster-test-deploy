"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ownerStatement_service_1 = require("../services/ownerStatement.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
// Get owner statements for a specific property
router.get("/property/:propertyId", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([roles_1.USER_ROLES.OWNER, roles_1.USER_ROLES.ACCOUNTANT]), async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate, limit, offset } = req.query;
        const statements = await (0, ownerStatement_service_1.getOwnerStatements)(Number(propertyId), startDate, endDate, limit ? Number(limit) : 50, offset ? Number(offset) : 0, req.query.year ? Number(req.query.year) : undefined, req.query.month ? Number(req.query.month) : undefined);
        res.json(statements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get all owner statements
router.get("/", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([roles_1.USER_ROLES.OWNER, roles_1.USER_ROLES.ACCOUNTANT]), async (req, res) => {
    try {
        const { startDate, endDate, limit, offset } = req.query;
        const statements = await (0, ownerStatement_service_1.getAllOwnerStatements)(startDate, endDate, limit ? Number(limit) : 100, offset ? Number(offset) : 0);
        res.json(statements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get specific owner statement by ID
router.get("/:statementId", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([roles_1.USER_ROLES.OWNER, roles_1.USER_ROLES.ACCOUNTANT]), async (req, res) => {
    try {
        const { statementId } = req.params;
        const statement = await (0, ownerStatement_service_1.getOwnerStatement)(statementId);
        if (!statement) {
            return res.status(404).json({ message: "Owner statement not found" });
        }
        res.json(statement);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Download owner statement as PDF
router.get("/:statementId/download/pdf", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([roles_1.USER_ROLES.OWNER, roles_1.USER_ROLES.ACCOUNTANT]), async (req, res) => {
    try {
        const { statementId } = req.params;
        const pdfBuffer = await (0, ownerStatement_service_1.downloadOwnerStatementPDF)(statementId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="owner-statement-${statementId}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Download owner statement as CSV
router.get("/:statementId/download/csv", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([roles_1.USER_ROLES.OWNER, roles_1.USER_ROLES.ACCOUNTANT]), async (req, res) => {
    try {
        const { statementId } = req.params;
        const csvBuffer = await (0, ownerStatement_service_1.downloadOwnerStatementCSV)(statementId);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="owner-statement-${statementId}.csv"`);
        res.send(csvBuffer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get monthly statement summary
router.get("/property/:propertyId/monthly/:year/:month", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([roles_1.USER_ROLES.OWNER, roles_1.USER_ROLES.ACCOUNTANT]), async (req, res) => {
    try {
        const { propertyId, year, month } = req.params;
        const summary = await (0, ownerStatement_service_1.getMonthlyStatementSummary)(Number(propertyId), Number(year), Number(month));
        res.json(summary);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Generate monthly PDF statement
router.get("/property/:propertyId/monthly/:year/:month/pdf", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([roles_1.USER_ROLES.OWNER, roles_1.USER_ROLES.ACCOUNTANT]), async (req, res) => {
    try {
        const { propertyId, year, month } = req.params;
        const { propertyName } = req.query;
        const pdfBuffer = await (0, ownerStatement_service_1.generateMonthlyPDF)(Number(propertyId), propertyName || `Property ${propertyId}`, Number(year), Number(month));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="monthly-statement-${propertyId}-${year}-${month}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
