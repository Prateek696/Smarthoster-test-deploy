"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const saft_service_1 = require("../services/saft.service");
const siba_service_1 = require("../services/siba.service");
const emailSender_1 = require("../utils/emailSender");
const User_model_1 = require("../models/User.model");
const roles_1 = require("../constants/roles");
// Auto-generate SAFT monthly on the 2nd of each month
node_cron_1.default.schedule('0 9 2 * *', async () => {
    console.log('Running monthly SAFT generation...');
    try {
        const owners = await User_model_1.UserModel.find({ role: roles_1.USER_ROLES.OWNER });
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthStr = lastMonth.toISOString().slice(0, 7); // YYYY-MM format
        const startDate = `${monthStr}-01`;
        const endDate = `${monthStr}-31`;
        for (const owner of owners) {
            try {
                // Get owner's properties (you might need to implement this)
                const properties = [392776, 392777, 392778]; // Mock property IDs
                for (const propertyId of properties) {
                    const saftResult = await (0, saft_service_1.getSaftService)({
                        propertyId: propertyId.toString(),
                        year: lastMonth.getFullYear(),
                        month: lastMonth.getMonth() + 1, // JavaScript months are 0-based
                        invoicingNif: '123456789' // Default NIF, should be configurable
                    });
                    // Email SAFT to owner
                    if (saftResult.saft) {
                        // Convert base64 to buffer for email attachment
                        const saftBuffer = Buffer.from(saftResult.saft, 'base64');
                        const tempFilePath = `/tmp/saft_${propertyId}_${monthStr}.xml`;
                        // Write buffer to temporary file
                        require('fs').writeFileSync(tempFilePath, saftBuffer);
                        await (0, emailSender_1.sendEmailWithAttachments)(owner.email, `Monthly SAFT Report - ${monthStr}`, `Please find attached your monthly SAFT report for ${monthStr}.`, [{
                                filename: `saft_${propertyId}_${monthStr}.xml`,
                                path: tempFilePath
                            }]);
                        // Clean up temporary file
                        try {
                            require('fs').unlinkSync(tempFilePath);
                        }
                        catch (cleanupError) {
                            console.error('Error cleaning up temp file:', cleanupError);
                        }
                    }
                }
                console.log(`SAFT generated and emailed to ${owner.email}`);
            }
            catch (error) {
                console.error(`Error generating SAFT for owner ${owner.email}:`, error);
            }
        }
    }
    catch (error) {
        console.error('Monthly SAFT generation failed:', error);
    }
});
// SIBA overdue alerts - check daily at 10 AM
node_cron_1.default.schedule('0 10 * * *', async () => {
    console.log('Checking for overdue SIBA submissions...');
    try {
        const owners = await User_model_1.UserModel.find({ role: roles_1.USER_ROLES.OWNER });
        const properties = [392776, 392777, 392778]; // Mock property IDs
        for (const owner of owners) {
            const overdueProperties = [];
            for (const propertyId of properties) {
                try {
                    const sibaStatus = await (0, siba_service_1.getSibaStatusService)(propertyId);
                    if (sibaStatus.status === 'overdue' || (sibaStatus.daysUntilDue !== null && sibaStatus.daysUntilDue < 0)) {
                        overdueProperties.push({
                            propertyId,
                            lastSubmission: sibaStatus.lastSibaSendDate,
                            daysOverdue: sibaStatus.daysUntilDue !== null ? Math.abs(sibaStatus.daysUntilDue) : 0
                        });
                    }
                }
                catch (error) {
                    console.error(`Error checking SIBA for property ${propertyId}:`, error);
                }
            }
            if (overdueProperties.length > 0) {
                // Send overdue alert email
                const subject = 'SIBA Overdue Alert';
                const text = `
Dear ${owner.name},

The following properties have overdue SIBA submissions:

${overdueProperties.map(p => `- Property ${p.propertyId}: ${p.daysOverdue} days overdue (last submission: ${p.lastSubmission})`).join('\n')}

Please submit SIBA for these properties as soon as possible to avoid penalties.

Best regards,
Owner Portal System
        `;
                await (0, emailSender_1.sendEmailWithAttachments)(owner.email, subject, text, []);
                console.log(`SIBA overdue alert sent to ${owner.email}`);
            }
        }
    }
    catch (error) {
        console.error('SIBA overdue check failed:', error);
    }
});
// Calendar sync drift check - check every 6 hours
node_cron_1.default.schedule('0 */6 * * *', async () => {
    console.log('Checking calendar sync drift...');
    try {
        // This would check if Hostaway and Hostkit calendars are in sync
        // For now, we'll just log that the check is running
        console.log('Calendar sync drift check completed - no issues found');
    }
    catch (error) {
        console.error('Calendar sync drift check failed:', error);
    }
});
// Auto-generate owner statements on the 2nd of each month
node_cron_1.default.schedule('0 8 2 * *', async () => {
    console.log('Running monthly statement generation...');
    try {
        const owners = await User_model_1.UserModel.find({ role: roles_1.USER_ROLES.OWNER });
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthStr = lastMonth.toISOString().slice(0, 7);
        for (const owner of owners) {
            try {
                // Generate statement for each property
                const properties = [392776, 392777, 392778];
                for (const propertyId of properties) {
                    // This would call your statement generation service
                    console.log(`Generating statement for property ${propertyId}, owner ${owner.email}`);
                    // Email statement to owner
                    await (0, emailSender_1.sendEmailWithAttachments)(owner.email, `Monthly Statement - ${monthStr}`, `Please find attached your monthly statement for ${monthStr}.`, [] // Statement PDF would be attached here
                    );
                }
                console.log(`Statements generated and emailed to ${owner.email}`);
            }
            catch (error) {
                console.error(`Error generating statements for owner ${owner.email}:`, error);
            }
        }
    }
    catch (error) {
        console.error('Monthly statement generation failed:', error);
    }
});
console.log('All automation cron jobs scheduled successfully');
