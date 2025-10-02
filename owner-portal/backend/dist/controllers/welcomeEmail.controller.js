"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAccountantWelcomeEmailAPI = exports.sendOwnerWelcomeEmail = void 0;
const email_service_1 = require("../services/email.service");
/**
 * @desc Send welcome email to new owner
 */
const sendOwnerWelcomeEmail = async (req, res) => {
    try {
        const { name, email, password, portalUrl } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }
        console.log(`📧 API: Sending welcome email to owner: ${email}`);
        const emailSent = await (0, email_service_1.sendWelcomeEmail)({
            name,
            email,
            password,
            portalUrl: portalUrl || process.env.PORTAL_URL || 'https://smarthoster-test-deploy-final.vercel.app'
        });
        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send welcome email" });
        }
        console.log(`✅ API: Welcome email sent successfully to owner: ${email}`);
        res.json({ success: true, message: "Welcome email sent successfully" });
    }
    catch (error) {
        console.error('❌ API: Error sending welcome email:', error);
        res.status(500).json({ message: error.message || "Failed to send welcome email" });
    }
};
exports.sendOwnerWelcomeEmail = sendOwnerWelcomeEmail;
/**
 * @desc Send welcome email to new accountant
 */
const sendAccountantWelcomeEmailAPI = async (req, res) => {
    try {
        const { name, email, password, portalUrl } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }
        console.log(`📧 API: Sending welcome email to accountant: ${email}`);
        const emailSent = await (0, email_service_1.sendAccountantWelcomeEmail)({
            name,
            email,
            password,
            portalUrl: portalUrl || process.env.PORTAL_URL || 'https://smarthoster-test-deploy-final.vercel.app'
        });
        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send welcome email" });
        }
        console.log(`✅ API: Welcome email sent successfully to accountant: ${email}`);
        res.json({ success: true, message: "Welcome email sent successfully" });
    }
    catch (error) {
        console.error('❌ API: Error sending welcome email:', error);
        res.status(500).json({ message: error.message || "Failed to send welcome email" });
    }
};
exports.sendAccountantWelcomeEmailAPI = sendAccountantWelcomeEmailAPI;
