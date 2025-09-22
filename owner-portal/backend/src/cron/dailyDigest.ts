import cron from 'node-cron';
import { sendDailyDigest } from '../services/notification.service';
import { getHostawayReservations } from '../integrations/hostaway.api';
import { getHostkitInvoices } from '../integrations/hostkit.api';
import { UserModel } from '../models/User.model';
import { USER_ROLES } from '../constants/roles';
import { getPropertiesService } from '../services/property.service';

async function generateAndSendDailyDigest() {
  try {
    console.log('Starting daily digest generation...');
    
    // Get today's date range
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get all owners to send digest to
    const owners = await UserModel.find({ role: USER_ROLES.OWNER });
    
    for (const owner of owners) {
      try {
        // Get properties for this owner from the database
        const ownerProperties = await getPropertiesService((owner._id as any).toString());
        const propertyIds = ownerProperties.properties.map((prop: any) => prop.id);
        
        let totalNewBookings = 0;
        let totalNewInvoices = 0;
        let newBookingsList: any[] = [];
        let newInvoicesList: any[] = [];
        
        // Check each property for new bookings and invoices
        for (const propertyId of propertyIds) {
          try {
            // Get today's bookings
            const bookingsRes = await getHostawayReservations(propertyId, todayStr, tomorrowStr);
            const todayBookings = Array.isArray(bookingsRes.result) ? bookingsRes.result : [];
            
            // Filter for new bookings (created today)
            const newBookings = todayBookings.filter((booking: any) => {
              const createdDate = new Date(booking.createdAt || booking.insertedOn || '').toISOString().split('T')[0];
              return createdDate === todayStr;
            });
            
            totalNewBookings += newBookings.length;
            newBookingsList.push(...newBookings.map((b: any) => ({
              propertyId,
              guestName: b.guestName,
              checkIn: b.arrivalDate,
              checkOut: b.departureDate,
              amount: b.totalPrice
            })));
            
            // Get today's invoices
            const invoicesRes = await getHostkitInvoices(propertyId, todayStr, tomorrowStr);
            const todayInvoices = Array.isArray(invoicesRes) ? invoicesRes : [];
            
            totalNewInvoices += todayInvoices.length;
            newInvoicesList.push(...todayInvoices.map((i: any) => ({
              propertyId,
              invoiceId: i.id,
              amount: i.value,
              date: i.date
            })));
            
          } catch (propertyError) {
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
        
      } catch (ownerError) {
        console.error(`Error generating digest for owner ${owner.email}:`, ownerError);
      }
    }
    
    console.log('Daily digest generation completed');
  } catch (error) {
    console.error('Error in daily digest generation:', error);
  }
}

async function sendPersonalizedDailyDigest(email: string, digestData: any) {
  const { totalNewBookings, totalNewInvoices, newBookingsList, newInvoicesList, date } = digestData;
  
  let bookingsText = '';
  if (totalNewBookings > 0) {
    bookingsText = `\nNew Bookings (${totalNewBookings}):\n`;
    newBookingsList.forEach((booking: any) => {
      bookingsText += `- Property ${booking.propertyId}: ${booking.guestName} (${booking.checkIn} to ${booking.checkOut}) - €${booking.amount}\n`;
    });
    if (totalNewBookings > 5) {
      bookingsText += `... and ${totalNewBookings - 5} more bookings\n`;
    }
  } else {
    bookingsText = '\nNo new bookings today.\n';
  }
  
  let invoicesText = '';
  if (totalNewInvoices > 0) {
    invoicesText = `\nNew Invoices (${totalNewInvoices}):\n`;
    newInvoicesList.forEach((invoice: any) => {
      invoicesText += `- Property ${invoice.propertyId}: Invoice ${invoice.invoiceId} - €${invoice.amount}\n`;
    });
    if (totalNewInvoices > 5) {
      invoicesText += `... and ${totalNewInvoices - 5} more invoices\n`;
    }
  } else {
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
cron.schedule('0 8 * * *', () => {
  console.log('Running daily digest cron job...');
  generateAndSendDailyDigest();
});

console.log('Daily digest cron job scheduled for 8:00 AM daily');



