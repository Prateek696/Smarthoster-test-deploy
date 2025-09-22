"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpenses = getExpenses;
const expense_service_1 = require("../services/expense.service");
async function getExpenses(req, res) {
    const propertyId = Number(req.query.propertyId);
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    if (!propertyId) {
        return res.status(400).json({ error: 'propertyId is required' });
    }
    try {
        const expenses = await (0, expense_service_1.fetchExpenses)(propertyId, year, month, startDate, endDate);
        res.json({ expenses });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
}
