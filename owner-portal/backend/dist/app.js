"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const otp_routes_1 = __importDefault(require("./routes/otp.routes"));
const welcomeEmail_routes_1 = __importDefault(require("./routes/welcomeEmail.routes"));
const calendar_routes_1 = __importDefault(require("./routes/calendar.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const propertyManagement_routes_1 = __importDefault(require("./routes/propertyManagement.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const performance_routes_1 = __importDefault(require("./routes/performance.routes"));
const touristTax_routes_1 = __importDefault(require("./routes/touristTax.routes"));
const siba_routes_1 = __importDefault(require("./routes/siba.routes"));
const sibaManager_routes_1 = __importDefault(require("./routes/sibaManager.routes"));
const saft_routes_1 = __importDefault(require("./routes/saft.routes"));
const hostkitProperty_routes_1 = __importDefault(require("./routes/hostkitProperty.routes"));
const statements_routes_1 = __importDefault(require("./routes/statements.routes"));
const creditNote_routes_1 = __importDefault(require("./routes/creditNote.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const portfolio_routes_1 = __importDefault(require("./routes/portfolio.routes"));
require("./cron/autoEmail");
require("./cron/dailyDigest");
require("./cron/automations");
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const automation_routes_1 = __importDefault(require("./routes/automation.routes"));
const advancedCalendar_routes_1 = __importDefault(require("./routes/advancedCalendar.routes"));
const propertyMapping_routes_1 = __importDefault(require("./routes/propertyMapping.routes"));
const reservation_routes_1 = __importDefault(require("./routes/reservation.routes"));
const ownerStatements_routes_1 = __importDefault(require("./routes/ownerStatements.routes"));
const debug_routes_1 = __importDefault(require("./routes/debug.routes"));
const imageUpload_routes_1 = __importDefault(require("./routes/imageUpload.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const keepAlive_1 = require("./utils/keepAlive");
const app = (0, express_1.default)();
app.use('/saft/files', express_1.default.static(path_1.default.join(__dirname, 'saft_files')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../public/images')));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: true, // Allow all origins for now (temporary)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json());
app.use("/health", health_routes_1.default);
app.use("/auth", auth_routes_1.default);
app.use("/otp", otp_routes_1.default);
app.use("/welcome-email", welcomeEmail_routes_1.default);
app.use("/calendar", calendar_routes_1.default);
app.use("/bookings", booking_routes_1.default);
app.use("/property-management", propertyManagement_routes_1.default);
app.use("/invoices", invoice_routes_1.default);
app.use("/performance", performance_routes_1.default);
app.use("/properties", touristTax_routes_1.default);
app.use("/properties", siba_routes_1.default);
app.use("/siba-manager", sibaManager_routes_1.default);
app.use("/saft", saft_routes_1.default);
app.use("/api", hostkitProperty_routes_1.default);
app.use("/expenses", expense_routes_1.default);
app.use("/automations", automation_routes_1.default);
app.use("/advanced-calendar", advancedCalendar_routes_1.default);
app.use("/property-mappings", propertyMapping_routes_1.default);
app.use("/reservations", reservation_routes_1.default);
app.use("/owner-statements", ownerStatements_routes_1.default);
app.use("/debug", debug_routes_1.default);
app.use("/image-upload", imageUpload_routes_1.default);
app.use("/credit-notes", creditNote_routes_1.default);
app.use("/reviews", review_routes_1.default);
app.use("/portfolio", portfolio_routes_1.default);
app.use("/settings", settings_routes_1.default);
app.use("/admin", admin_routes_1.default);
app.use("/test", test_routes_1.default);
// Vercel Cron Job endpoint for MongoDB keep-alive
app.post("/api/cron/keep-alive", async (req, res) => {
    const startTime = Date.now();
    console.log('🔄 Vercel cron job started:', new Date().toISOString());
    try {
        // Ensure temp collection exists
        await (0, keepAlive_1.ensureTempCollection)();
        // Execute MongoDB keep-alive directly
        const pingSuccess = await (0, keepAlive_1.pingMongoDB)();
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
        }
        else {
            throw new Error('MongoDB keep-alive ping failed');
        }
    }
    catch (error) {
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
app.use(statements_routes_1.default);
// Serve saved statement files
app.use("/statements", express_1.default.static(path_1.default.join(process.cwd(), "statements")));
exports.default = app;
