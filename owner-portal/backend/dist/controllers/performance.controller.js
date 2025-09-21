"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformance = void 0;
const performance_service_1 = require("../services/performance.service");
const getPerformance = async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const { month } = req.query;
    if (!month) {
        return res.status(400).json({ message: "Missing month query parameter" });
    }
    try {
        const performance = await (0, performance_service_1.getMonthlyPerformanceService)(listingId, month);
        res.json(performance);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching monthly performance" });
    }
};
exports.getPerformance = getPerformance;
