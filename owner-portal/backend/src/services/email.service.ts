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
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
              <img src="data:image/jpeg;base64,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" alt="SmartHoster Logo" style="width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 12px; background: white; padding: 5px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                SmartHoster Owner Portal
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
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
                    <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
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
                <a href="mailto:contact@smarthoster.io" style="color: #2563eb; text-decoration: none; font-weight: 600;">
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
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
              <img src="data:image/jpeg;base64,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" alt="SmartHoster Logo" style="width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 12px; background: white; padding: 5px; display: block; margin-left: auto; margin-right: auto; border: 2px solid #ffffff;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                📊 SmartHoster Accountant Portal
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
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
                    <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
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
                <a href="mailto:contact@smarthoster.io" style="color: #2563eb; text-decoration: none; font-weight: 600;">
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

