"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const statements_service_1 = require("../services/statements.service");
const emailSender_1 = require("../utils/emailSender");
async function sendMonthlyStatements() {
    // Fetch list of properties and owners from DB or API
    const properties = [
        { id: 123, ownerEmail: 'owner@example.com' },
        // Add more
    ];
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth(); // Previous month (0-indexed)
    if (month === 0) {
        month = 12;
        year -= 1;
    }
    for (const property of properties) {
        try {
            const { pdfFilename, csvFilename, pdfFilePath, csvFilePath } = await (0, statements_service_1.generateStatement)(property.id, year, month);
            await (0, emailSender_1.sendEmailWithAttachments)(property.ownerEmail, `Owner Statement for ${year}-${month}`, `Please find attached your monthly owner statement.`, [
                { filename: pdfFilename, path: pdfFilePath },
                { filename: csvFilename, path: csvFilePath },
            ]);
            console.log(`Sent owner statement to ${property.ownerEmail}`);
        }
        catch (error) {
            console.error(`Failed to send statement for property ${property.id}`, error);
        }
    }
}
// Schedule the task to run at 8:00 AM on the 2nd day of every month
node_cron_1.default.schedule('0 8 2 * *', () => {
    console.log('Running monthly owner statement email job');
    sendMonthlyStatements();
});
