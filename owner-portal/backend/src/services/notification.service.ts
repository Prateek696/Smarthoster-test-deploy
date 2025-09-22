import { sendEmailWithAttachments } from "../utils/emailSender";
import { UserModel } from "../models/User.model";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send notification when dates are blocked/unblocked
 */
export const sendBlockUnblockNotification = async (
  listingId: number,
  startDate: string,
  endDate: string,
  status: "blocked" | "available"
) => {
  try {
    // Get property owners for this listing (you might need to adjust this based on your property model)
    const owners = await UserModel.find({ role: "owner" });

    const action = status === "blocked" ? "blocked" : "unblocked";
    const subject = `Calendar Update - Dates ${action.charAt(0).toUpperCase() + action.slice(1)}`;
    const text = `
Property ${listingId} calendar has been updated:

Dates: ${startDate} to ${endDate}
Action: ${action.charAt(0).toUpperCase() + action.slice(1)}

This update has been synchronized across all platforms.

Best regards,
Owner Portal System
    `;

    for (const owner of owners) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: owner.email,
        subject,
        text,
      });
    }

    console.log(`Block/unblock notification sent for listing ${listingId}`);
  } catch (error) {
    console.error("Error sending block/unblock notification:", error);
    throw error;
  }
};

/**
 * Send daily digest of new bookings and invoices
 */
export const sendDailyDigest = async () => {
  try {
    const owners = await UserModel.find({ role: "owner" });
    const today = new Date().toISOString().split('T')[0];
    
    // You'll need to implement logic to fetch new bookings and invoices for today
    // This is a placeholder structure
    
    for (const owner of owners) {
      const subject = `Daily Digest - ${today}`;
      const text = `
Daily summary for ${today}:

New Bookings: 0
New Invoices: 0

View details in your owner portal.

Best regards,
Owner Portal System
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: owner.email,
        subject,
        text,
      });
    }

    console.log("Daily digest sent to all owners");
  } catch (error) {
    console.error("Error sending daily digest:", error);
    throw error;
  }
};

/**
 * Send notification when new booking is created
 */
export const sendNewBookingNotification = async (
  listingId: number,
  bookingDetails: any
) => {
  try {
    const owners = await UserModel.find({ role: "owner" });
    
    const subject = `New Booking - Property ${listingId}`;
    const text = `
A new booking has been received:

Property: ${listingId}
Guest: ${bookingDetails.guestName || 'N/A'}
Check-in: ${bookingDetails.arrivalDate || 'N/A'}
Check-out: ${bookingDetails.departureDate || 'N/A'}
Total Amount: ${bookingDetails.totalPrice || 'N/A'}

View full details in your owner portal.

Best regards,
Owner Portal System
    `;

    for (const owner of owners) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: owner.email,
        subject,
        text,
      });
    }

    console.log(`New booking notification sent for listing ${listingId}`);
  } catch (error) {
    console.error("Error sending new booking notification:", error);
    throw error;
  }
};

/**
 * Send notification when new invoice is generated
 */
export const sendNewInvoiceNotification = async (
  listingId: number,
  invoiceDetails: any
) => {
  try {
    const owners = await UserModel.find({ role: "owner" });
    
    const subject = `New Invoice - Property ${listingId}`;
    const text = `
A new invoice has been generated:

Property: ${listingId}
Invoice ID: ${invoiceDetails.id || 'N/A'}
Amount: ${invoiceDetails.value || 'N/A'}
Date: ${invoiceDetails.date || 'N/A'}

Download your invoice from the owner portal.

Best regards,
Owner Portal System
    `;

    for (const owner of owners) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: owner.email,
        subject,
        text,
      });
    }

    console.log(`New invoice notification sent for listing ${listingId}`);
  } catch (error) {
    console.error("Error sending new invoice notification:", error);
    throw error;
  }
};
