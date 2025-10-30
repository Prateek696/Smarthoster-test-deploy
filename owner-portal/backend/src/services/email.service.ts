import * as nodemailer from 'nodemailer';

// Email transporter configuration (reuse same config as OTP service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface WelcomeEmailData {
  name: string;
  email: string;
  password: string;
  portalUrl?: string;
}

/**
 * Send welcome email to newly created owner
 */
export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<boolean> => {
  try {
    const { name, email, password, portalUrl = process.env.PORTAL_URL || 'https://smarthoster-test-deploy-final.vercel.app' } = data;

    console.log(`📧 Sending welcome email to: ${email}`);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to SmartHoster Owner Portal - Your Account is Ready! 🎉',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SmartHoster</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #34d399 0%, #38bdf8 100%); padding: 40px 30px; text-align: center;">
              <img src="https://res.cloudinary.com/dd5notzuv/image/upload/c_fill,w_80,h_80,b_white/v1761401047/Real-logo_aaqxgq.jpg" alt="SmartHoster Logo" style="width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 12px; padding: 5px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                SmartHoster Owner Portal
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Your Account is Ready!
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #1f2937; font-weight: 600;">
                Hi ${name},
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">
                Welcome to SmartHoster! Your owner account has been successfully created. You now have access to manage your properties, track bookings, and generate tax reports.
              </p>

              <!-- Login Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1f2937; font-weight: 600;">
                      📋 Your Login Credentials
                    </h2>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #6b7280; font-size: 14px;">Email:</strong>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <span style="color: #1f2937; font-size: 14px; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 8px; border-radius: 4px;">${email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #6b7280; font-size: 14px;">Password:</strong>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <span style="color: #1f2937; font-size: 14px; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${password}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Login Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #38bdf8 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.25);">
                      Login to Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280; text-align: center;">
                Portal URL: <a href="${portalUrl}" style="color: #16a34a; text-decoration: none;">${portalUrl}</a>
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <!-- What You Can Do Section -->
              <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937; font-weight: 600;">
                🚀 What You Can Do:
              </h3>
              
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                <li>View and manage your properties</li>
                <li>Track bookings and revenue</li>
                <li>Download invoices and statements</li>
                <li>Generate SAFT-T tax files</li>
                <li>Update property availability</li>
              </ul>

              <!-- Security Tip Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                      🔒 <strong>Security Tip:</strong> We recommend changing your password after your first login for better security. You can do this in Settings or use the Forgot Password option.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Support Section -->
              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                Need help? Contact us at 
                <a href="mailto:contact@smarthoster.io" style="color: #16a34a; text-decoration: none; font-weight: 600;">
                  contact@smarthoster.io
                </a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937; font-weight: 600;">
                Best regards,<br>
                The SmartHoster Team
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} SmartHoster. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to ${email}:`, info.messageId);
    return true;

  } catch (error: any) {
    console.error(`❌ Error sending welcome email to ${data.email}:`, error.message);
    return false;
  }
};

/**
 * Send welcome email to newly created accountant
 */
export const sendAccountantWelcomeEmail = async (data: WelcomeEmailData): Promise<boolean> => {
  try {
    const { name, email, password, portalUrl = process.env.PORTAL_URL || 'https://smarthoster-test-deploy-final.vercel.app' } = data;

    console.log(`📧 Sending welcome email to accountant: ${email}`);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to SmartHoster Accountant Portal - Your Account is Ready! 📊',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SmartHoster</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #34d399 0%, #38bdf8 100%); padding: 40px 30px; text-align: center;">
              <img src="https://res.cloudinary.com/dd5notzuv/image/upload/c_fill,w_80,h_80,b_white/v1761401047/Real-logo_aaqxgq.jpg" alt="SmartHoster Logo" style="width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 12px; padding: 5px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                📊 SmartHoster Accountant Portal
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Your Account is Ready!
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #1f2937; font-weight: 600;">
                Hi ${name},
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">
                Welcome to SmartHoster! Your accountant account has been successfully created. You now have access to financial reports, tax files, and accounting tools.
              </p>

              <!-- Login Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1f2937; font-weight: 600;">
                      📋 Your Login Credentials
                    </h2>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #6b7280; font-size: 14px;">Email:</strong>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <span style="color: #1f2937; font-size: 14px; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 8px; border-radius: 4px;">${email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #6b7280; font-size: 14px;">Password:</strong>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <span style="color: #1f2937; font-size: 14px; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${password}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Login Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #38bdf8 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.25);">
                      Login to Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280; text-align: center;">
                Portal URL: <a href="${portalUrl}" style="color: #2563eb; text-decoration: none;">${portalUrl}</a>
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <!-- What You Can Do Section -->
              <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937; font-weight: 600;">
                📊 What You Can Do:
              </h3>
              
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                <li>Access financial reports and statements</li>
                <li>Generate SAFT-T tax files for clients</li>
                <li>Download invoices and payment records</li>
                <li>Track bookings and revenue across properties</li>
                <li>Monitor owner accounts and transactions</li>
                <li>Export financial data for accounting software</li>
              </ul>

              <!-- Security Tip Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                      🔒 <strong>Security Tip:</strong> We recommend changing your password after your first login for better security. You can do this in Settings or use the Forgot Password option.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Support Section -->
              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                Need help? Contact us at 
                <a href="mailto:contact@smarthoster.io" style="color: #16a34a; text-decoration: none; font-weight: 600;">
                  contact@smarthoster.io
                </a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937; font-weight: 600;">
                Best regards,<br>
                The SmartHoster Team
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} SmartHoster. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to accountant ${email}:`, info.messageId);
    return true;

  } catch (error: any) {
    console.error(`❌ Error sending welcome email to accountant ${data.email}:`, error.message);
    return false;
  }
};

