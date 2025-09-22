"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AutomationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['saft_generation', 'siba_alerts', 'calendar_sync']
    },
    schedule: {
        type: String,
        required: true,
        default: '0 9 2 * *' // Default: 2nd of each month at 9 AM
    },
    config: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'paused', 'disabled'],
        default: 'active'
    },
    userId: {
        type: String,
        required: true
    },
    propertyId: {
        type: Number,
        required: false
    },
    runCount: {
        type: Number,
        default: 0
    },
    lastRunAt: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
});
// Indexes for better query performance
AutomationSchema.index({ userId: 1 });
AutomationSchema.index({ propertyId: 1 });
AutomationSchema.index({ type: 1 });
AutomationSchema.index({ status: 1 });
exports.AutomationModel = mongoose_1.default.model('Automation', AutomationSchema);
