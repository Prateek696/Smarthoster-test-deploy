"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || "",
    nodeEnv: process.env.NODE_ENV || "development",
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
    smtp: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
        from: process.env.EMAIL_FROM || "",
    },
    hostaway: {
        apiKey: process.env.HOSTAWAY_API_KEY || "",
        apiSecret: process.env.HOSTAWAY_API_SECRET || "",
        apiBase: process.env.HOSTAWAY_API_BASE || "https://api.hostaway.com/v1",
        accountId: process.env.HOSTAWAY_ACCOUNT_ID || "",
        token: process.env.HOSTAWAY_TOKEN || "",
    },
    hostkit: {
        apiUrl: process.env.HOSTKIT_API_URL || "https://app.hostkit.pt/api",
        apiKey: process.env.HOSTKIT_API_KEY || "", // Keep for backward compatibility
        // Hostkit ID-specific API keys (using actual Hostkit IDs)
        apiKeys: {
            "10027": process.env.HOSTKIT_API_KEY_10027 || "", // Property 392776 - Piece of Heaven
            "10028": process.env.HOSTKIT_API_KEY_10028 || "", // Property 392779 - Lote 12 4-A
            "10029": process.env.HOSTKIT_API_KEY_10029 || "", // Property 392778 - Lote 8 4-B
            "10030": process.env.HOSTKIT_API_KEY_10030 || "", // Property 392777 - Lote 16 Pt 1 3-B
            "10031": process.env.HOSTKIT_API_KEY_10031 || "", // Property 392781 - Lote 7 3-A
            "10032": process.env.HOSTKIT_API_KEY_10032 || "", // Property 392780 - Lote 16 Pt1 4-B
            "12602": process.env.HOSTKIT_API_KEY_12602 || "", // Property 414661 - Waterfront Pool Penthouse View
        }
    },
    siba: {
        apiUrl: process.env.SIBA_API_URL || "https://api.municipal.gov/siba",
        apiToken: process.env.MUNICIPAL_API_TOKEN || "",
    },
    storage: {
        uploadDir: process.env.UPLOAD_DIR || "./uploads",
        statementsDir: process.env.STATEMENTS_DIR || "./statements",
        saftFilesDir: process.env.SAFT_FILES_DIR || "./src/saft_files",
    }
};
