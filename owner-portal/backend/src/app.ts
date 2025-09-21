import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from 'path';
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
    /^https:\/\/.*\.vercel\.dev$/
  ],
  credentials: true
}));
app.use(express.json());
app.use(saftRoutes);
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
app.use("/properties", saftRoutes);
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

app.use(statementsRoutes);

// Serve saved statement files
app.use("/statements", express.static(path.join(process.cwd(), "statements")));

export default app;
