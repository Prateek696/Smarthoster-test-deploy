"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const hostaway_api_1 = require("../integrations/hostaway.api");
const hostkit_api_1 = require("../integrations/hostkit.api");
const User_model_1 = require("../models/User.model");
const roles_1 = require("../constants/roles");
const property_service_1 = require("../services/property.service");
async function generateAndSendDailyDigest() {
    try {
        console.log('Starting daily digest generation...');
        // Get today's date range
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        // Get all owners to send digest to
        const owners = await User_model_1.UserModel.find({ role: roles_1.USER_ROLES.OWNER });
        for (const owner of owners) {
            try {
                // Get properties for this owner from the database
                const ownerProperties = await (0, property_service_1.getPropertiesService)(owner._id.toString());
                const propertyIds = ownerProperties.properties.map((prop) => prop.id);
                let totalNewBookings = 0;
                let totalNewInvoices = 0;
                let newBookingsList = [];
                let newInvoicesList = [];
                // Check each property for new bookings and invoices
                for (const propertyId of propertyIds) {
                    try {
                        // Get today's bookings
                        const bookingsRes = await (0, hostaway_api_1.getHostawayReservations)(propertyId, todayStr, tomorrowStr);
                        const todayBookings = Array.isArray(bookingsRes.result) ? bookingsRes.result : [];
                        // Filter for new bookings (created today)
                        const newBookings = todayBookings.filter((booking) => {
                            const createdDate = new Date(booking.createdAt || booking.insertedOn || '').toISOString().split('T')[0];
                            return createdDate === todayStr;
                        });
                        totalNewBookings += newBookings.length;
                        newBookingsList.push(...newBookings.map((b) => ({
                            propertyId,
                            guestName: b.guestName,
                            checkIn: b.arrivalDate,
                            checkOut: b.departureDate,
                            amount: b.totalPrice
                        })));
                        // Get today's invoices
                        const invoicesRes = await (0, hostkit_api_1.getHostkitInvoices)(propertyId, todayStr, tomorrowStr);
                        const todayInvoices = Array.isArray(invoicesRes) ? invoicesRes : [];
                        totalNewInvoices += todayInvoices.length;
                        newInvoicesList.push(...todayInvoices.map((i) => ({
                            propertyId,
                            invoiceId: i.id,
                            amount: i.value,
                            date: i.date
                        })));
                    }
                    catch (propertyError) {
                        console.error(`Error processing property ${propertyId}:`, propertyError);
                    }
                }
                // Send personalized digest
                await sendPersonalizedDailyDigest(owner.email, {
                    totalNewBookings,
                    totalNewInvoices,
                    newBookingsList: newBookingsList.slice(0, 5), // Limit to 5 most recent
                    newInvoicesList: newInvoicesList.slice(0, 5), // Limit to 5 most recent
                    date: todayStr
                });
            }
            catch (ownerError) {
                console.error(`Error generating digest for owner ${owner.email}:`, ownerError);
            }
        }
        console.log('Daily digest generation completed');
    }
    catch (error) {
        console.error('Error in daily digest generation:', error);
    }
}
async function sendPersonalizedDailyDigest(email, digestData) {
    const { totalNewBookings, totalNewInvoices, newBookingsList, newInvoicesList, date } = digestData;
    let bookingsText = '';
    if (totalNewBookings > 0) {
        bookingsText = `\nNew Bookings (${totalNewBookings}):\n`;
        newBookingsList.forEach((booking) => {
            bookingsText += `- Property ${booking.propertyId}: ${booking.guestName} (${booking.checkIn} to ${booking.checkOut}) - €${booking.amount}\n`;
        });
        if (totalNewBookings > 5) {
            bookingsText += `... and ${totalNewBookings - 5} more bookings\n`;
        }
    }
    else {
        bookingsText = '\nNo new bookings today.\n';
    }
    let invoicesText = '';
    if (totalNewInvoices > 0) {
        invoicesText = `\nNew Invoices (${totalNewInvoices}):\n`;
        newInvoicesList.forEach((invoice) => {
            invoicesText += `- Property ${invoice.propertyId}: Invoice ${invoice.invoiceId} - €${invoice.amount}\n`;
        });
        if (totalNewInvoices > 5) {
            invoicesText += `... and ${totalNewInvoices - 5} more invoices\n`;
        }
    }
    else {
        invoicesText = '\nNo new invoices today.\n';
    }
    const subject = `Daily Property Digest - ${date}`;
    const text = `
Good morning!

Here's your daily property summary for ${date}:

${bookingsText}
${invoicesText}

Login to your owner portal to view complete details and manage your properties.

Best regards,
Owner Portal System
  `;
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        text,
    });
}
// Schedule daily digest at 8:00 AM every day
node_cron_1.default.schedule('0 8 * * *', () => {
    console.log('Running daily digest cron job...');
    generateAndSendDailyDigest();
});
console.log('Daily digest cron job scheduled for 8:00 AM daily');
