import { Request, Response } from "express";
import { sendWelcomeEmail, sendAccountantWelcomeEmail } from "../services/email.service";

/**
 * @desc Send welcome email to new owner
 */
export const sendOwnerWelcomeEmail = async (req: Request, res: Response) => {
  try {
    const { name, email, password, portalUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    console.log(`📧 API: Sending welcome email to owner: ${email}`);

    const emailSent = await sendWelcomeEmail({
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

  } catch (error: any) {
    console.error('❌ API: Error sending welcome email:', error);
    res.status(500).json({ message: error.message || "Failed to send welcome email" });
  }
};

/**
 * @desc Send welcome email to new accountant
 */
export const sendAccountantWelcomeEmailAPI = async (req: Request, res: Response) => {
  try {
    const { name, email, password, portalUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    console.log(`📧 API: Sending welcome email to accountant: ${email}`);

    const emailSent = await sendAccountantWelcomeEmail({
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

  } catch (error: any) {
    console.error('❌ API: Error sending welcome email:', error);
    res.status(500).json({ message: error.message || "Failed to send welcome email" });
  }
};

