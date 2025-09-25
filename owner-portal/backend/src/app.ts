import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from 'path';
import mongoose from 'mongoose';
import { ensureDBConnection } from './config/db';
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import otpRoutes from "./routes/otp.routes";
import calendarRoutes from "./routes/calendar.routes";
import bookingRoutes from "./routes/booking.routes";
import propertyManagementRoutes from "./routes/propertyManagement.routes";
import invoiceRoutes from "./routes/invoice.routes";
import performanceRoutes from "./routes/performance.routes";
import touristTaxRoutes from "./routes/touristTax.routes";
import sibaStatusRoutes from "./routes/siba.routes";
import sibaManagerRoutes from "./routes/sibaManager.routes";
import saftRoutes from './routes/saft.routes';
import hostkitPropertyRoutes from './routes/hostkitProperty.routes';
import statementsRoutes from "./routes/statements.routes";
import creditNoteRoutes from "./routes/creditNote.routes";
import reviewRoutes from "./routes/review.routes";
import portfolioRoutes from "./routes/portfolio.routes";
import './cron/autoEmail';
import './cron/dailyDigest';
import './cron/automations';
import expensesRoutes from './routes/expense.routes';
import automationRoutes from './routes/automation.routes';
import advancedCalendarRoutes from './routes/advancedCalendar.routes';
import propertyMappingRoutes from './routes/propertyMapping.routes';
import reservationRoutes from './routes/reservation.routes';
import ownerStatementsRoutes from './routes/ownerStatements.routes';
import debugRoutes from './routes/debug.routes';
import imageUploadRoutes from './routes/imageUpload.routes';
import settingsRoutes from './routes/settings.routes';
import adminRoutes from './routes/admin.routes';
import testRoutes from './routes/test.routes';
import { pingMongoDB, ensureTempCollection } from './utils/keepAlive';

const app = express();
app.use('/saft/files', express.static(path.join(__dirname, 'saft_files')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://smarthoster.io',
    'https://test.smarthoster.io',
    'https://dashboard.smarthoster.io',
    // Vercel domains for testing
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.vercel\.dev$/,
    // Specific frontend domain
    'https://smarthoster-test-deploy-owner-porta.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Database connection middleware for serverless functions
app.use(async (req, res, next) => {
  try {
    // Skip database check for health routes
    if (req.path.startsWith('/health') || req.path.startsWith('/test')) {
      return next();
    }
    
    // Ensure database connection is established
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Database not connected, establishing connection...');
      await ensureDBConnection();
      console.log('✅ Database connection established');
    }
    
    next();
  } catch (error: any) {
    console.error('❌ Database connection middleware error:', error.message);
    res.status(503).json({ 
      error: 'Database connection failed', 
      message: 'Service temporarily unavailable' 
    });
  }
});

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/otp", otpRoutes);
app.use("/calendar", calendarRoutes);
app.use("/bookings", bookingRoutes);
app.use("/property-management", propertyManagementRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/performance", performanceRoutes);
app.use("/properties", touristTaxRoutes);
app.use("/properties", sibaStatusRoutes);
app.use("/siba-manager", sibaManagerRoutes);
app.use("/saft", saftRoutes);
app.use("/api", hostkitPropertyRoutes);
app.use("/expenses", expensesRoutes);
app.use("/automations", automationRoutes);
app.use("/advanced-calendar", advancedCalendarRoutes);
app.use("/property-mappings", propertyMappingRoutes);
app.use("/reservations", reservationRoutes);
app.use("/owner-statements", ownerStatementsRoutes);
app.use("/debug", debugRoutes);
app.use("/image-upload", imageUploadRoutes);
app.use("/credit-notes", creditNoteRoutes);
app.use("/reviews", reviewRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/settings", settingsRoutes);
app.use("/admin", adminRoutes);
app.use("/test", testRoutes);

// Vercel Cron Job endpoint for MongoDB keep-alive
app.post("/api/cron/keep-alive", async (req, res) => {
  const startTime = Date.now();
  console.log('🔄 Vercel cron job started:', new Date().toISOString());

  try {
    // Ensure temp collection exists
    await ensureTempCollection();
    
    // Execute MongoDB keep-alive directly
    const pingSuccess = await pingMongoDB();
    
    const responseTime = Date.now() - startTime;
    
    if (pingSuccess) {
      console.log('✅ MongoDB keep-alive successful:', {
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      });

      // Return success response
      res.status(200).json({ 
        success: true,
        message: 'MongoDB keep-alive completed successfully',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        environment: process.env.NODE_ENV
      });
    } else {
      throw new Error('MongoDB keep-alive ping failed');
    }

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    console.error('❌ MongoDB keep-alive failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    });

    // Return error response (but don't fail the cron job)
    res.status(500).json({ 
      success: false,
      message: 'MongoDB keep-alive failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    });
  }
});

app.use(statementsRoutes);

// Serve saved statement files
app.use("/statements", express.static(path.join(process.cwd(), "statements")));

export default app;
