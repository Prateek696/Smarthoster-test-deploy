"use strict";
// services/siba.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSibaLogsService = exports.bulkSibaStatusService = exports.getSibaStatusService = exports.sendSibaService = exports.validateSibaService = void 0;
const sibaLogs = []; // later move to DB
const validateSibaService = async (reservationId) => {
    // fake validation
    const isValid = reservationId % 2 === 0;
    return { reservationId, valid: isValid };
};
exports.validateSibaService = validateSibaService;
const sendSibaService = async (reservationId, propertyId) => {
    try {
        // simulate API call
        const success = Math.random() > 0.2;
        const log = {
            reservationId,
            propertyId,
            status: success ? "success" : "fail",
            message: success ? "SIBA sent successfully" : "SIBA failed",
            timestamp: new Date(),
        };
        sibaLogs.push(log);
        return log;
    }
    catch (err) {
        throw new Error("Error sending SIBA");
    }
};
exports.sendSibaService = sendSibaService;
const getSibaStatusService = async (propertyId) => {
    // Mock implementation - replace with actual logic
    return { propertyId, status: 'pending' };
};
exports.getSibaStatusService = getSibaStatusService;
const bulkSibaStatusService = async (propertyIds) => {
    return Promise.all(propertyIds.map(pid => (0, exports.getSibaStatusService)(pid)));
};
exports.bulkSibaStatusService = bulkSibaStatusService;
const getSibaLogsService = async (reservationId) => {
    return sibaLogs.filter(l => l.reservationId === reservationId);
};
exports.getSibaLogsService = getSibaLogsService;
