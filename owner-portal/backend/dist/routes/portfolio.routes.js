"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const portfolio_service_1 = require("../services/portfolio.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Get portfolio overview - owners and accountants
router.get("/overview", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, async (req, res) => {
    try {
        const { propertyIds, month } = req.query;
        if (!propertyIds || !month) {
            return res.status(400).json({ message: 'propertyIds and month are required' });
        }
        const propertyIdsArray = Array.isArray(propertyIds)
            ? propertyIds.map(id => Number(id))
            : [Number(propertyIds)];
        const overview = await (0, portfolio_service_1.getPortfolioOverview)(propertyIdsArray, month);
        res.json(overview);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get portfolio trends - owners and accountants
router.get("/trends", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, async (req, res) => {
    try {
        const { propertyIds, months } = req.query;
        if (!propertyIds || !months) {
            return res.status(400).json({ message: 'propertyIds and months are required' });
        }
        const propertyIdsArray = Array.isArray(propertyIds)
            ? propertyIds.map(id => Number(id))
            : [Number(propertyIds)];
        const monthsArray = Array.isArray(months)
            ? months
            : [months];
        const trends = await (0, portfolio_service_1.getPortfolioTrends)(propertyIdsArray, monthsArray);
        res.json(trends);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
